<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class CategoryReportTest extends TestCase
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

    private function makeTransaction(User $user, array $attributes): Transaction
    {
        return Transaction::create(array_merge([
            'type' => 'income',
            'category' => 'otro_ingreso',
            'amount' => 10000,
            'concept' => 'Movimiento de prueba',
            'payment_method' => 'efectivo',
            'date' => '2026-10-14',
            'user_id' => $user->id,
        ], $attributes));
    }

    public function test_category_report_groups_income_and_expenses_by_category(): void
    {
        $tesorero = $this->makeTesorero();

        $this->makeTransaction($tesorero, ['amount' => 380000, 'breakdown' => ['subcategory' => 'finales']]);
        $this->makeTransaction($tesorero, ['amount' => 20000, 'breakdown' => ['subcategory' => 'finales']]);
        $this->makeTransaction($tesorero, ['amount' => 110000, 'breakdown' => ['subcategory' => 'evento']]);
        $this->makeTransaction($tesorero, ['amount' => 40000, 'category' => 'tributo']);
        $this->makeTransaction($tesorero, ['type' => 'expense', 'category' => 'egreso', 'amount' => 135000, 'breakdown' => ['expense_type' => 'viatico']]);
        $this->makeTransaction($tesorero, ['type' => 'expense', 'category' => 'egreso', 'amount' => 49000, 'breakdown' => ['expense_type' => 'compra']]);
        $voided = $this->makeTransaction($tesorero, ['type' => 'expense', 'category' => 'egreso', 'amount' => 999000, 'breakdown' => ['expense_type' => 'compra']]);
        $voided->delete();
        $this->makeTransaction($tesorero, ['amount' => 777000, 'date' => '2025-10-14']);

        Pdf::shouldReceive('loadView')
            ->once()
            ->withArgs(function (string $view, array $data) {
                $this->assertSame('pdf.informe_categorias', $view);
                $this->assertSame(550000.0, $data['totalIncome']);
                $this->assertSame(184000.0, $data['totalExpense']);
                $this->assertSame(366000.0, $data['netBalance']);

                $income = $data['incomeGroups']->keyBy('label');
                $this->assertSame(400000.0, $income['Recaudación Entradas / Final de Campeonato']['total']);
                $this->assertSame(2, $income['Recaudación Entradas / Final de Campeonato']['count']);
                $this->assertSame(110000.0, $income['Venta de Bases / Evento / Beneficio']['total']);
                $this->assertSame(40000.0, $income['Tributo Mensual']['total']);

                $expense = $data['expenseGroups']->keyBy('label');
                $this->assertSame(49000.0, $expense['Compra de Insumos / Balones / Materiales']['total']);
                $this->assertCount(2, $data['expenseGroups']);

                return true;
            })
            ->andReturnSelf();
        Pdf::shouldReceive('setPaper')->andReturnSelf();
        Pdf::shouldReceive('stream')->andReturn(response('pdf'));

        $this->actingAs($tesorero)
            ->get(route('reports.categorias-pdf', ['year' => 2026]))
            ->assertOk();
    }

    public function test_category_report_renders_pdf(): void
    {
        $tesorero = $this->makeTesorero();
        $this->makeTransaction($tesorero, ['amount' => 380000, 'breakdown' => ['subcategory' => 'finales']]);
        $this->makeTransaction($tesorero, ['type' => 'expense', 'category' => 'egreso', 'amount' => 135000]);

        $response = $this->actingAs($tesorero)
            ->get(route('reports.categorias-pdf', ['month_filter' => '2026-10']));

        $response->assertOk();
        $this->assertStringStartsWith('%PDF', $response->getContent());
    }
}
