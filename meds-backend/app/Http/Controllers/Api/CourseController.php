<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\MedicationCourse;
use App\Models\RestockLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    /**
     * GET /api/courses
     * Return all medication courses with client, service + schedules (for dashboard).
     */
    public function index()
    {
        $courses = MedicationCourse::with(['client.service', 'schedules'])
            ->orderByDesc('created_at')
            ->get();

        return CourseResource::collection($courses);
    }

    /**
     * POST /api/courses
     */
    public function store(StoreCourseRequest $request)
    {
        $data = $request->validated();

        // Compute dates + totals
        $data = $this->computeDates($data);

        $course = DB::transaction(function () use ($data) {
            /** @var MedicationCourse $course */
            $course = MedicationCourse::create($data);

            $this->resetSchedulesForCourse($course);

            return $course->load(['client.service', 'schedules']);
        });

        return (new CourseResource($course))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/courses/{course}
     * Single course with client, service and schedules.
     */
    public function show(MedicationCourse $course)
    {
        return new CourseResource(
            $course->load(['client.service', 'schedules'])
        );
    }

    /**
     * PUT/PATCH /api/courses/{course}
     */
    public function update(StoreCourseRequest $request, MedicationCourse $course)
    {
        $data = $request->validated();

        // For PATCH-style updates, fall back to existing values if not sent
        $merged = array_merge($course->toArray(), $data);

        $merged = $this->computeDates($merged);

        $course = DB::transaction(function () use ($course, $merged) {
            $course->update($merged);

            $this->resetSchedulesForCourse($course);

            return $course->load(['client.service', 'schedules']);
        });

        return new CourseResource($course);
    }

    /**
     * DELETE /api/courses/{course}
     */
    public function destroy(MedicationCourse $course)
    {
        $course->delete();

        return response()->noContent(); // 204
    }

        /**
     * PATCH /api/courses/{course}/restock
     * Partial update: only stock fields (pack size, packs on hand, etc.).
     */

    public function restock(Request $request, MedicationCourse $course)
    {
        $data = $request->validate([
            'pack_size'     => ['nullable', 'integer', 'min:0'],
            'packs_on_hand' => ['nullable', 'integer', 'min:0'],
            'loose_units'   => ['nullable', 'integer', 'min:0'],
            'opening_units' => ['nullable', 'integer', 'min:0'],
            'restock_date'  => ['nullable', 'date'],
        ]);

        $base = !empty($data['restock_date'])
            ? Carbon::parse($data['restock_date'], 'Europe/London')
            : null;

        return DB::transaction(function () use ($request, $course, $data, $base) {

            // snapshot BEFORE anything changes
            $before = $course->only([
                'pack_size', 'packs_on_hand', 'loose_units', 'opening_units', 'restock_date'
            ]);

            // Merge with current values so computeDates has full context
            $merged = array_merge($course->toArray(), $data);

            // Recompute runout_date / half_date based on new stock
            $merged = $this->computeDates($merged, $base);

            // Apply updates
            $course->update($merged);

            // Reset schedules after update
            $this->resetSchedulesForCourse($course);

            // Reload (optional but helps keep consistent snapshot)
            $course->refresh();

            // snapshot AFTER update
            $after = $course->only([
                'pack_size', 'packs_on_hand', 'loose_units', 'opening_units', 'restock_date'
            ]);

            // Write audit log (option 1: before/after)
            RestockLog::create([
                'user_id'     => $request->user()->id,
                'course_id'   => $course->id,
                'client_id'   => $course->client_id ?? null,
                'action'      => 'restock',
                'before'      => $before,
                'after'       => $after,
                'restock_date'=> $course->restock_date,
            ]);

            return new CourseResource($course->load(['client.service', 'schedules']));
        });
    }


    // -----------------------
    // Helpers
    // -----------------------

    /**
     * Compute runout_date and half_date based on your business rules:
     * - totalUnits = max(pack info, opening_units)
     * - only compute when daily_use > 0
     */
    private function computeDates(array $data, ?Carbon $baseDate = null): array
    {
        $dosePerAdmin = (float) ($data['dose_per_admin'] ?? 0);
        $adminsPerDay = (float) ($data['admins_per_day'] ?? 0);

        if (empty($data['daily_use']) || (float)$data['daily_use'] <= 0) {
            $data['daily_use'] = $dosePerAdmin * $adminsPerDay;
        }

        $dailyUse     = (float) ($data['daily_use'] ?? 0);
        $packSize     = (int)   ($data['pack_size'] ?? 0);
        $packsOnHand  = (int)   ($data['packs_on_hand'] ?? 0);
        $looseUnits   = (int)   ($data['loose_units'] ?? 0);
        $openingUnits = (int)   ($data['opening_units'] ?? 0);

        $totalUnitsFromPacks = ($packSize * $packsOnHand) + $looseUnits;
        $totalUnits          = max($totalUnitsFromPacks, $openingUnits);

        // ✅ base date:
        // - if provided (restock), use it
        // - otherwise fall back to stored start_date (create/update flows)
        if ($baseDate) {
            $startDate = $baseDate->copy();
        } elseif (!empty($data['start_date'])) {
            $startDate = Carbon::parse($data['start_date']);
        } else {
            return $data;
        }

        if ($dailyUse > 0) {
            $daysToRunout        = (int) ceil($totalUnits / $dailyUse);
            $data['runout_date'] = $startDate->copy()->addDays($daysToRunout)->toDateString();
            $data['half_date']   = $startDate->copy()->addDays((int) ceil($daysToRunout / 2))->toDateString();
        }

        return $data;
    }

    /**
     * Delete and recreate schedules for the given course based on half/runout dates.
     */
    private function resetSchedulesForCourse(MedicationCourse $course): void
    {
        $course->schedules()->delete();

        if ($course->half_date) {
            // half_date may already be a Carbon instance if casted
            $half = $course->half_date instanceof Carbon
                ? $course->half_date->copy()
                : Carbon::parse($course->half_date, 'Europe/London');

            $fireAt = $half
                ->setTimeFromTimeString('09:00') // 09:00 local
                ->utc();                         // store as UTC

            $course->schedules()->create([
                'type'    => 'half',
                'fire_at' => $fireAt,
            ]);
        }

        if ($course->runout_date) {
            $runout = $course->runout_date instanceof Carbon
                ? $course->runout_date->copy()
                : Carbon::parse($course->runout_date, 'Europe/London');

            $fireAt = $runout
                ->setTimeFromTimeString('09:00')
                ->utc();

            $course->schedules()->create([
                'type'    => 'runout',
                'fire_at' => $fireAt,
            ]);
        }
    }



}
