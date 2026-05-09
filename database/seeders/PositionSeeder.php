<?php

namespace Database\Seeders;

use App\Models\EmployeePosition;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [

            // HUMAN RESOURCE MANAGEMENT
            ['title' => 'Human Resource Management Aide'],
            ['title' => 'Human Resource Management Assistant'],
            ['title' => 'Human Resource Management Officer I'],
            ['title' => 'Human Resource Management Officer II'],
            ['title' => 'Human Resource Management Officer III'],
            ['title' => 'Human Resource Management Officer IV'],
            ['title' => 'Human Resource Management Officer V'],

            // RECORDS MANAGEMENT
            ['title' => 'Records Officer I'],
            ['title' => 'Records Officer II'],
            ['title' => 'Records Officer III'],
            ['title' => 'Records Officer IV'],
            ['title' => 'Records Officer V'],

            // SUPPLY MANAGEMENT
            ['title' => 'Buyer I'],
            ['title' => 'Buyer II'],
            ['title' => 'Buyer III'],
            ['title' => 'Buyer IV'],
            ['title' => 'Buyer V'],
            ['title' => 'Property Custodian'],
            ['title' => 'Storekeeper I'],
            ['title' => 'Storekeeper II'],
            ['title' => 'Storekeeper III'],
            ['title' => 'Storekeeper IV'],
            ['title' => 'Supply Officer I'],
            ['title' => 'Supply Officer II'],
            ['title' => 'Supply Officer III'],
            ['title' => 'Supply Officer IV'],
            ['title' => 'Supply Officer V'],

            // ACCOUNTING
            ['title' => 'Accounting Clerk I'],
            ['title' => 'Accounting Clerk II'],
            ['title' => 'Accounting Clerk III'],
            ['title' => 'Bookkeeper I'],
            ['title' => 'Senior Bookkeeper'],

            // AUDITING
            ['title' => 'Fiscal Clerk I'],
            ['title' => 'Fiscal Clerk II'],
            ['title' => 'Fiscal Clerk III'],
            ['title' => 'Fiscal Controller I'],
            ['title' => 'Fiscal Controller II'],
            ['title' => 'Fiscal Controller III'],
            ['title' => 'Fiscal Controller IV'],
            ['title' => 'Fiscal Controller V'],
            ['title' => 'Fiscal Examiner I'],
            ['title' => 'Fiscal Examiner II'],
            ['title' => 'Fiscal Examiner III'],

            // BUDGET
            ['title' => 'Budgeting Aide'],
            ['title' => 'Budgeting Assistant'],
            ['title' => 'Budget Officer I'],
            ['title' => 'Budget Officer II'],
            ['title' => 'Budget Officer III'],
            ['title' => 'Budget Officer IV'],
            ['title' => 'Budget Officer V'],

            // CASHIERING
            ['title' => 'Cash Clerk I'],
            ['title' => 'Cash Clerk II'],
            ['title' => 'Cash Clerk III'],
            ['title' => 'Disbursing Officer I'],
            ['title' => 'Disbursing Officer II'],
            ['title' => 'Cashier I'],
            ['title' => 'Cashier II'],
            ['title' => 'Cashier III'],
            ['title' => 'Cashier IV'],
            ['title' => 'Cashier V'],

            // MANAGEMENT & AUDIT
            ['title' => 'Management and Audit Assistant'],
            ['title' => 'Management and Audit Analyst I'],
            ['title' => 'Management and Audit Analyst II'],
            ['title' => 'Management and Audit Analyst III'],
            ['title' => 'Management and Audit Analyst IV'],
            ['title' => 'Management and Audit Analyst V'],
            ['title' => 'Financial and Management Officer I'],
            ['title' => 'Financial and Management Officer II'],

            // INFORMATION TECHNOLOGY
            ['title' => 'Data Controller I'],
            ['title' => 'Data Controller II'],
            ['title' => 'Data Controller III'],
            ['title' => 'Data Controller IV'],
            ['title' => 'Computer Operator I'],
            ['title' => 'Computer Operator II'],
            ['title' => 'Computer Operator III'],
            ['title' => 'Computer Operator IV'],

            // TRANSPORT
            ['title' => 'Driver I'],
            ['title' => 'Driver II'],
            ['title' => 'Motorpool Dispatcher'],
            ['title' => 'Motorpool Supervisor I'],
            ['title' => 'Motorpool Supervisor II'],

            // GENERAL UTILITY
            ['title' => 'Laborer I'],
            ['title' => 'Laborer II'],
            ['title' => 'Utility Worker I'],
            ['title' => 'Utility Worker II'],

            // INFORMATION SERVICE
            ['title' => 'Information Officer I'],
            ['title' => 'Information Officer II'],
            ['title' => 'Information Officer III'],
            ['title' => 'Information Officer IV'],
            ['title' => 'Information Officer V'],

            // PUBLIC RELATIONS
            ['title' => 'Public Relations Assistant'],
            ['title' => 'Public Relations Officer I'],
            ['title' => 'Public Relations Officer II'],
            ['title' => 'Public Relations Officer III'],
            ['title' => 'Public Relations Officer IV'],
            ['title' => 'Public Relations Officer V'],

        ];

        EmployeePosition::insert($positions);
    }
}
