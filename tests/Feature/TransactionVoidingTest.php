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

    public function test_multiple_transactions_can_share_the_same_folio_number(): void
    {
        $tesorero = $this->makeTesorero();

        // Primera transacción con Folio 000006 (ej: Tributo)
        $this->actingAs($tesorero)->post('/transactions', [
            'folio_number' => '000006',
            'type' => 'income',
            'category' => 'tributo',
            'amount' => 40000,
            'concept' => 'Tributo mes agosto y cuota selección',
            'payment_method' => 'efectivo',
            'date' => now()->toDateString(),
        ])->assertSessionHasNoErrors()->assertRedirect('/transactions');

        // Segunda transacción con el MISMO Folio 000006 (ej: Pase)
        $this->actingAs($tesorero)->post('/transactions', [
            'folio_number' => '000006',
            'type' => 'income',
            'category' => 'pase',
            'amount' => 22000,
            'concept' => '1. Pase Regional Jugador: Ariel Salinas S.',
            'payment_method' => 'efectivo',
            'date' => now()->toDateString(),
        ])->assertSessionHasNoErrors()->assertRedirect('/transactions');

        $this->assertEquals(2, Transaction::where('folio_number', '000006')->count());
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

    public function test_club_statement_pdf_generation_succeeds(): void
    {
        $tesorero = $this->makeTesorero();
        $club = \App\Models\Club::create([
            'name' => 'Club Deportivo Prueba',
            'short_name' => 'Prueba',
            'is_active' => true,
        ]);

        $this->actingAs($tesorero)
            ->get("/reports/club-statement-pdf/{$club->id}")
            ->assertOk();
    }
}
