<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicationCourse;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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

        // Top urgent alerts (joins client + service like your other controllers)
        $topAlerts = MedicationCourse::query()
            ->with(['client:id,name,service_id', 'client.service:id,name'])
            ->select([
                'id as course_id',
                'client_id',
                'medication_name',
                'runout_date',
                'half_date',
                'daily_use',
                'packs_on_hand',
                'pack_size',
                'loose_units',
                'opening_units',
            ])
            ->addSelect(DB::raw("$daysExpr as days_remaining"))
            ->orderByRaw('days_remaining ASC NULLS LAST')
            ->limit(10)
            ->get()
            ->map(function ($c) {
                $days = is_null($c->days_remaining) ? null : (int)$c->days_remaining;
                return [
                    'course_id'      => (int)$c->course_id,
                    'medication'     => $c->medication_name,
                    'days_remaining' => $days,
                    'runout_date'    => optional($c->runout_date)->toDateString(),
                    'half_date'      => optional($c->half_date)->toDateString(),
                    'client'         => [
                        'id'      => (int)$c->client->id,
                        'name'    => $c->client->name,
                        'service' => [
                            'id'   => (int)$c->client->service->id,
                            'name' => $c->client->service->name,
                        ],
                    ],
                    'status' => $this->statusFromDays($days),
                ];
            });

        return response()->json([
            'kpis' => [
                'critical'       => $critical,
                'low'            => $low,
                'ok'             => $ok,
                'pendingOrders'  => $pendingOrders,
                'nextScheduleAt' => $nextScheduleAt ? Carbon::parse($nextScheduleAt)->toISOString() : null,
            ],
            'topAlerts' => $topAlerts,
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
