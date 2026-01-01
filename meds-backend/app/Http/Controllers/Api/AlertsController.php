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
        'client_name' => ['required', 'string'],   // you're using TS here (initials), keep name as-is
        'service_name' => ['nullable', 'string'],
        'dob' => ['required', 'string'],           // add this in frontend (or make nullable if you truly don't have it)
        'medications' => ['required', 'array', 'min:1'],
        'medications.*.medication' => ['required', 'string'],
        'medications.*.units_remaining' => ['nullable'],
        'medications.*.runout_date' => ['nullable', 'string'],
        'medications.*.days_remaining' => ['nullable'],
        'medications.*.status' => ['nullable', 'string'],
    ]);

    Mail::to($data['gp_email'])->send(new GpMedicationAlertMail($data));

    return response()->json(['ok' => true]);
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

