<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendContribution extends Mailable
{
    use Queueable, SerializesModels;
    public $fullName;
    public $validated;
    

    public function __construct($fullName, $validated)
    {
        $this->fullName = $fullName;
        $this->validated = $validated;
    }

    public function build()
    {
        return $this->subject('Tagum City Government Employees Union (TACGEU) - Monthly Contribution')
                    ->view('emails.contribution')
                    ->with([
                        'fullname' => $this->fullName,
                        'details' => $this->validated,
                    ]);
    }
}