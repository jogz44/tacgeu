<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Collection;

class CollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Collection::insert([
            [
                'name' => 'Membership Fee',
                'description' => 'Membership fee for new TACGEU applicants.',
                'amount' => 300.00,
                'status' => 'Default',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
