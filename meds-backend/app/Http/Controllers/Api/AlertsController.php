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
        $validated = $request->validate([
            'gp_email' => ['required', 'email'],
            'client_name' => ['required', 'string'],
            // include whatever else your email view needs:
            // 'medications' => ['required', 'array'],
        ]);

        // Important: your Mailable expects array $data
        Mail::to($validated['gp_email'])->send(new GpMedicationAlertMail($validated));

        return response()->json(['ok' => true]);
    }
}
