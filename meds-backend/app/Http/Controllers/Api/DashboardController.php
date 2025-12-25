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
        // Compute days_remaining in Postgres (server-side so RN just renders)
        $daysExpr = <<<SQL
            CASE
            WHEN runout_date IS NOT NULL
                THEN GREATEST((runout_date::date - CURRENT_DATE), 0)
            WHEN daily_use > 0
                THEN CEIL(
                GREATEST(
                    (pack_size * packs_on_hand) + COALESCE(loose_units, 0),
                    opening_units
                ) / NULLIF(daily_use, 0)
                )
            ELSE NULL
            END
        SQL;

        // Compute remaining units
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

        // KPI counts
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
            ->with(['client.service'])
            ->select('*')
            ->addSelect(DB::raw("$daysExpr as days_remaining"))
            ->addSelect(DB::raw("$unitsExpr as units_remaining"))
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

                return [
                    'course_id'      => (int) $c->id,
                    'medication'     => $medicationName,
                    'days_remaining' => $days,
                    'runout_date'    => optional($c->runout_date)->toDateString(),
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
            'gp_email'        => ['required', 'email'],
            'client_name'     => ['required', 'string', 'max:255'],
            'service_name'    => ['nullable', 'string', 'max:255'],
            'medication'      => ['required', 'string', 'max:255'],
            'status'          => ['required', 'string', 'max:50'],
            'units_remaining' => ['nullable'],
            'half_date'       => ['nullable', 'string', 'max:50'],
            'runout_date'     => ['nullable', 'string', 'max:50'],
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
