<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ExpensesMail extends Mailable
{
    use Queueable, SerializesModels;
    public $expense;
    public $presidentName;

    public function __construct($expense, $presidentName)
    {
        $this->expense = $expense;
        $this->presidentName = $presidentName;
    }

    public function build(): ExpensesMail
    {
        return $this->subject("Tagum City Government Employees' Union (TACGEU) - Union Expense")
            ->view('emails.expenseMail')
            ->with([
                'expense' => $this->expense,
                'presidentName' => $this->presidentName,
            ]);
    }
}