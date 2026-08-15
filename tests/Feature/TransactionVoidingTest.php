<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class TransactionVoidingTest extends TestCase
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

    private function makeTransaction(User $user, array $overrides = []): Transaction
    {
        return Transaction::create(array_merge([
            'folio_number' => 'FOL-00001',
            'type' => 'income',
            'category' => 'otro_ingreso',
            'amount' => 25000,
            'concept' => 'Aporte de prueba',
            'payment_method' => 'efectivo',
            'date' => now()->toDateString(),
            'user_id' => $user->id,
        ], $overrides));
    }

    public function test_voiding_a_transaction_soft_deletes_it_with_audit_trail(): void
    {
        $tesorero = $this->makeTesorero();
        $transaction = $this->makeTransaction($tesorero);

        $this->actingAs($tesorero)
            ->delete("/transactions/{$transaction->id}", ['reason' => 'Comprobante duplicado'])
            ->assertRedirect('/transactions');

        $this->assertSoftDeleted('transactions', ['id' => $transaction->id]);

        $voided = Transaction::onlyTrashed()->find($transaction->id);
        $this->assertEquals($tesorero->id, $voided->deleted_by);
        $this->assertEquals('Comprobante duplicado', $voided->void_reason);
        $this->assertNotNull($voided->deleted_at);
    }

    public function test_voided_transaction_is_excluded_from_totals_and_listing(): void
    {
        $tesorero = $this->makeTesorero();
        $transaction = $this->makeTransaction($tesorero);
        $transaction->delete();

        $this->assertEquals(0, Transaction::count());
        $this->assertEquals(1, Transaction::withTrashed()->count());
    }

    public function test_folio_number_of_a_voided_transaction_cannot_be_reused(): void
    {
        $tesorero = $this->makeTesorero();
        $transaction = $this->makeTransaction($tesorero, ['folio_number' => 'FOL-00099']);
        $transaction->delete();

        $this->actingAs($tesorero)->post('/transactions', [
            'folio_number' => 'FOL-00099',
            'type' => 'income',
            'category' => 'otro_ingreso',
            'amount' => 5000,
            'concept' => 'Nuevo comprobante',
            'payment_method' => 'efectivo',
            'date' => now()->toDateString(),
        ])->assertSessionHasErrors('folio_number');
    }

    public function test_next_folio_generation_skips_voided_transaction_ids(): void
    {
        $tesorero = $this->makeTesorero();
        $transaction = $this->makeTransaction($tesorero, ['folio_number' => Transaction::generateNextFolio()]);
        $firstFolio = $transaction->folio_number;
        $transaction->delete();

        $nextFolio = Transaction::generateNextFolio();

        $this->assertNotEquals($firstFolio, $nextFolio);
    }
}
