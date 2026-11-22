<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class TransactionReceiptUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RoleSeeder::class);
        Storage::fake('public');
    }

    private function makeTesorero(): User
    {
        $user = User::factory()->create();
        $user->syncRoles(['tesorero']);

        return $user;
    }

    private function baseTransactionData(): array
    {
        return [
            'type' => 'income',
            'category' => 'otro_ingreso',
            'amount' => 15000,
            'concept' => 'Aporte con comprobante',
            'payment_method' => 'efectivo',
            'date' => now()->toDateString(),
        ];
    }

    public function test_rejects_disallowed_file_types_as_receipt(): void
    {
        $tesorero = $this->makeTesorero();

        $this->actingAs($tesorero)->post('/transactions', array_merge(
            $this->baseTransactionData(),
            ['receipt_image' => UploadedFile::fake()->create('script.php', 10)]
        ))->assertSessionHasErrors('receipt_image');

        $this->assertDatabaseMissing('transactions', ['concept' => 'Aporte con comprobante']);
    }

    public function test_accepts_image_and_pdf_receipts(): void
    {
        $tesorero = $this->makeTesorero();

        $this->actingAs($tesorero)->post('/transactions', array_merge(
            $this->baseTransactionData(),
            ['receipt_image' => UploadedFile::fake()->image('boleta.jpg')]
        ))->assertRedirect('/transactions');

        $this->assertDatabaseHas('transactions', ['concept' => 'Aporte con comprobante']);

        $this->actingAs($tesorero)->post('/transactions', array_merge(
            $this->baseTransactionData(),
            ['concept' => 'Aporte con PDF', 'receipt_image' => UploadedFile::fake()->create('factura.pdf', 100, 'application/pdf')]
        ))->assertRedirect('/transactions');

        $this->assertDatabaseHas('transactions', ['concept' => 'Aporte con PDF']);
    }

    public function test_editing_without_a_new_file_keeps_the_existing_receipt(): void
    {
        $tesorero = $this->makeTesorero();

        $this->actingAs($tesorero)->post('/transactions', array_merge(
            $this->baseTransactionData(),
            ['receipt_image' => UploadedFile::fake()->create('factura.pdf', 50, 'application/pdf')]
        ))->assertSessionHasNoErrors();

        $transaction = \App\Models\Transaction::firstOrFail();
        $originalReceipt = $transaction->receipt_image;
        $this->assertNotNull($originalReceipt);

        // Edit only the concept, sending no file (as the edit form does).
        $this->actingAs($tesorero)->put("/transactions/{$transaction->id}", array_merge(
            $this->baseTransactionData(),
            ['concept' => 'Concepto corregido', 'receipt_image' => null]
        ))->assertSessionHasNoErrors();

        $transaction->refresh();
        $this->assertSame('Concepto corregido', $transaction->concept);
        $this->assertSame($originalReceipt, $transaction->receipt_image);

        // A new file replaces it.
        $this->actingAs($tesorero)->put("/transactions/{$transaction->id}", array_merge(
            $this->baseTransactionData(),
            ['receipt_image' => UploadedFile::fake()->image('boleta.jpg')]
        ))->assertSessionHasNoErrors();

        $transaction->refresh();
        $this->assertNotSame($originalReceipt, $transaction->receipt_image);
        Storage::disk('public')->assertExists($transaction->receipt_image);
    }
}
