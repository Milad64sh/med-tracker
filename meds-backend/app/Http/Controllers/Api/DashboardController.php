<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicationCourse;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Mail\GpMedicationAlertMail;
use Illuminate\Support\Facades\Mail;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        /**
         * Single source of truth:
         * - Compute units_remaining first
         * - Derive days_remaining from units_remaining and daily_use
         * - Derive runout_date from days_remaining
         */

        // Compute remaining units (live countdown)
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

        // Derive days_remaining from units_remaining (prevents mismatch)
        // Use CEIL so if there are any units left today, it counts as time remaining.
        $daysExpr = <<<SQL
            CASE
                WHEN daily_use > 0 THEN
                    CEIL( ($unitsExpr) / NULLIF(daily_use, 0) )
                ELSE NULL
            END
        SQL;

        // Derive runout_date from derived days_remaining (prevents stale runout_date column)
        $runoutExpr = <<<SQL
            CASE
                WHEN ($daysExpr) IS NOT NULL THEN
                    (CURRENT_DATE + (($daysExpr) * INTERVAL '1 day'))::date
                ELSE NULL
            END
        SQL;

        // KPI counts (based on derived days)
        $critical = MedicationCourse::whereRaw("($daysExpr) <= 2")->count();
        $low      = MedicationCourse::whereRaw("($daysExpr) BETWEEN 3 AND 7")->count();
        $ok       = MedicationCourse::whereRaw("($daysExpr) >= 8")->count();

        // If you add orders later, replace this with a real count
        $pendingOrders = 0;

        // Next scheduled notification (uses your 'fire_at' column)
        $nextScheduleAt = Schedule::where('fire_at', '>=', now())
            ->orderBy('fire_at')
            ->value('fire_at');

        // Top urgent alerts
        $alerts = MedicationCourse::query()
            ->with(['client.service', 'ackUser', 'snoozeUser'])
            ->select('*')
            ->addSelect(DB::raw("($daysExpr)::int as days_remaining"))
            ->addSelect(DB::raw("($unitsExpr)::int as units_remaining"))
            ->addSelect(DB::raw("$runoutExpr as computed_runout_date"))
            ->orderBy('client_id')
            ->orderByRaw('days_remaining ASC NULLS LAST')
            ->get()
            ->map(function ($c) {
                $days  = is_null($c->days_remaining) ? null : (int) $c->days_remaining;
                $units = is_null($c->units_remaining) ? null : (int) $c->units_remaining;

                $client  = $c->client;
                $service = $client ? $client->service : null;

                $clientName = $client?->name ?? 'Unknown client';
                $serviceName = $service?->name ?? $service?->label ?? 'Unknown service';

                $medicationName = $c->medication_name ?? $c->name ?? null;

                $ackAt = $c->acknowledged_at?->toISOString();
                $ackByName = $c->ackUser?->name;

                $snoozedUntil = $c->snoozed_until?->toISOString();
                $snoozedByName = $c->snoozeUser?->name;

                // computed_runout_date comes back as a date string in many cases,
                // but could be a Carbon/date instance depending on driver/casting.
                $runout = $c->computed_runout_date;
                if ($runout instanceof \DateTimeInterface) {
                    $runout = $runout->format('Y-m-d');
                } elseif (is_string($runout)) {
                    // already fine
                } else {
                    $runout = null;
                }

                return [
                    'course_id'      => (int) $c->id,
                    'medication'     => $medicationName,
                    'days_remaining' => $days,

                    // Use computed runout date so it always matches units/days
                    'runout_date'    => $runout,

                    // Keep half_date as stored (if you want, we can compute it too)
                    'half_date'      => optional($c->half_date)->toDateString(),

                    'client'         => [
                        'id'       => $client ? (int) $client->id : null,
                        'name'     => $clientName,
                        'initials' => $client?->initials,
                        'dob'      => optional($client?->dob)->toDateString(),
                        'gp_email' => $client?->gp_email,
                        'service'  => [
                            'id'   => $service ? (int) $service->id : null,
                            'name' => $serviceName,
                        ],
                    ],

                    'ack' => [
                        'acknowledged_at' => $ackAt,
                        'acknowledged_by' => $c->acknowledged_by ? (int) $c->acknowledged_by : null,
                        'acknowledged_by_name' => $ackByName,
                        'note' => $c->ack_note,
                    ],

                    'snooze' => [
                        'snoozed_until' => $snoozedUntil,
                        'snoozed_by' => $c->snoozed_by ? (int) $c->snoozed_by : null,
                        'snoozed_by_name' => $snoozedByName,
                        'note' => $c->snooze_note,
                    ],

                    'status'          => $this->statusFromDays($days),
                    'units_remaining' => $units,
                ];
            });

        return response()->json([
            'kpis' => [
                'critical'       => $critical,
                'low'            => $low,
                'ok'             => $ok,
                'pendingOrders'  => $pendingOrders,
                'nextScheduleAt' => $nextScheduleAt
                    ? Carbon::parse($nextScheduleAt)->toISOString()
                    : null,
            ],
            'alerts' => $alerts,
        ]);
    }

    public function emailGp(Request $request)
    {
        $data = $request->validate([
            'gp_email'     => ['required', 'email'],
            'client_name'  => ['required', 'string', 'max:255'],
            'dob'          => ['required', 'string', 'max:50'],
            'service_name' => ['nullable', 'string', 'max:255'],

            'medications'  => ['required', 'array', 'min:1'],
            'medications.*.medication'      => ['required', 'string', 'max:255'],
            'medications.*.status'          => ['nullable', 'string', 'max:50'],
            'medications.*.units_remaining' => ['nullable'],
            'medications.*.days_remaining'  => ['nullable'],
            'medications.*.half_date'       => ['nullable', 'string', 'max:50'],
            'medications.*.runout_date'     => ['nullable', 'string', 'max:50'],
        ]);

        try {
            Mail::to($data['gp_email'])->send(new GpMedicationAlertMail($data));
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to send GP email',
            ], 500);
        }

        return response()->json([
            'message' => 'GP email sent successfully.',
        ]);
    }

    private function statusFromDays(?int $d): string
    {
        if ($d === null) return 'unknown';
        if ($d <= 2) return 'critical';
        if ($d <= 7) return 'low';
        return 'ok';
    }
}
