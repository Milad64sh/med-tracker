<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\GpMedicationAlertMail;

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

}
