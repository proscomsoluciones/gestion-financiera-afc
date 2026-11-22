<?php

namespace Tests\Unit;

use App\Models\Transaction;
use PHPUnit\Framework\TestCase;

class SplitTramitesTest extends TestCase
{
    private function tx(float $amount, ?array $breakdown): Transaction
    {
        $tx = new Transaction();
        $tx->amount = $amount;
        $tx->breakdown = $breakdown;

        return $tx;
    }

    public function test_separates_inscriptions_from_passes_inside_the_same_receipt(): void
    {
        $mixed = $this->tx(28000, ['items' => [
            ['code' => '5', 'amount' => '22000', 'arfa_cost' => '17000'],
            ['code' => '3', 'amount' => '3000', 'arfa_cost' => '0'],
            ['code' => '2', 'amount' => '3000', 'arfa_cost' => '0'],
        ]]);
        $onlyInscription = $this->tx(3000, ['items' => [
            ['code' => '1', 'amount' => '3000', 'arfa_cost' => '0'],
        ]]);

        $totals = Transaction::splitTramites([$mixed, $onlyInscription]);

        $this->assertSame(22000.0, $totals['pase']);
        $this->assertSame(17000.0, $totals['pase_arfa']);
        $this->assertSame(5000.0, $totals['pase_afc']);
        $this->assertSame(9000.0, $totals['inscripcion']);
        $this->assertSame(9000.0, $totals['inscripcion_afc']);
        $this->assertSame(1, $totals['pase_count']);
        $this->assertSame(3, $totals['inscripcion_count']);
    }

    public function test_receipts_without_items_count_as_passes(): void
    {
        $totals = Transaction::splitTramites([
            $this->tx(22000, ['arfa_cost' => 17000, 'afc_margin' => 5000]),
            $this->tx(15000, null),
        ]);

        $this->assertSame(37000.0, $totals['pase']);
        $this->assertSame(34000.0, $totals['pase_arfa']);
        $this->assertSame(3000.0, $totals['pase_afc']);
        $this->assertSame(0.0, $totals['inscripcion']);
    }
}
