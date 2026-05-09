<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendCredentials extends Mailable
{
    use Queueable, SerializesModels;
    public $fullName;
    public $email;
    public $password;
    

    public function __construct($fullName, $email, $password)
    {
        $this->fullName = $fullName;
        $this->email = $email;
        $this->password = $password;
    }

    public function build()
    {
        return $this->subject('Tagum City Government Employees Union (TACGEU) - Account Credentials')
                    ->view('emails.credentials')
                    ->with([
                        'fullname' => $this->fullName,
                        'email' => $this->email,
                        'password' => $this->password,
                    ]);
    }
}