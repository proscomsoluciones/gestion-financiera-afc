<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Permissions grouped by module. "manage" implies create/update/delete.
     */
    public const PERMISSIONS = [
        'clubs.view', 'clubs.manage',
        'transactions.view', 'transactions.manage',
        'reports.view',
        'settings.manage',
        'users.manage',
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $admin = Role::findOrCreate('admin', 'web');
        $admin->syncPermissions(self::PERMISSIONS);

        $tesorero = Role::findOrCreate('tesorero', 'web');
        $tesorero->syncPermissions([
            'clubs.view', 'clubs.manage',
            'transactions.view', 'transactions.manage',
            'reports.view',
        ]);

        $lectura = Role::findOrCreate('lectura', 'web');
        $lectura->syncPermissions([
            'clubs.view',
            'transactions.view',
            'reports.view',
        ]);
    }
}
