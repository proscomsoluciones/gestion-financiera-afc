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
        $passTransactions = (clone $baseQuery)->where('category', 'pase')->get();
        $totalArfaPasses = 0;
        $totalAfcPasses = 0;

        foreach ($passTransactions as $tx) {
            $arfaCost = $tx->breakdown['arfa_cost'] ?? 17000;
            $afcMargin = $tx->breakdown['afc_margin'] ?? ($tx->amount - $arfaCost);
            $totalArfaPasses += $arfaCost;
            $totalAfcPasses += $afcMargin;
        }

        $inscriptionTransactions = (clone $baseQuery)->where('category', 'inscripcion')->get();
        $totalArfaInscriptions = 0; // Always $0 CLP in ARFA V Región
        $totalAfcInscriptions = (float) $inscriptionTransactions->sum('amount'); // 100% AFC

        $totalArfaOverall = $totalArfaPasses + $totalArfaInscriptions;
        $totalAfcOverall = $totalAfcPasses + $totalAfcInscriptions;

        // 3. Category Breakdown (Filtered)
        $categories = [
            'tributo' => (float) (clone $baseQuery)->where('category', 'tributo')->sum('amount'),
            'fondo_solidario' => (float) (clone $baseQuery)->where('category', 'fondo_solidario')->sum('amount'),
            'inscripcion' => (float) (clone $baseQuery)->where('category', 'inscripcion')->sum('amount'),
            'inscripcion_campeonato' => (float) (clone $baseQuery)->where('category', 'inscripcion_campeonato')->sum('amount'),
            'pase' => (float) (clone $baseQuery)->where('category', 'pase')->sum('amount'),
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
            ->latest('id')
            ->take(10)
            ->get();

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
                'monthly_chart' => $monthlyChart,
            ],
            'tribute_status' => $tributeStatus,
            'recent_transactions' => $recentTransactions,
            'institutional' => $institutional,
            'filters' => $request->only(['month_filter', 'start_date', 'end_date']),
        ]);
    }
}
