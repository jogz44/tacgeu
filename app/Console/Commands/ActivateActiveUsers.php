<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Contributions;
use App\Models\AppSetting;
use App\Models\User;
use Carbon\Carbon;

class ActivateActiveUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:activate-active-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Activate users who have paid for the past 3 consecutive months';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();
        $users = User::where('membership_status', 'Inactive')
            ->where('affiliation', 'Member')
            ->get();

        foreach ($users as $user) {
            $paid = false;

            // Check the last 3 months
            $monthsBeforeInactive = AppSetting::where('key', 'months_before_inactive')->value('value');

            for ($i = 0; $i < $monthsBeforeInactive; $i++) {
                $date = $now->copy()->subMonths($i);

                $hasPaid = Contributions::where('user_id', $user->id)
                    ->where('month', $date->month)
                    ->where('year', $date->year)
                    ->exists();

                if ($hasPaid) {
                    $paid = true;
                    break;
                }
            }

            if ($paid) {
                $user->update(['membership_status' => 'Active']);
                $this->info("User ID {$user->id} reactivated (paid at least once in the last {$monthsBeforeInactive} months)");
            }
        }

        $this->info('User reactivation check complete.');
    }
}
