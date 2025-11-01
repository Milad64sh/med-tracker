<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\MedicationCourse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    public function store(StoreCourseRequest $request)
    {
        $data = $request->validated();

        // --- Compute half_date / runout_date if missing ---
        // Ensure numeric types
        $dailyUse     = (float) ($data['daily_use'] ?? 0);
        $packSize     = (int)   ($data['pack_size'] ?? 0);
        $packsOnHand  = (int)   ($data['packs_on_hand'] ?? 0);
        $looseUnits   = (int)   ($data['loose_units'] ?? 0);
        $openingUnits = (int)   ($data['opening_units'] ?? 0);

        $totalUnitsFromPacks = ($packSize * $packsOnHand) + $looseUnits;

        // Business rule: whichever is larger between computed units and opening_units
        $totalUnits = max($totalUnitsFromPacks, $openingUnits);

        // Dates
        $startDate = Carbon::parse($data['start_date']);

        // Only compute if dailyUse > 0 and values are sensible
        if ($dailyUse > 0 && empty($data['runout_date'])) {
            $daysToRunout = (int) ceil($totalUnits / $dailyUse);
            $data['runout_date'] = $startDate->copy()->addDays($daysToRunout)->toDateString();
        }

        if ($dailyUse > 0 && empty($data['half_date'])) {
            // If runout days known, half point = ceil(days/2)
            $daysToRunout  = isset($daysToRunout)
                ? $daysToRunout
                : (int) ceil($totalUnits / $dailyUse);
            $data['half_date'] = $startDate->copy()->addDays((int) ceil($daysToRunout / 2))->toDateString();
        }

        // --- Persist + seed schedules in one atomic transaction ---
        $course = DB::transaction(function () use ($data) {
            /** @var MedicationCourse $course */
            $course = MedicationCourse::create($data);

            // Seed schedules if dates exist
            if ($course->half_date) {
                $course->schedules()->create([
                    'type'    => 'half',
                    // normalize to start of day (app timezone)
                    'fire_at' => Carbon::parse($course->half_date)->startOfDay(),
                ]);
            }

            if ($course->runout_date) {
                $course->schedules()->create([
                    'type'    => 'runout',
                    'fire_at' => Carbon::parse($course->runout_date)->startOfDay(),
                ]);
            }

            return $course->load('schedules');
        });

        // Return a resource with 201 Created
        return (new CourseResource($course))
            ->response()
            ->setStatusCode(201);
    }
}
