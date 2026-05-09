<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Contributions;
use App\Models\AppSetting;
use App\Models\User;
use Carbon\Carbon;

class DeactivateInactiveUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:deactivate-inactive-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deactivate users who did not pay for 4 consecutive months';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();
        $users = User::where('affiliation', 'Member')->get();

        foreach ($users as $user) {
            $firstContribution = Contributions::where('user_id', $user->id)
                ->orderBy('year')
                ->orderBy('month')
                ->first();

            if (!$firstContribution) {
                continue; // No contributions at all
            }

            $startDate = Carbon::createFromDate($firstContribution->year, $firstContribution->month, 1);
            $currentDate = $now->copy()->startOfMonth();

            $unpaidStreak = 0;

            while ($startDate->lte($currentDate)) {
                $hasPaid = Contributions::where('user_id', $user->id)
                    ->where('month', $startDate->month)
                    ->where('year', $startDate->year)
                    ->exists();

                if ($hasPaid) {
                    $unpaidStreak = 0; // reset streak
                } else {
                    $unpaidStreak++;
                }

                $monthsBeforeInactive = AppSetting::where('key', 'months_before_inactive')->value('value');

                if ($unpaidStreak >= $monthsBeforeInactive) {
                    if ($user->membership_status !== 'Inactive') {
                        $user->update(['membership_status' => 'Inactive']);
                        $this->info("User ID {$user->id} set to Inactive (missed {$monthsBeforeInactive} consecutive months)");
                    }
                    break; // no need to continue
                }

                $startDate->addMonth();
            }
        }

        $this->info('Inactive check complete.');
    }
}
