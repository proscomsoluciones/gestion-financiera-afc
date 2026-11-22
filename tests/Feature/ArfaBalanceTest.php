<?php

namespace Tests\Feature;

use App\Http\Controllers\DashboardController;
use App\Models\Setting;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArfaBalanceTest extends TestCase
{
    use RefreshDatabase;

    private function makeTransaction(User $user, array $attributes): Transaction
    {
        return Transaction::create(array_merge([
            'type' => 'income',
            'category' => 'pase',
            'amount' => 0,
            'concept' => 'Movimiento de prueba',
            'payment_method' => 'efectivo',
            'date' => '2026-10-15',
            'user_id' => $user->id,
        ], $attributes));
    }

    public function test_pending_is_what_corresponds_to_arfa_minus_arfa_payments(): void
    {
        $user = User::factory()->create();
        Setting::set('expense_categories', json_encode([
            ['id' => 'compra', 'label' => 'Compra de Insumos'],
            ['id' => 'exp_arfa', 'label' => 'Tramitación pases Arfa'],
        ]), 'Categorías de egreso', 'general');

        // Two passes (ARFA 17.000 each) and one inscription (ARFA 0).
        $this->makeTransaction($user, ['amount' => 47000, 'breakdown' => ['items' => [
            ['code' => '5', 'amount' => '22000', 'arfa_cost' => '17000'],
            ['code' => '4', 'amount' => '22000', 'arfa_cost' => '17000'],
            ['code' => '1', 'amount' => '3000', 'arfa_cost' => '0'],
        ]]]);

        // Paid to ARFA: 17.000. An unrelated expense must not count.
        $this->makeTransaction($user, ['type' => 'expense', 'category' => 'egreso', 'amount' => 17000, 'breakdown' => ['expense_type' => 'exp_arfa']]);
        $this->makeTransaction($user, ['type' => 'expense', 'category' => 'egreso', 'amount' => 50000, 'breakdown' => ['expense_type' => 'compra']]);

        $balance = DashboardController::arfaBalance();

        $this->assertSame(34000.0, $balance['owed']);
        $this->assertSame(17000.0, $balance['paid']);
        $this->assertSame(17000.0, $balance['pending']);
    }

    public function test_pending_never_goes_below_zero(): void
    {
        $user = User::factory()->create();
        Setting::set('expense_categories', json_encode([
            ['id' => 'exp_arfa', 'label' => 'Tramitación pases Arfa'],
        ]), 'Categorías de egreso', 'general');

        $this->makeTransaction($user, ['type' => 'expense', 'category' => 'egreso', 'amount' => 17000, 'breakdown' => ['expense_type' => 'exp_arfa']]);

        $this->assertSame(0.0, DashboardController::arfaBalance()['pending']);
    }
}
