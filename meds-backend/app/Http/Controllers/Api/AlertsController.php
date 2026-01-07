<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\GpMedicationAlertMail;
use Illuminate\Support\Facades\DB;
use App\Support\Audit;
use App\Models\MedicationCourse;

class AlertsController extends Controller
{
public function emailGp(Request $request)
{
    $data = $request->validate([
        'gp_email' => ['required', 'email'],
        'client_id' => ['required', 'integer', 'exists:clients,id'],
        'client_name' => ['required', 'string'],
        'service_name' => ['nullable', 'string'],
        'dob' => ['nullable', 'string'],

        'medications' => ['required', 'array', 'min:1'],
        'medications.*.medication' => ['required', 'string'],
        'medications.*.units_remaining' => ['nullable'],
        'medications.*.runout_date' => ['nullable', 'string'],
        'medications.*.days_remaining' => ['nullable'],
        'medications.*.status' => ['nullable', 'string'],
    ]);

    try {
        Mail::to($data['gp_email'])->send(new GpMedicationAlertMail($data));

        Audit::log(
            $request->user()?->id,
            'gp.email.sent',
            'Client',
            (int) $data['client_id'],
            [
                'gp_email' => $data['gp_email'],
                'client_name' => $data['client_name'],
                'service_name' => $data['service_name'] ?? null,
                'dob_provided' => !empty($data['dob']),
                'medications_count' => count($data['medications']),
            ],
            $request
        );

        return response()->json(['ok' => true]);
    } catch (\Throwable $e) {
        Audit::log(
            $request->user()?->id,
            'gp.email.failed',
            'Client',
            (int) ($data['client_id'] ?? 0),
            [
                'gp_email' => $data['gp_email'] ?? null,
                'client_name' => $data['client_name'] ?? null,
                'service_name' => $data['service_name'] ?? null,
                'dob_provided' => !empty($data['dob']),
                'medications_count' => isset($data['medications']) ? count($data['medications']) : null,
                'error' => $e->getMessage(),
            ],
            $request
        );

        // return a proper API error
        return response()->json(['message' => 'Failed to send GP email'], 500);
    }
}


    // POST /alerts/{course}/acknowledge
    public function acknowledge(Request $request, MedicationCourse $course)
    {
        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        return DB::transaction(function () use ($request, $course, $user, $data) {
            $before = [
                'acknowledged_at' => $course->acknowledged_at,
                'acknowledged_by' => $course->acknowledged_by,
                'ack_note'        => $course->ack_note,
            ];

            $course->acknowledged_at = now();
            $course->acknowledged_by = $user->id;
            $course->ack_note = $data['note'] ?? null;
            $course->save();

            Audit::log(
            $user->id,
            'alert.acknowledged',
            'MedicationCourse',
            (int) $course->id,
            [
                'client_id' => (int) $course->client_id,
                'client_initials' => $course->client?->initials,
                'course_name' => $course->name,
                'course_strength' => $course->strength,
                'note' => $course->ack_note,
                'before' => $before,
                'after' => [
                'acknowledged_at' => $course->acknowledged_at,
                'acknowledged_by' => $course->acknowledged_by,
                'ack_note' => $course->ack_note,
                ],
            ],
            $request
            );


            return response()->json([
                'message' => 'Alert acknowledged.',
                'course_id' => (int) $course->id,
                'acknowledged_at' => $course->acknowledged_at?->toISOString(),
                'acknowledged_by' => (int) $course->acknowledged_by,
                'ack_note' => $course->ack_note,
            ]);
        });
    }

    // POST /alerts/{course}/snooze
    public function snooze(Request $request, MedicationCourse $course)
    {
        $data = $request->validate([
            'until' => ['required', 'date'], // ISO string ok
            'note'  => ['nullable', 'string', 'max:2000'],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        return DB::transaction(function () use ($request, $course, $user, $data) {
            $before = [
                'snoozed_until' => $course->snoozed_until,
                'snoozed_by'    => $course->snoozed_by,
                'snooze_note'   => $course->snooze_note,
            ];

            $course->snoozed_until = $data['until'];
            $course->snoozed_by = $user->id;
            $course->snooze_note = $data['note'] ?? null;
            $course->save();

            Audit::log(
            $user->id,
            'alert.snoozed',
            'MedicationCourse',
            (int) $course->id,
            [
                'client_id' => (int) $course->client_id, 
                'client_initials' => $course->client?->initials,      
                'course_name' => $course->name,                       
                'course_strength' => $course->strength,               
                'course_form' => $course->form,                      
                'note' => $course->snooze_note,                
                'before' => $before,
                'after'  => [
                'snoozed_until' => $course->snoozed_until,
                'snoozed_by'    => $course->snoozed_by,
                'snooze_note'   => $course->snooze_note,
                ],
            ],
            $request
            );


            return response()->json([
                'message' => 'Alert snoozed.',
                'course_id' => (int) $course->id,
                'snoozed_until' => $course->snoozed_until?->toISOString(),
                'snoozed_by' => (int) $course->snoozed_by,
                'snooze_note' => $course->snooze_note,
            ]);
        });
    }

    // POST /alerts/{course}/unsnooze
    public function unsnooze(Request $request, MedicationCourse $course)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        return DB::transaction(function () use ($request, $course, $user) {
            $before = [
                'snoozed_until' => $course->snoozed_until,
                'snoozed_by'    => $course->snoozed_by,
                'snooze_note'   => $course->snooze_note,
            ];

            $course->snoozed_until = null;
            $course->snoozed_by = null;
            $course->snooze_note = null;
            $course->save();

            Audit::log(
            $user->id,
            'alert.unsnoozed',
            'MedicationCourse',
            (int) $course->id,
            [
                'client_id' => (int) $course->client_id,
                'client_initials' => $course->client?->initials,
                'course_name' => $course->name,
                'course_strength' => $course->strength,
                'course_form' => $course->form,
                'before' => $before,
                'after' => [
                'snoozed_until' => null,
                'snoozed_by' => null,
                'snooze_note' => null,
                ],
            ],
            $request
            );



            return response()->json([
                'message' => 'Alert unsnoozed.',
                'course_id' => (int) $course->id,
            ]);
        });
    }
}

