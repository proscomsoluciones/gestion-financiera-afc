<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\TributeStatusService;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class TributePeriodTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RoleSeeder::class);
    }

    private function makeTesorero(): User
    {
        $user = User::factory()->create();
        $user->syncRoles(['tesorero']);

        return $user;
    }

    public function test_current_period_uses_the_current_month_in_spanish(): void
    {
        Carbon::setTestNow('2026-11-22 10:00:00');

        $this->assertSame('Noviembre 2026', TributeStatusService::currentPeriod());

        Carbon::setTestNow();
    }

    public function test_dashboard_and_treasury_default_to_the_current_month(): void
    {
        Carbon::setTestNow('2026-11-22 10:00:00');
        $tesorero = $this->makeTesorero();

        $this->actingAs($tesorero)->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('tribute_status.period_month', 'Noviembre 2026'));

        $this->actingAs($tesorero)->get(route('transactions.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('tribute_status.period_month', 'Noviembre 2026'));

        Carbon::setTestNow();
    }

    public function test_dashboard_can_show_another_month(): void
    {
        $this->actingAs($this->makeTesorero())
            ->get(route('dashboard', ['tribute_period' => 'Septiembre 2026']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('tribute_status.period_month', 'Septiembre 2026')
                ->where('filters.tribute_period', 'Septiembre 2026'));
    }
}
