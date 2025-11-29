<?php

namespace App\Services;

use App\Models\MedicationCourse;
use Carbon\CarbonImmutable;

class CourseService
{
    public function __construct(
        protected ScheduleService $scheduleService
    ) {}

    public function compute(array $d): array
    {
        $du = max((float) $d['dose_per_admin'] * (float) $d['admins_per_day'], 0.001);
        $open = (int) $d['pack_size'] * (int) $d['packs_on_hand'] + (int) ($d['loose_units'] ?? 0);
        $start = CarbonImmutable::parse($d['start_date'])->startOfDay();

        return [
            'daily_use'      => $du,
            'opening_units'  => $open,
            'half_date'      => $start->addDays((int) floor(($open / 2) / $du))->toDateString(),
            'runout_date'    => $start->addDays((int) floor($open / $du))->toDateString(),
        ];
    }

    public function fillAndSave(MedicationCourse $c, array $payload): MedicationCourse
    {
        // 1) fill computed fields
        $c->fill(array_merge($payload, $this->compute($payload)))->save();

        // 2) regenerate schedules for this course
        $this->scheduleService->reschedule($c);

        // 3) return fresh instance (with relationships if needed)
        return $c->refresh();
    }
}
