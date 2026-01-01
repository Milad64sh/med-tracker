<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use App\Models\MedicationCourse;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;


class AuditLogController extends Controller
{
public function index(Request $request)
{
    $q = AuditLog::query()
        ->with(['actor:id,name,email'])
        ->orderByDesc('created_at');

    if ($request->filled('user_name')) {
        $name = mb_strtolower($request->input('user_name'));
        $q->whereHas('actor', function ($uq) use ($name) {
            $uq->whereRaw('LOWER(name) LIKE ?', ['%' . $name . '%']);
        });
    }

    if ($request->filled('action')) {
        $action = mb_strtolower($request->input('action'));
        $q->whereRaw('LOWER(action) LIKE ?', ['%' . $action . '%']);
    }

    if ($request->filled('entity_type')) {
        $q->where('entity_type', $request->input('entity_type'));
    }

    if ($request->filled('date_from')) {
        $q->whereDate('created_at', '>=', $request->input('date_from'));
    }
    if ($request->filled('date_to')) {
        $q->whereDate('created_at', '<=', $request->input('date_to'));
    }

    if ($request->filled('client_id')) {
        $q->whereRaw("metadata->>'client_id' = ?", [$request->input('client_id')]);
    }

    $page = $q->paginate(25);

    // --- Enrich only the current page (fast + no N+1) ---
    $logs = $page->getCollection();

    // Collect MedicationCourse IDs from the page
    $courseIds = $logs
        ->filter(fn ($l) => $l->entity_type === 'MedicationCourse')
        ->pluck('entity_id')
        ->unique()
        ->values();

    $coursesById = MedicationCourse::query()
        ->with(['client']) // ensure client relation exists
        ->whereIn('id', $courseIds)
        ->get()
        ->keyBy('id');

    $logs = $logs->map(function ($log) use ($coursesById) {
        $display = null;

        if (class_basename($log->entity_type) === 'MedicationCourse') {
            $course = $coursesById->get($log->entity_id);

            $client = $course?->client;
            $initials = $client?->initials ?? null;

            $name = $course?->name ?? null;
            $strength = $course?->strength ?? null;
            $form = $course?->form ?? null;

            $medLabel = trim(implode(' ', array_filter([$name, $strength, $form])));

            $title = trim(implode(' • ', array_filter([$initials, $medLabel ?: null])));
            $display = [
                'client_initials' => $initials,
                'medication_name' => $name,
                'strength'        => $strength,
                'form'            => $form,
                'title'           => $title !== '' ? $title : null,
            ];
        }

        $log->setAttribute('display', $display);
        return $log;
    });


    $page->setCollection($logs);

    return response()->json($page);
}
public function pdf(Request $request, AuditLog $auditLog)
{
    try {
        // Load actor (can be null for system actions)
        $auditLog->loadMissing(['actor:id,name,email']);

        // ---- Build "display" info (client initials + medication) ----
        $display = null;

        if (class_basename($auditLog->entity_type) === 'MedicationCourse') {
            $course = MedicationCourse::query()
                ->with(['client:id,initials'])
                ->find($auditLog->entity_id);

            if ($course) {
                $initials = $course->client?->initials;

                $medLabel = trim(implode(' ', array_filter([
                    $course->name ?? null,
                    $course->strength ?? null,
                    $course->form ?? null,
                ])));

                $title = trim(implode(' • ', array_filter([$initials, $medLabel ?: null])));

                $display = [
                    'client_initials' => $initials,
                    'medication'      => $medLabel !== '' ? $medLabel : null,
                    'title'           => $title !== '' ? $title : null,
                ];
            }
        }

        // ---- Human-friendly details from metadata ----
        // Ensure array (works even if metadata is JSON string or stdClass)
        $meta = $auditLog->metadata;

        if (is_string($meta)) {
            $decoded = json_decode($meta, true);
            $meta = is_array($decoded) ? $decoded : [];
        } elseif ($meta instanceof \stdClass) {
            $meta = (array) $meta;
        } elseif (!is_array($meta)) {
            $meta = [];
        }

        $before = is_array($meta['before'] ?? null) ? ($meta['before'] ?? []) : [];
        $after  = is_array($meta['after'] ?? null) ? ($meta['after'] ?? []) : [];

        $fmt = function ($v) {
            if ($v === null || $v === '') return '—';

            // If value is a scalar, cast; if array/object, show dash
            if (!is_scalar($v)) return '—';

            $s = (string) $v;

            // Format ISO timestamps (and normal datetime strings too)
            try {
                // Try parsing common date/datetime strings
                if (preg_match('/^\d{4}-\d{2}-\d{2}/', $s)) {
                    return Carbon::parse($s)->timezone('Europe/London')->format('d M Y, H:i');
                }
            } catch (\Throwable $e) {
                // fall through
            }

            return $s;
        };

        $changes = [];
        $push = function (string $label, $from, $to) use (&$changes, $fmt) {
            $f = $fmt($from);
            $t = $fmt($to);

            if ($f === '—' && $t === '—') return;
            if ($f === $t) return;

            $changes[] = ['label' => $label, 'from' => $f, 'to' => $t];
        };

        // Common fields (snooze/ack etc.)
        $push('Snoozed until', $before['snoozed_until'] ?? null, $after['snoozed_until'] ?? null);
        $push('Snooze note',   $before['snooze_note'] ?? null,   $after['snooze_note'] ?? null);

        $push('Acknowledged at',   $before['acknowledged_at'] ?? null, $after['acknowledged_at'] ?? null);
        $push('Acknowledge note',  $before['ack_note'] ?? null,        $after['ack_note'] ?? null);

        // Top-level note if present
        $note = $meta['note'] ?? null;
        if (is_scalar($note) && (string) $note !== '') {
            array_unshift($changes, ['label' => 'Note', 'from' => '—', 'to' => (string) $note]);
        }

        $data = [
            'log'          => $auditLog,
            'display'      => $display ?? [],
            'changes'      => $changes,
            'generated_at' => now()->timezone('Europe/London')->format('d M Y, H:i'),
        ];

        // Optional: log timing to spot DomPDF slowness
        $start = microtime(true);

        $pdf = Pdf::loadView('pdf.audit-log', $data)
            ->setPaper('a4')
            ->setOption('isRemoteEnabled', false);

        Log::info('Audit PDF rendered', [
            'audit_log_id' => $auditLog->id,
            'seconds'      => round(microtime(true) - $start, 2),
        ]);

        $safeId = (int) $auditLog->id;
        $filename = "audit-log-{$safeId}.pdf";

        return $pdf->download($filename);

} catch (\Throwable $e) {
    Log::error('Audit PDF generation failed', [
        'audit_log_id' => $auditLog->id ?? null,
        'message' => $e->getMessage(),
    ]);

    return response()->json([
        'message' => 'PDF generation failed',
        'error' => $e->getMessage(),
    ], 500);
}

}

}
