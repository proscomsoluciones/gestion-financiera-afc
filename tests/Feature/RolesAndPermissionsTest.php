<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class RolesAndPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RoleSeeder::class);
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->syncRoles([$role]);

        return $user;
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/transactions')->assertRedirect('/login');
    }

    public function test_lectura_user_can_view_but_not_manage_transactions(): void
    {
        $user = $this->userWithRole('lectura');

        $this->actingAs($user)->get('/transactions')->assertOk();

        $this->actingAs($user)->post('/transactions', [
            'type' => 'income',
            'category' => 'otro_ingreso',
            'amount' => 1000,
            'concept' => 'Test',
            'payment_method' => 'efectivo',
            'date' => now()->toDateString(),
        ])->assertForbidden();
    }

    public function test_tesorero_can_manage_transactions_but_not_settings_or_users(): void
    {
        $user = $this->userWithRole('tesorero');

        $this->actingAs($user)->post('/transactions', [
            'type' => 'income',
            'category' => 'otro_ingreso',
            'amount' => 1000,
            'concept' => 'Test',
            'payment_method' => 'efectivo',
            'date' => now()->toDateString(),
        ])->assertRedirect('/transactions');

        $this->assertDatabaseHas('transactions', ['concept' => 'Test']);

        $this->actingAs($user)->get('/settings')->assertForbidden();
        $this->actingAs($user)->get('/users')->assertForbidden();
    }

    public function test_only_admin_can_access_settings_and_users(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)->get('/settings')->assertOk();
        $this->actingAs($admin)->get('/users')->assertOk();
    }

    public function test_admin_cannot_delete_their_own_account_via_user_management(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->delete("/users/{$admin->id}")
            ->assertSessionHasErrors('user');

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_sole_admin_cannot_demote_themselves(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->put("/users/{$admin->id}", [
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => 'tesorero',
            ])
            ->assertSessionHasErrors('role');

        $this->assertTrue($admin->fresh()->hasRole('admin'));
    }

    public function test_registration_route_is_disabled(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register', [])->assertNotFound();
    }
}
