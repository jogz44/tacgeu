<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendRejected extends Mailable
{
    use Queueable, SerializesModels;
    public $fullName;
    public $position;
    public $status;

    public function __construct($fullName, $position = null, $status)
    {
        $this->fullName = $fullName;
        $this->position = $position;
        $this->status = $status;

    }

    public function build()
    {
        return $this->subject("Tagum City Government Employees' Union (TACGEU) - Membership Application Review")
                    ->view('emails.rejectedMail')
                    ->with([
                        'fullname' => $this->fullName,
                        'position' => $this->position,
                        'status' => $this->status,
                    ]);
    }
}