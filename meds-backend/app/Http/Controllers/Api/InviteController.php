<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
// use App\Mail\InviteCreatedMail;
use App\Models\Invite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class InviteController extends Controller
{
public function store(Request $request)
{
    $data = $request->validate([
        'email' => ['required', 'email'],
    ]);

    // ✅ Remove any previous invite for this email (expired/unused/used)
    Invite::where('email', $data['email'])->delete();

    $plainToken = Str::random(64);

    $invite = Invite::create([
        'email'      => $data['email'],
        'token'      => hash('sha256', $plainToken), // store HASH only
        'expires_at' => now()->addDays(3),
    ]);

    $frontendUrl = rtrim(config('app.frontend_url'), '/');

    $inviteLink = $frontendUrl . '/signup?token=' . $plainToken . '&email=' . urlencode($invite->email);


    return response()->json([
        'invite_link' => $inviteLink,
        'expires_at'  => $invite->expires_at?->toIso8601String(),
        'emailed'     => true,
    ], 201);
}

}
