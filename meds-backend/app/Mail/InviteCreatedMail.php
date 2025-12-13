<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class InviteCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $inviteLink;
    public ?Carbon $expiresAt;

    public function __construct(string $inviteLink, ?Carbon $expiresAt = null)
    {
        $this->inviteLink = $inviteLink;
        $this->expiresAt = $expiresAt;
    }

    public function build()
    {
        return $this
            ->subject('You’ve been invited to Med Tracker')
            ->markdown('emails.invites.created', [
                'inviteLink' => $this->inviteLink,
                'expiresAt'  => $this->expiresAt,
            ]);
    }
}
