<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendReviewed extends Mailable
{
    use Queueable, SerializesModels;
    public $fullName;
    

    public function __construct($fullName)
    {
        $this->fullName = $fullName;
    }

    public function build()
    {
        return $this->subject("Tagum City Government Employees' Union (TACGEU) - Membership Application Review")
                    ->view('emails.reviewedMail')
                    ->with([
                        'fullname' => $this->fullName,
                    ]);
    }
}