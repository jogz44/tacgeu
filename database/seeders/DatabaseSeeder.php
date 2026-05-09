<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UserSeeder::class);
        $this->call(CollectionSeeder::class);
        $this->call(DepartmentSeeder::class);
        $this->call(PositionSeeder::class);
        $this->call(AppSettingSeeder::class);
    }
}