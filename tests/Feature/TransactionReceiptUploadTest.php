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
}
