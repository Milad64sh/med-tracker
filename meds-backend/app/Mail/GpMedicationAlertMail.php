<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GpMedicationAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $data;

    /**
     * Create a new message instance.
     */
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * Build the message.
     */
public function build()
{
    $who = $this->data['client_name'] ?? 'Client';

    return $this
        ->subject('Repeat prescription request – ' . $who)
        ->markdown('emails.meds.gp_alert');
}

}
