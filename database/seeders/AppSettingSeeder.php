<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AppSetting;

class AppSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'months_before_inactive',
                'value' => '4',
                'type' => 'integer',
            ],
            [
                'key' => 'voters_majority_threshold',
                'value' => '50',
                'type' => 'integer',
            ],
            [
                'key' => 'require_exact_vote_count',
                'value' => '1', // 1 = exact, 0 = up to
                'type' => 'boolean',
            ],
            [
                'key' => 'candidate_min_months',
                'value' => '12', // 1 = exact, 0 = up to
                'type' => 'integer',
            ]
        ];

        foreach ($settings as $setting) {
            AppSetting::create($setting);
        }
    }
}
