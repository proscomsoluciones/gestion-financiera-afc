<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Idempotent by design: re-running this (e.g. on every deploy) must never
     * overwrite a password an admin has since changed in production.
     */
    public function run(): void
    {
        $this->createIfMissing('jcornejo@proscom.cl', 'Super Admin', 'Jupipe2083@', 'admin');
        $this->createIfMissing('tesoreria@afc.cl', 'Tesorero General', 'Tesoreria2026!', 'tesorero');
    }

    private function createIfMissing(string $email, string $name, string $defaultPassword, string $role): void
    {
        $user = User::firstOrNew(['email' => $email]);

        if (! $user->exists) {
            $user->name = $name;
            $user->password = Hash::make($defaultPassword);
            $user->email_verified_at = now();
            $user->save();
        }

        $user->syncRoles([$role]);
    }
}
