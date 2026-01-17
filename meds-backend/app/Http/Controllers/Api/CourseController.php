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

        $packSize = (int) ($data['pack_size'] ?? 0);

        // If Add Medication form doesn't send stock fields, assume 1 full pack in stock:
        // packs_on_hand = 0, loose_units = pack_size, opening_units = pack_size
        $hasAnyStockField =
            array_key_exists('packs_on_hand', $data) ||
            array_key_exists('loose_units', $data) ||
            array_key_exists('opening_units', $data);

        if (!$hasAnyStockField) {
            $data['packs_on_hand'] = 0;
            $data['loose_units']   = max($packSize, 0);
            $data['opening_units'] = max($packSize, 0);
        } else {
            // Normalize if any stock fields were provided (e.g. older clients)
            $data['packs_on_hand'] = (int) ($data['packs_on_hand'] ?? 0);
            $data['loose_units']   = (int) ($data['loose_units'] ?? 0);

            // If opening_units not sent, derive it from pack info
            if (!array_key_exists('opening_units', $data) || $data['opening_units'] === null) {
                $data['opening_units'] = ($packSize * $data['packs_on_hand']) + $data['loose_units'];
            } else {
                $data['opening_units'] = (int) $data['opening_units'];
            }
        }

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
        'add_packs'       => ['nullable', 'integer', 'min:0'],
        'add_loose_units' => ['nullable', 'integer', 'min:0'],
        'restock_date'    => ['nullable', 'date'],
        // optional note
        'note'            => ['nullable', 'string', 'max:500'],
    ]);

    $addPacks = (int) ($data['add_packs'] ?? 0);
    $addLoose = (int) ($data['add_loose_units'] ?? 0);

    $baseDate = !empty($data['restock_date'])
        ? Carbon::parse($data['restock_date'], 'Europe/London')
        : now('Europe/London');

    return DB::transaction(function () use ($request, $course, $data, $addPacks, $addLoose, $baseDate) {

        // BEFORE snapshot (full stock + baseline)
        $before = $course->only([
            'pack_size', 'packs_on_hand', 'loose_units', 'opening_units', 'start_date',
            'half_date', 'runout_date'
        ]);

        // 1) compute what is actually remaining as of restock date
        $currentRemaining = $this->currentUnitsRemaining($course, $baseDate);

        // 2) add delivered stock
        $packSize = (int) $course->pack_size;
        $deltaUnits = ($addPacks * $packSize) + $addLoose;

        if ($deltaUnits <= 0) {
            return response()->json([
                'message' => 'Nothing to restock. Please enter packs or loose units to add.',
            ], 422);
        }

        $newTotalUnits = $currentRemaining + $deltaUnits;

        // 3) normalize & RESET BASELINE (this is the key!)
        $normalized = $this->normalizeUnitsToPacks($newTotalUnits, $packSize);

        $merged = array_merge($course->toArray(), [
            'packs_on_hand'  => $normalized['packs_on_hand'],
            'loose_units'    => $normalized['loose_units'],
            'opening_units'  => $newTotalUnits,
            'start_date'     => $baseDate->toDateString(),
        ]);

        // recompute dates based on the new baseline
        $merged = $this->computeDates($merged, $baseDate);

        $course->update($merged);
        $this->resetSchedulesForCourse($course);
        $course->refresh();

        $after = $course->only([
            'pack_size', 'packs_on_hand', 'loose_units', 'opening_units', 'start_date',
            'half_date', 'runout_date'
        ]);

            RestockLog::create([
                'user_id'      => $request->user()->id,
                'course_id'    => $course->id,
                'client_id'    => $course->client_id ?? null,
                'action'       => 'restock',
                'before'       => $before,
                'after'        => array_merge($after, [
                    'delta_units' => $deltaUnits,
                    'delta_packs' => $addPacks,
                    'delta_loose' => $addLoose,
                    'note'        => $data['note'] ?? null,
                ]),
                'restock_date' => $baseDate->toDateString(),
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


    private function currentUnitsRemaining(MedicationCourse $course, Carbon $asOf): int
{
    $packSize = (int) $course->pack_size;
    $packs    = (int) $course->packs_on_hand;
    $loose    = (int) ($course->loose_units ?? 0);
    $opening  = (int) ($course->opening_units ?? 0);
    $dailyUse = (float) ($course->daily_use ?? 0);

    $baseTotal = max(($packSize * $packs) + $loose, $opening);

    // If no start_date or daily_use, no countdown applied
    if (!$course->start_date || $dailyUse <= 0) {
        return max($baseTotal, 0);
    }

    $start = $course->start_date instanceof Carbon
        ? $course->start_date->copy()
        : Carbon::parse($course->start_date, 'Europe/London');

    $days = $start->copy()->startOfDay()->diffInDays($asOf->copy()->startOfDay());



    $remaining = (int) floor($baseTotal - ($dailyUse * $days));

    return max($remaining, 0);
}

private function normalizeUnitsToPacks(int $totalUnits, int $packSize): array
{
    if ($packSize <= 0) {
        // avoid division by zero; store everything as loose
        return ['packs_on_hand' => 0, 'loose_units' => max($totalUnits, 0)];
    }

    $totalUnits = max($totalUnits, 0);

    return [
        'packs_on_hand' => intdiv($totalUnits, $packSize),
        'loose_units'   => $totalUnits % $packSize,
    ];
}

public function adjustStock(Request $request, MedicationCourse $course)
{
    $data = $request->validate([
        // either send total_units OR packs_on_hand+loose_units
        'total_units'   => ['nullable', 'integer', 'min:0'],
        'packs_on_hand' => ['nullable', 'integer', 'min:0'],
        'loose_units'   => ['nullable', 'integer', 'min:0'],

        'adjustment_date' => ['nullable', 'date'],
        'reason'          => ['required', 'string', 'max:255'],
    ]);


    $hasTotal = array_key_exists('total_units', $data) && $data['total_units'] !== null;
    $hasParts = array_key_exists('packs_on_hand', $data) || array_key_exists('loose_units', $data);

    if (!$hasTotal && !$hasParts) {
        return response()->json([
            'message' => 'Provide either total_units or packs_on_hand/loose_units.',
        ], 422);
    }


    $baseDate = !empty($data['adjustment_date'])
        ? Carbon::parse($data['adjustment_date'], 'Europe/London')
        : now('Europe/London');

    return DB::transaction(function () use ($request, $course, $data, $baseDate) {

        $before = $course->only([
            'pack_size', 'packs_on_hand', 'loose_units', 'opening_units', 'start_date',
            'half_date', 'runout_date'
        ]);

        $packSize = (int) $course->pack_size;

        if (array_key_exists('total_units', $data) && $data['total_units'] !== null) {
            $newTotalUnits = (int) $data['total_units'];
            $normalized = $this->normalizeUnitsToPacks($newTotalUnits, $packSize);
        } else {
            $packs = (int) ($data['packs_on_hand'] ?? 0);
            $loose = (int) ($data['loose_units'] ?? 0);
            $newTotalUnits = ($packSize * $packs) + $loose;
            $normalized = $this->normalizeUnitsToPacks($newTotalUnits, $packSize);
        }

        // RESET BASELINE to "truth as of adjustment_date"
        $merged = array_merge($course->toArray(), [
            'packs_on_hand' => $normalized['packs_on_hand'],
            'loose_units'   => $normalized['loose_units'],
            'opening_units' => $newTotalUnits,
            'start_date'    => $baseDate->toDateString(),
        ]);

        $merged = $this->computeDates($merged, $baseDate);

        $course->update($merged);
        $this->resetSchedulesForCourse($course);
        $course->refresh();

        $after = $course->only([
            'pack_size', 'packs_on_hand', 'loose_units', 'opening_units', 'start_date',
            'half_date', 'runout_date'
        ]);

        RestockLog::create([
            'user_id'      => $request->user()->id,
            'course_id'    => $course->id,
            'client_id'    => $course->client_id ?? null,
            'action'       => 'adjustment',
            'before'       => $before,
            'after'        => array_merge($after, [
                'reason' => $data['reason'],
            ]),
            'restock_date' => $baseDate->toDateString(),
        ]);

        return new CourseResource($course->load(['client.service', 'schedules']));
    });
}



}
