<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\Setting;
use App\Models\Transaction;
use App\Services\TributeStatusService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display executive financial dashboard with KPIs and Charts.
     */
    public function index(Request $request): Response
    {
        // Date Filtering Inputs
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $monthFilter = $request->input('month_filter'); // e.g. '2026-08' or '08'

        $baseQuery = Transaction::query();

        if (!empty($startDate) && !empty($endDate)) {
            $baseQuery->whereBetween('date', [$startDate, $endDate]);
        } elseif (!empty($monthFilter)) {
            if (str_contains($monthFilter, '-')) {
                [$year, $m] = explode('-', $monthFilter);
                $baseQuery->whereYear('date', $year)->whereMonth('date', $m);
            } else {
                $baseQuery->whereMonth('date', $monthFilter);
            }
        }

        // 1. Executive Top KPIs (Filtered)
        $totalIncome = (float) (clone $baseQuery)->where('type', 'income')->sum('amount');
        $totalExpense = (float) (clone $baseQuery)->where('type', 'expense')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;

        // Payment methods liquidity breakdown (Cash vs Bank)
        $incomeCash = (float) (clone $baseQuery)->where('type', 'income')->where('payment_method', 'efectivo')->sum('amount');
        $incomeBank = (float) (clone $baseQuery)->where('type', 'income')->whereIn('payment_method', ['transferencia', 'deposito', 'cheque'])->sum('amount');
        $expenseCash = (float) (clone $baseQuery)->where('type', 'expense')->where('payment_method', 'efectivo')->sum('amount');
        $expenseBank = (float) (clone $baseQuery)->where('type', 'expense')->whereIn('payment_method', ['transferencia', 'deposito', 'cheque'])->sum('amount');

        $cashBalance = $incomeCash - $expenseCash;
        $bankBalance = $incomeBank - $expenseBank;

        // 2. ARFA V Región vs AFC Fund Distribution calculation for Pases & Inscripciones
        // Los comprobantes de "Pase / Trámite" incluyen pases (códigos 4-7) e inscripciones de jugadores (códigos 1-3).
        $tramites = Transaction::splitTramites((clone $baseQuery)->where('category', 'pase')->get());
        $legacyInscriptions = (float) (clone $baseQuery)->where('category', 'inscripcion')->sum('amount');

        $totalArfaPasses = $tramites['pase_arfa'];
        $totalAfcPasses = $tramites['pase_afc'];
        $totalArfaInscriptions = $tramites['inscripcion_arfa']; // Normalmente $0: las inscripciones son 100% AFC
        $totalAfcInscriptions = $tramites['inscripcion_afc'] + $legacyInscriptions;

        $totalArfaOverall = $totalArfaPasses + $totalArfaInscriptions;
        $totalAfcOverall = $totalAfcPasses + $totalAfcInscriptions;

        // 3. Category Breakdown (Filtered)
        $categories = [
            'tributo' => (float) (clone $baseQuery)->where('category', 'tributo')->sum('amount'),
            'fondo_solidario' => (float) (clone $baseQuery)->where('category', 'fondo_solidario')->sum('amount'),
            'inscripcion' => $tramites['inscripcion'] + $legacyInscriptions,
            'inscripcion_campeonato' => (float) (clone $baseQuery)->where('category', 'inscripcion_campeonato')->sum('amount'),
            'pase' => $tramites['pase'],
            'pase_afc' => $totalAfcPasses,
            'pase_arfa' => $totalArfaPasses,
            'apelacion' => (float) (clone $baseQuery)->where('category', 'apelacion')->sum('amount'),
            'multa' => (float) (clone $baseQuery)->where('category', 'multa')->sum('amount'),
            'otro_ingreso' => (float) (clone $baseQuery)->where('category', 'otro_ingreso')->sum('amount'),
        ];

        // 4. Monthly Chart Aggregation (2026 Season)
        $months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        $monthlyChart = [];

        foreach ($months as $index => $monthName) {
            $monthNum = str_pad($index + 1, 2, '0', STR_PAD_LEFT);
            $year = 2026;

            $inc = (float) Transaction::where('type', 'income')
                ->whereYear('date', $year)
                ->whereMonth('date', $monthNum)
                ->sum('amount');

            $exp = (float) Transaction::where('type', 'expense')
                ->whereYear('date', $year)
                ->whereMonth('date', $monthNum)
                ->sum('amount');

            if ($inc > 0 || $exp > 0 || $monthName === 'Agosto') {
                $monthlyChart[] = [
                    'month' => $monthName,
                    'income' => $inc,
                    'expense' => $exp,
                    'balance' => $inc - $exp,
                ];
            }
        }

        // 5. Tribute Compliance Status for Active Period (Filtered by selected Month/Date)
        $spanishMonths = [
            '01' => 'Enero', '02' => 'Febrero', '03' => 'Marzo', '04' => 'Abril',
            '05' => 'Mayo', '06' => 'Junio', '07' => 'Julio', '08' => 'Agosto',
            '09' => 'Septiembre', '10' => 'Octubre', '11' => 'Noviembre', '12' => 'Diciembre'
        ];

        $activePeriod = $request->input('tribute_period');

        if (!$activePeriod) {
            if (!empty($monthFilter)) {
                if (str_contains($monthFilter, '-')) {
                    [$year, $m] = explode('-', $monthFilter);
                    $mName = $spanishMonths[$m] ?? 'Agosto';
                    $activePeriod = "{$mName} {$year}";
                } else {
                    $mName = $spanishMonths[str_pad($monthFilter, 2, '0', STR_PAD_LEFT)] ?? 'Agosto';
                    $activePeriod = "{$mName} 2026";
                }
            } elseif (!empty($startDate)) {
                $parts = explode('-', $startDate);
                if (count($parts) >= 2) {
                    $year = $parts[0];
                    $m = $parts[1];
                    $mName = $spanishMonths[$m] ?? 'Agosto';
                    $activePeriod = "{$mName} {$year}";
                }
            }
        }

        if (!$activePeriod) {
            $activePeriod = 'Agosto 2026';
        }

        $tributeStatus = TributeStatusService::getTributeStatusForPeriod($activePeriod);

        // 6. Recent Transactions (Filtered)
        $recentTransactions = (clone $baseQuery)->with(['club', 'user'])
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get();

        // 6b. Cuenta corriente con ARFA (acumulada, sin filtro de período): lo que corresponde a ARFA
        // por pases cobrados menos lo ya pagado (egresos cuya categoría menciona "ARFA").
        $arfaBalance = self::arfaBalance();

        // 7. Institutional & Tariffs Data
        $institutional = Setting::getInstitutionalData();
        $totalClubsCount = Club::where('is_active', true)->count();

        return Inertia::render('Dashboard', [
            'kpis' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net_balance' => $netBalance,
                'cash_balance' => $cashBalance,
                'bank_balance' => $bankBalance,
                'income_cash' => $incomeCash,
                'income_bank' => $incomeBank,
                'expense_cash' => $expenseCash,
                'expense_bank' => $expenseBank,
                'total_clubs_count' => $totalClubsCount,
                'categories' => $categories,
                'arfa_distribution' => [
                    'total_arfa_pases' => $totalArfaPasses,
                    'total_afc_pases' => $totalAfcPasses,
                    'total_arfa_inscripciones' => $totalArfaInscriptions,
                    'total_afc_inscripciones' => $totalAfcInscriptions,
                    'total_arfa_overall' => $totalArfaOverall,
                    'total_afc_overall' => $totalAfcOverall,
                ],
                'arfa_balance' => $arfaBalance,
                'monthly_chart' => $monthlyChart,
            ],
            'tribute_status' => $tributeStatus,
            'recent_transactions' => $recentTransactions,
            'institutional' => $institutional,
            'filters' => $request->only(['month_filter', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Saldo acumulado con ARFA V Región.
     *
     * @return array{owed: float, paid: float, pending: float}
     */
    public static function arfaBalance(): array
    {
        $tramites = Transaction::splitTramites(Transaction::where('category', 'pase')->get());
        $owed = $tramites['pase_arfa'] + $tramites['inscripcion_arfa'];

        $arfaExpenseTypes = collect(Setting::getExpenseCategories())
            ->filter(fn ($cat) => isset($cat['id']) && stripos($cat['label'] ?? '', 'arfa') !== false)
            ->pluck('id')
            ->all();

        $paid = (float) Transaction::where('type', 'expense')
            ->get(['amount', 'breakdown'])
            ->filter(fn (Transaction $tx) => in_array($tx->breakdown['expense_type'] ?? null, $arfaExpenseTypes, true))
            ->sum('amount');

        return [
            'owed' => $owed,
            'paid' => $paid,
            'pending' => max(0.0, $owed - $paid),
        ];
    }
}
