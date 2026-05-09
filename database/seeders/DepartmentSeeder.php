<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            'CACCO - CITY ACCOUNTING OFFICE',
            'CAGRO - CITY AGRICULTURE OFFICE',
            'CAO - CITY ADMINISTRATOR\'S OFFICE',
            'CARCHO - CITY ARCHITECT\'S OFFICE',
            'CASSO - CITY ASSESSOR\'S OFFICE',
            'CBO - CITY BUDGET OFFICE',
            'CCRO - CITY CIVIL REGISTRAR\'S OFFICE',
            'CDRRMO - CITY DISASTER RISK REDUCTION AND MANAGEMENT OFFICE',
            'CEEO - CITY ECONOMIC ENTERPRISES OFFICE',
            'CENRO - CITY ENVIRONMENT AND NATURAL RESOURCES OFFICE',
            'CEO - CITY ENGINEERING OFFICE',
            'CGSO - CITY GENERAL SERVICES OFFICE',
            'CHLMO - CITY HOUSING AND LAND MANAGEMENT OFFICE',
            'CHO - CITY HEALTH OFFICE',
            'CHRMO - CITY HUMAN RESOURCES MANAGEMENT OFFICE',
            'CICTM - CITY INFORMATION AND COMMUNICATION TECHNOLOGY AND MANAGEMENT OFFICE',
            'CLO - CITY LEGAL OFFICE',
            'CMO - CITY MAYOR\'S OFFICE',
            'CPDO - CITY PLANNING AND DEVELOPMENT OFFICE',
            'CPESCDO - CITY PUBLIC EMPLOYMENT SERVICES AND CAPABILITY DEVELOPMENT OFFICE',
            'CSWDO - CITY SOCIAL WELFARE AND DEVELOPMENT OFFICE',
            'CTACHMO - CITY TOURISM, ARTS, CULTURE AND HERITAGE MANAGEMENT OFFICE',
            'CTO - CITY TREASURER\'S OFFICE',
            'CVMO - CITY VICE MAYOR\'S OFFICE',
            'SP - SECRETARY OFFICE OF THE SECRETARY TO SANGGUNIAN',
            'CVO - CITY VETERINARY OFFICE',
        ];

        foreach ($departments as $name) {
            Department::create(['name' => $name]);
        }
    }
}
