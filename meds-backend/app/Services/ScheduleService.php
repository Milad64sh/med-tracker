<?php

namespace App\Services;

use App\Models\MedicationCourse;
use App\Models\Schedule;
use Carbon\Carbon;
class ScheduleService
{
    public function reschedule(MedicationCourse $c): void
    {
        Schedule::where('course_id', $c->id)->delete();

        // Same expressions as DashboardController
        $unitsExpr = <<<SQL
            CASE
                WHEN start_date IS NOT NULL AND daily_use > 0 THEN
                    GREATEST(
                        GREATEST(
                            (pack_size * packs_on_hand) + COALESCE(loose_units, 0),
                            opening_units
                        )
                        - (daily_use * GREATEST((CURRENT_DATE - start_date::date), 0)),
                        0
                    )
                ELSE
                    GREATEST(
                        (pack_size * packs_on_hand) + COALESCE(loose_units, 0),
                        opening_units
                    )
            END
        SQL;

        $daysExpr = <<<SQL
            CASE
                WHEN daily_use > 0 THEN
                    CEIL( ($unitsExpr) / NULLIF(daily_use, 0) )
                ELSE NULL
            END
        SQL;

        $runoutExpr = <<<SQL
            CASE
                WHEN ($daysExpr) IS NOT NULL THEN
                    (CURRENT_DATE + (($daysExpr) * INTERVAL '1 day'))::date
                ELSE NULL
            END
        SQL;

        $row = MedicationCourse::query()
            ->where('id', $c->id)
            ->selectRaw("$runoutExpr as computed_runout_date")
            ->first();

        $computedRunout = $row?->computed_runout_date; // string date usually

        foreach (['half' => $c->half_date, 'runout' => $computedRunout] as $type => $date) {
            if (!$date) continue;

            Schedule::create([
                'course_id' => $c->id,
                'type'      => $type,
                'fire_at'   => Carbon::parse($date . ' 09:00', 'Europe/London')->utc(),
            ]);
        }
    }
}

