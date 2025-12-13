<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InviteCreatedMail;
use App\Models\Invite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InviteController extends Controller
{
    public function store(Request $request)
    {
        abort_unless($request->user()->is_admin, 403);

        $data = $request->validate([
            'email' => ['required', 'email', 'unique:invites,email'],
        ]);

        $invite = Invite::create([
            'email'      => $data['email'],
            'token'      => (string) Str::uuid(),
            'expires_at' => now()->addDays(3),
        ]);

        $inviteLink = rtrim(config('app.frontend_url'), '/') . '/signup?token=' . $invite->token;

        // ✅ Send invite email
        Mail::to($invite->email)->send(new InviteCreatedMail(
            inviteLink: $inviteLink,
            expiresAt: $invite->expires_at
        ));

        return response()->json([
            'invite_link' => $inviteLink,
            'expires_at'  => $invite->expires_at?->toIso8601String(),
            'emailed'     => true,
        ], 201);
    }
}
