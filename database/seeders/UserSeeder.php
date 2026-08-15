<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Super Admin User
        User::updateOrCreate(
            ['email' => 'jcornejo@proscom.cl'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Jupipe2083@'),
                'email_verified_at' => now(),
            ]
        );

        // Tesorería User
        User::updateOrCreate(
            ['email' => 'tesoreria@afc.cl'],
            [
                'name' => 'Tesorero General',
                'password' => Hash::make('Tesoreria2026!'),
                'email_verified_at' => now(),
            ]
        );
    }
}
