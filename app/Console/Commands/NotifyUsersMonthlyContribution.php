<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Contributions;
use App\Models\User;
use App\Models\Notification;
use Carbon\Carbon;

class NotifyUsersMonthlyContribution extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:notify-users-monthly-contribution';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send monthly contribution notification to all users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::now();

        if ($today->day !== 1) {
            $this->info('Today is not the 1st of the month. Exiting.');
            return;
        }

        $users = User::where('affiliation', 'Member')->get();

        foreach ($users as $user) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'Contribution',
                'title' => 'Monthly Contribution Due',
                'body' => 'Dear member, please remember to pay your monthly contribution for ' . $today->format('F Y') . '.',
                'is_read' => false,
            ]);
        }

        $this->info('Monthly contribution notifications sent to all users.');
    }
}
