<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\Setting;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display executive reports dashboard.
     */
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $monthFilter = $request->input('month_filter'); // e.g. '2026-04' or '04'
        $year = (int) $request->input('year', 2026);
        $selectedClubId = $request->input('club_id');

        $baseQuery = Transaction::query();

        if (!empty($startDate) && !empty($endDate)) {
            $baseQuery->whereBetween('date', [$startDate, $endDate]);
        } elseif (!empty($monthFilter)) {
            if (str_contains($monthFilter, '-')) {
                [$y, $m] = explode('-', $monthFilter);
                $baseQuery->whereYear('date', $y)->whereMonth('date', $m);
            } else {
                $baseQuery->whereYear('date', $year)->whereMonth('date', $monthFilter);
            }
        }

        // Summary totals
        $totalIncome = (float) (clone $baseQuery)->where('type', 'income')->sum('amount');
        $totalExpense = (float) (clone $baseQuery)->where('type', 'expense')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;

        // Payment methods breakdown (Cash vs Bank)
        $incomeCash = (float) (clone $baseQuery)->where('type', 'income')->where('payment_method', 'efectivo')->sum('amount');
        $incomeBank = (float) (clone $baseQuery)->where('type', 'income')->whereIn('payment_method', ['transferencia', 'deposito', 'cheque'])->sum('amount');
        $expenseCash = (float) (clone $baseQuery)->where('type', 'expense')->where('payment_method', 'efectivo')->sum('amount');
        $expenseBank = (float) (clone $baseQuery)->where('type', 'expense')->whereIn('payment_method', ['transferencia', 'deposito', 'cheque'])->sum('amount');

        $cashBalance = $incomeCash - $expenseCash;
        $bankBalance = $incomeBank - $expenseBank;

        // Breakdown by category
        $categoryBreakdown = [
            'tributo' => (float) (clone $baseQuery)->where('category', 'tributo')->sum('amount'),
            'fondo_solidario' => (float) (clone $baseQuery)->where('category', 'fondo_solidario')->sum('amount'),
            'inscripcion' => (float) (clone $baseQuery)->where('category', 'inscripcion')->sum('amount'),
            'inscripcion_campeonato' => (float) (clone $baseQuery)->where('category', 'inscripcion_campeonato')->sum('amount'),
            'pase' => (float) (clone $baseQuery)->where('category', 'pase')->sum('amount'),
            'apelacion' => (float) (clone $baseQuery)->where('category', 'apelacion')->sum('amount'),
            'multa' => (float) (clone $baseQuery)->where('category', 'multa')->sum('amount'),
            'otro_ingreso' => (float) (clone $baseQuery)->where('category', 'otro_ingreso')->sum('amount'),
            'egreso' => (float) (clone $baseQuery)->where('category', 'egreso')->sum('amount'),
        ];

        // Monthly comparison for Annual Balance 2026
        $spanishMonths = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        $annualBalance = [];
        $runningBalance = 0;

        foreach ($spanishMonths as $index => $monthName) {
            $monthNum = str_pad($index + 1, 2, '0', STR_PAD_LEFT);
            $inc = (float) Transaction::where('type', 'income')->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');
            $exp = (float) Transaction::where('type', 'expense')->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');
            $monthNet = $inc - $exp;
            $runningBalance += $monthNet;

            $catTributo = (float) Transaction::where('category', 'tributo')->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');
            $catPase = (float) Transaction::where('category', 'pase')->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');
            $catInscripcion = (float) Transaction::whereIn('category', ['inscripcion', 'inscripcion_campeonato'])->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');
            $catMultaApelacion = (float) Transaction::whereIn('category', ['multa', 'apelacion'])->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');
            $catOtrosIngresos = (float) Transaction::whereIn('category', ['fondo_solidario', 'otro_ingreso'])->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');

            $annualBalance[] = [
                'month_num' => $monthNum,
                'month_name' => $monthName,
                'income' => $inc,
                'expense' => $exp,
                'net' => $monthNet,
                'accumulated' => $runningBalance,
                'categories' => [
                    'tributo' => $catTributo,
                    'pase' => $catPase,
                    'inscripcion' => $catInscripcion,
                    'multa_apelacion' => $catMultaApelacion,
                    'otros_ingresos' => $catOtrosIngresos,
                    'egresos' => $exp,
                ],
            ];
        }

        // Annual Passes Summary by month
        $monthlyPassesSummary = [];
        $totalPassesYearCount = 0;
        $totalPassesYearAmount = 0;
        $totalPassesYearArfa = 0;
        $totalPassesYearAfc = 0;

        foreach ($spanishMonths as $index => $monthName) {
            $monthNum = str_pad($index + 1, 2, '0', STR_PAD_LEFT);
            $txs = Transaction::where('category', 'pase')->whereYear('date', $year)->whereMonth('date', $monthNum)->get();
            $pCount = 0;
            foreach ($txs as $t) {
                if (is_array($t->breakdown) && !empty($t->breakdown['items']) && is_array($t->breakdown['items'])) {
                    $pCount += count($t->breakdown['items']);
                } else {
                    $pCount += 1;
                }
            }
            $pAmount = (float) $txs->sum('amount');
            $pArfa = (float) $txs->sum(function($t) {
                return isset($t->breakdown['arfa_cost']) ? (float)$t->breakdown['arfa_cost'] : (str_contains(strtolower($t->concept), 'femenino') ? 12000 : 17000);
            });
            $pAfc = max(0, $pAmount - $pArfa);

            $totalPassesYearCount += $pCount;
            $totalPassesYearAmount += $pAmount;
            $totalPassesYearArfa += $pArfa;
            $totalPassesYearAfc += $pAfc;

            $monthlyPassesSummary[] = [
                'month_name' => $monthName,
                'month_num' => $monthNum,
                'count' => $pCount,
                'amount' => $pAmount,
                'arfa_cost' => $pArfa,
                'afc_net' => $pAfc,
            ];
        }

        // Compute filtered passes count for top metric card when month or date filters apply
        $filteredPassesTxs = (clone $baseQuery)->where('category', 'pase')->get();
        $filteredPassesCount = 0;
        foreach ($filteredPassesTxs as $t) {
            if (is_array($t->breakdown) && !empty($t->breakdown['items']) && is_array($t->breakdown['items'])) {
                $filteredPassesCount += count($t->breakdown['items']);
            } else {
                $filteredPassesCount += 1;
            }
        }
        $filteredPassesAmount = (float) $filteredPassesTxs->sum('amount');
        $filteredPassesArfa = (float) $filteredPassesTxs->sum(function($t) {
            return isset($t->breakdown['arfa_cost']) ? (float)$t->breakdown['arfa_cost'] : (str_contains(strtolower($t->concept), 'femenino') ? 12000 : 17000);
        });
        $filteredPassesAfc = max(0, $filteredPassesAmount - $filteredPassesArfa);

        // Club Statement report calculation
        $allClubs = Club::where('is_active', true)->orderBy('name')->get();
        $targetClub = null;
        if ($selectedClubId) {
            $targetClub = $allClubs->firstWhere('id', (int)$selectedClubId);
        }
        if (!$targetClub && $allClubs->count() > 0) {
            $targetClub = $allClubs->first();
        }

        $clubStatement = $targetClub ? self::buildClubStatement($targetClub, $year, $monthFilter, $startDate, $endDate) : null;

        // Solidarity Funds Report Calculation
        $solidarityIncomes = (clone $baseQuery)->where('category', 'fondo_solidario')->where('type', 'income')->with(['club', 'user'])->latest('date')->get();
        $solidarityExpenses = (clone $baseQuery)->where(function($q) {
            $q->where('category', 'fondo_solidario')
              ->orWhere('concept', 'like', '%solidario%')
              ->orWhere('concept', 'like', '%auxilio%');
        })->where('type', 'expense')->with(['club', 'user'])->latest('date')->get();

        $solidarityTotalIncome = (float) $solidarityIncomes->sum('amount');
        $solidarityTotalExpense = (float) $solidarityExpenses->sum('amount');
        $solidarityBalance = $solidarityTotalIncome - $solidarityTotalExpense;

        $solidarityReport = [
            'total_collected' => $solidarityTotalIncome,
            'total_delivered' => $solidarityTotalExpense,
            'pending_balance' => $solidarityBalance,
            'incomes' => $solidarityIncomes,
            'expenses' => $solidarityExpenses,
        ];

        $perPage = (int) $request->input('per_page', 50);
        if ($perPage <= 0) { $perPage = 50; }
        if ($perPage > 200) { $perPage = 200; }

        // All Expenses for Libro de Respaldos preview
        $allExpenses = (clone $baseQuery)->where('type', 'expense')->with(['club', 'user'])->latest('date')->latest('id')->get();

        // Transactions list for report table preview (paginated)
        $transactions = (clone $baseQuery)->with(['club', 'user'])->latest('date')->latest('id')->paginate($perPage)->withQueryString();

        $institutional = Setting::getInstitutionalData();

        return Inertia::render('Reports/Index', [
            'summary' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net_balance' => $netBalance,
                'cash_balance' => $cashBalance,
                'bank_balance' => $bankBalance,
                'income_cash' => $incomeCash,
                'income_bank' => $incomeBank,
                'expense_cash' => $expenseCash,
                'expense_bank' => $expenseBank,
                'categories' => $categoryBreakdown,
            ],
            'annual_balance' => $annualBalance,
            'passes_metrics' => [
                'total_count' => $filteredPassesCount,
                'total_amount' => $filteredPassesAmount,
                'total_arfa' => $filteredPassesArfa,
                'total_afc' => $filteredPassesAfc,
                'monthly_summary' => $monthlyPassesSummary,
            ],
            'transactions' => $transactions,
            'all_expenses' => $allExpenses,
            'solidarity_report' => $solidarityReport,
            'institutional' => $institutional,
            'clubs' => $allClubs,
            'club_statement' => $clubStatement,
            'filters' => [
                'month_filter' => $monthFilter,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'year' => $year,
                'club_id' => $targetClub ? $targetClub->id : null,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Download Club Financial Statement PDF (Cartola del Club).
     */
    public function downloadClubStatementPdf(Request $request, Club $club)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $monthFilter = $request->input('month_filter');
        $year = (int) $request->input('year', 2026);

        $statement = self::buildClubStatement($club, $year, $monthFilter, $startDate, $endDate);
        $institutional = Setting::getInstitutionalData();

        $pdf = Pdf::loadView('pdf.club_statement', compact('statement', 'institutional'));
        $pdf->setPaper('a4', 'portrait');

        $safeName = str_replace([' ', '/', ':'], '_', $club->name);
        return $pdf->stream("Cartola_Financiera_{$safeName}.pdf");
    }

    /**
     * Download "Libro de Respaldos" PDF with Expense Details + Photo Vouchers Appendix.
     */
    public function downloadLibroRespaldosPdf(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $monthFilter = $request->input('month_filter');
        $year = (int) $request->input('year', 2026);

        $query = Transaction::where('type', 'expense')->with(['club']);

        $periodTitle = "Temporada {$year}";

        if (!empty($startDate) && !empty($endDate)) {
            $query->whereBetween('date', [$startDate, $endDate]);
            $periodTitle = "Del {$startDate} al {$endDate}";
        } elseif (!empty($monthFilter)) {
            if (str_contains($monthFilter, '-')) {
                [$y, $m] = explode('-', $monthFilter);
                $query->whereYear('date', $y)->whereMonth('date', $m);
                $periodTitle = self::formatSpanishMonthPeriod($m, $y);
            } else {
                $query->whereYear('date', $year)->whereMonth('date', $monthFilter);
                $periodTitle = self::formatSpanishMonthPeriod($monthFilter, $year);
            }
        } else {
            $query->whereYear('date', $year);
        }

        $expenses = $query->orderBy('date', 'asc')->get();

        // Calculate totals for period
        $incomeQuery = Transaction::where('type', 'income');
        if (!empty($startDate) && !empty($endDate)) {
            $incomeQuery->whereBetween('date', [$startDate, $endDate]);
        } elseif (!empty($monthFilter)) {
            if (str_contains($monthFilter, '-')) {
                [$y, $m] = explode('-', $monthFilter);
                $incomeQuery->whereYear('date', $y)->whereMonth('date', $m);
            } else {
                $incomeQuery->whereYear('date', $year)->whereMonth('date', $monthFilter);
            }
        }

        $totalIncome = (float) $incomeQuery->sum('amount');
        $totalExpense = (float) $expenses->sum('amount');
        $balance = $totalIncome - $totalExpense;

        // Process images for DomPDF (convert to base64 if local file exists)
        foreach ($expenses as $exp) {
            $exp->receipt_base64 = null;
            if ($exp->receipt_image) {
                $path = storage_path('app/public/' . $exp->receipt_image);
                if (!file_exists($path)) {
                    $path = public_path('storage/' . $exp->receipt_image);
                }
                if (file_exists($path)) {
                    $type = pathinfo($path, PATHINFO_EXTENSION);
                    $data = file_get_contents($path);
                    $exp->receipt_base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                }
            }
        }

        $institutional = Setting::getInstitutionalData();

        $pdf = Pdf::loadView('pdf.libro_respaldos', compact(
            'expenses',
            'totalIncome',
            'totalExpense',
            'balance',
            'periodTitle',
            'institutional'
        ));

        $pdf->setPaper('a4', 'portrait');

        $safePeriod = str_replace([' ', '/', ':'], '_', $periodTitle);
        return $pdf->stream("Libro_de_Respaldos_{$safePeriod}.pdf");
    }

    /**
     * Download Monthly / Range Financial Report PDF.
     */
    public function downloadMonthlyPdf(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $monthFilter = $request->input('month_filter');
        $year = (int) $request->input('year', 2026);

        $query = Transaction::with(['club', 'user']);
        $periodTitle = "Temporada {$year}";

        if (!empty($startDate) && !empty($endDate)) {
            $query->whereBetween('date', [$startDate, $endDate]);
            $periodTitle = "Del {$startDate} al {$endDate}";
        } elseif (!empty($monthFilter)) {
            if (str_contains($monthFilter, '-')) {
                [$y, $m] = explode('-', $monthFilter);
                $query->whereYear('date', $y)->whereMonth('date', $m);
                $periodTitle = self::formatSpanishMonthPeriod($m, $y);
            } else {
                $query->whereYear('date', $year)->whereMonth('date', $monthFilter);
                $periodTitle = self::formatSpanishMonthPeriod($monthFilter, $year);
            }
        } else {
            $query->whereYear('date', $year);
        }

        $transactions = $query->orderBy('date', 'asc')->get();

        $totalIncome = (float) (clone $query)->where('type', 'income')->sum('amount');
        $totalExpense = (float) (clone $query)->where('type', 'expense')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;
        $balance = $netBalance;

        $institutional = Setting::getInstitutionalData();

        $pdf = Pdf::loadView('pdf.informe_mensual', compact(
            'transactions',
            'totalIncome',
            'totalExpense',
            'netBalance',
            'balance',
            'periodTitle',
            'institutional'
        ));

        return $pdf->stream("Informe_Financiero_{$periodTitle}.pdf");
    }

    /**
     * Download Annual Balance PDF.
     */
    public function downloadAnnualBalancePdf(Request $request)
    {
        $year = (int) $request->input('year', 2026);
        $spanishMonths = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        $annualBalance = [];
        $runningBalance = 0;
        $totalIncomeYear = 0;
        $totalExpenseYear = 0;

        foreach ($spanishMonths as $index => $monthName) {
            $monthNum = str_pad($index + 1, 2, '0', STR_PAD_LEFT);
            $inc = (float) Transaction::where('type', 'income')->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');
            $exp = (float) Transaction::where('type', 'expense')->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');
            $monthNet = $inc - $exp;
            $runningBalance += $monthNet;

            $totalIncomeYear += $inc;
            $totalExpenseYear += $exp;

            $catTributo = (float) Transaction::where('category', 'tributo')->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');
            $catPase = (float) Transaction::where('category', 'pase')->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');
            $catInscripcion = (float) Transaction::whereIn('category', ['inscripcion', 'inscripcion_campeonato'])->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');
            $catMultaApelacion = (float) Transaction::whereIn('category', ['multa', 'apelacion'])->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');
            $catOtrosIngresos = (float) Transaction::whereIn('category', ['fondo_solidario', 'otro_ingreso'])->whereYear('date', $year)->whereMonth('date', $monthNum)->sum('amount');

            $annualBalance[] = [
                'month_name' => $monthName,
                'income' => $inc,
                'expense' => $exp,
                'net' => $monthNet,
                'accumulated' => $runningBalance,
                'categories' => [
                    'tributo' => $catTributo,
                    'pase' => $catPase,
                    'inscripcion' => $catInscripcion,
                    'multa_apelacion' => $catMultaApelacion,
                    'otros_ingresos' => $catOtrosIngresos,
                    'egresos' => $exp,
                ],
            ];
        }

        $netBalanceYear = $totalIncomeYear - $totalExpenseYear;
        $institutional = Setting::getInstitutionalData();

        $pdf = Pdf::loadView('pdf.balance_anual', compact(
            'annualBalance',
            'totalIncomeYear',
            'totalExpenseYear',
            'netBalanceYear',
            'year',
            'institutional'
        ));

        return $pdf->stream("Balance_Anual_{$year}.pdf");
    }

    /**
     * Helper to build a complete financial statement for a given club.
     */
    private static function buildClubStatement(
        Club $club,
        int $year = 2026,
        ?string $monthFilter = null,
        ?string $startDate = null,
        ?string $endDate = null
    ): array {
        $spanishMonths = [
            '01' => 'Enero', '02' => 'Febrero', '03' => 'Marzo', '04' => 'Abril',
            '05' => 'Mayo', '06' => 'Junio', '07' => 'Julio', '08' => 'Agosto',
            '09' => 'Septiembre', '10' => 'Octubre', '11' => 'Noviembre', '12' => 'Diciembre'
        ];

        $rateTributo = (float) Setting::get('rate_tributo_club', 30000);

        $query = Transaction::where('club_id', $club->id);
        $periodTitle = "Temporada {$year}";

        if (!empty($startDate) && !empty($endDate)) {
            $query->whereBetween('date', [$startDate, $endDate]);
            $periodTitle = "Del {$startDate} al {$endDate}";
        } elseif (!empty($monthFilter)) {
            if (str_contains($monthFilter, '-')) {
                [$y, $m] = explode('-', $monthFilter);
                $query->whereYear('date', $y)->whereMonth('date', $m);
                $periodTitle = self::formatSpanishMonthPeriod($m, $y);
            } else {
                $query->whereYear('date', $year)->whereMonth('date', $monthFilter);
                $periodTitle = self::formatSpanishMonthPeriod($monthFilter, $year);
            }
        } else {
            $query->whereYear('date', $year);
        }

        $transactions = $query->orderBy('date', 'desc')->get();

        $totalPaid = (float) $transactions->where('type', 'income')->sum('amount');

        $startTributeMonth = Setting::getStartTributeMonth();
        $currentMonth = \Carbon\Carbon::now()->month;

        // Tribute compliance status per month
        $tributeHistory = [];
        $pendingTributesCount = 0;
        $totalPendingAmount = 0;

        foreach ($spanishMonths as $mNum => $mName) {
            $periodStr = "{$mName} {$year}";
            $tx = Transaction::where('club_id', $club->id)
                ->where('category', 'tributo')
                ->where('period_month', $periodStr)
                ->first();

            if ($tx) {
                $tributeHistory[] = [
                    'month_num' => $mNum,
                    'month_name' => $mName,
                    'status' => 'paid',
                    'status_label' => 'Pagado',
                    'payment_date' => $tx->date,
                    'folio_number' => $tx->folio_number,
                    'amount' => (float) $tx->amount,
                ];
            } else {
                if ((int)$mNum < $startTributeMonth) {
                    $tributeHistory[] = [
                        'month_num' => $mNum,
                        'month_name' => $mName,
                        'status' => 'exempt',
                        'status_label' => 'Previo a Gestión (No Aplica)',
                        'payment_date' => null,
                        'folio_number' => null,
                        'amount' => 0,
                    ];
                } else {
                    $isOverdue = ((int)$mNum < $currentMonth);
                    $status = $isOverdue ? 'overdue' : 'pending';
                    if ($isOverdue) {
                        $pendingTributesCount++;
                        $totalPendingAmount += $rateTributo;
                    }

                    $tributeHistory[] = [
                        'month_num' => $mNum,
                        'month_name' => $mName,
                        'status' => $status,
                        'status_label' => $status === 'overdue' ? 'Vencido / Moroso' : 'Por Vencer (En Plazo)',
                        'payment_date' => null,
                        'folio_number' => null,
                        'amount' => 0,
                    ];
                }
            }
        }

        $solidarityList = $transactions->where('category', 'fondo_solidario')->where('type', 'income')->values();
        $solidarityReceivedList = Transaction::where('club_id', $club->id)
            ->where('category', 'fondo_solidario')
            ->where('type', 'expense')
            ->whereYear('date', $year)
            ->orderBy('date', 'desc')
            ->get();

        $totalSolidarityContributed = (float) $solidarityList->sum('amount');
        $totalSolidarityReceived = (float) $solidarityReceivedList->sum('amount');

        $totalsByCategory = [
            'tributo' => (float) $transactions->where('category', 'tributo')->sum('amount'),
            'pase' => (float) $transactions->where('category', 'pase')->sum('amount'),
            'inscripcion' => (float) $transactions->whereIn('category', ['inscripcion', 'inscripcion_campeonato'])->sum('amount'),
            'multas_apelaciones' => (float) $transactions->whereIn('category', ['multa', 'apelacion'])->sum('amount'),
            'fondo_solidario' => $totalSolidarityContributed,
            'otros' => (float) $transactions->where('category', 'otro_ingreso')->sum('amount'),
        ];

        $passesList = $transactions->where('category', 'pase')->map(function ($tx) {
            $arfaCost = isset($tx->breakdown['arfa_cost']) ? (float) $tx->breakdown['arfa_cost'] : (str_contains(strtolower($tx->concept), 'femenino') ? 12000 : 17000);
            if ((float) $tx->amount < $arfaCost) {
                $arfaCost = (float) $tx->amount;
            }
            $afcNet = max(0, (float) $tx->amount - $arfaCost);
            return [
                'id' => $tx->id,
                'folio_number' => $tx->folio_number,
                'date' => $tx->date,
                'concept' => $tx->concept,
                'total_amount' => (float) $tx->amount,
                'arfa_cost' => $arfaCost,
                'afc_net' => $afcNet,
            ];
        })->values();

        $totalArfaPases = (float) $passesList->sum('arfa_cost');
        $totalAfcPasesNet = (float) $passesList->sum('afc_net');

        $passesCount = 0;
        foreach ($transactions->where('category', 'pase') as $tx) {
            if (is_array($tx->breakdown) && !empty($tx->breakdown['items']) && is_array($tx->breakdown['items'])) {
                $passesCount += count($tx->breakdown['items']);
            } else {
                $passesCount += 1;
            }
        }
        $passesFemeninoCount = $passesList->filter(fn($p) => str_contains(strtolower($p['concept']), 'femenino'))->count();
        $passesAdultCount = max(0, $passesCount - $passesFemeninoCount);

        $inscriptionsList = $transactions->whereIn('category', ['inscripcion', 'inscripcion_campeonato'])->values();
        $penaltiesList = $transactions->whereIn('category', ['multa', 'apelacion'])->values();

        return [
            'club' => $club,
            'year' => $year,
            'period_title' => $periodTitle,
            'total_paid' => $totalPaid,
            'pending_tributes_count' => $pendingTributesCount,
            'total_pending_amount' => $totalPendingAmount,
            'is_up_to_date' => ($pendingTributesCount === 0),
            'totals_by_category' => $totalsByCategory,
            'passes_list' => $passesList,
            'passes_count' => $passesCount,
            'passes_adult_count' => $passesAdultCount,
            'passes_femenino_count' => $passesFemeninoCount,
            'total_arfa_pases' => $totalArfaPases,
            'total_afc_pases_net' => $totalAfcPasesNet,
            'inscriptions_list' => $inscriptionsList,
            'penalties_list' => $penaltiesList,
            'solidarity_list' => $solidarityList,
            'solidarity_received_list' => $solidarityReceivedList,
            'total_solidarity_contributed' => $totalSolidarityContributed,
            'tribute_history' => $tributeHistory,
            'transactions' => $transactions,
        ];
    }

    /**
     * Helper to format period names in Spanish.
     */
    private static function formatSpanishMonthPeriod($m, $y): string
    {
        $months = [
            '01' => 'Enero', '02' => 'Febrero', '03' => 'Marzo', '04' => 'Abril',
            '05' => 'Mayo', '06' => 'Junio', '07' => 'Julio', '08' => 'Agosto',
            '09' => 'Septiembre', '10' => 'Octubre', '11' => 'Noviembre', '12' => 'Diciembre'
        ];
        $mStr = str_pad($m, 2, '0', STR_PAD_LEFT);
        $name = $months[$mStr] ?? 'Período';
        return "{$name} {$y}";
    }

    /**
     * Download Club Financial Compliance Certificate (Certificado de Paz y Salvo).
     */
    public function downloadClubCertificatePdf(Request $request, Club $club)
    {
        $year = (int) $request->input('year', 2026);
        $statement = self::buildClubStatement($club, $year);
        $institutional = Setting::getInstitutionalData();

        $pdf = Pdf::loadView('pdf.club_certificate', compact('club', 'statement', 'institutional', 'year'));
        $pdf->setPaper('a4', 'portrait');

        $safeName = str_replace([' ', '/', ':'], '_', $club->name);
        return $pdf->stream("Certificado_Paz_y_Salvo_{$safeName}.pdf");
    }

    /**
     * Download ARFA Quinta Región Passes Rendition Sheet PDF.
     */
    public function downloadArfaRendicionPdf(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $monthFilter = $request->input('month_filter');
        $year = (int) $request->input('year', 2026);

        $query = Transaction::where('category', 'pase')->with(['club']);
        $periodTitle = "Temporada {$year}";

        if (!empty($startDate) && !empty($endDate)) {
            $query->whereBetween('date', [$startDate, $endDate]);
            $periodTitle = "Del {$startDate} al {$endDate}";
        } elseif (!empty($monthFilter)) {
            if (str_contains($monthFilter, '-')) {
                [$y, $m] = explode('-', $monthFilter);
                $query->whereYear('date', $y)->whereMonth('date', $m);
                $periodTitle = self::formatSpanishMonthPeriod($m, $y);
            } else {
                $query->whereYear('date', $year)->whereMonth('date', $monthFilter);
                $periodTitle = self::formatSpanishMonthPeriod($monthFilter, $year);
            }
        } else {
            $query->whereYear('date', $year);
        }

        $passes = $query->orderBy('date', 'asc')->get();

        $totalAmount = (float) $passes->sum('amount');
        $totalArfa = (float) $passes->sum(function($p) {
            return isset($p->breakdown['arfa_cost']) ? (float)$p->breakdown['arfa_cost'] : (str_contains(strtolower($p->concept), 'femenino') ? 12000 : 17000);
        });
        $totalAfcNet = max(0, $totalAmount - $totalArfa);

        $totalPassesCount = 0;
        foreach ($passes as $p) {
            if (is_array($p->breakdown) && !empty($p->breakdown['items']) && is_array($p->breakdown['items'])) {
                $totalPassesCount += count($p->breakdown['items']);
            } else {
                $totalPassesCount += 1;
            }
        }

        $institutional = Setting::getInstitutionalData();

        $pdf = Pdf::loadView('pdf.arfa_rendicion', compact('passes', 'totalAmount', 'totalArfa', 'totalAfcNet', 'totalPassesCount', 'periodTitle', 'institutional'));
        $pdf->setPaper('a4', 'portrait');

        $safePeriod = str_replace([' ', '/', ':'], '_', $periodTitle);
        return $pdf->stream("Control_Pases_{$safePeriod}.pdf");
    }

    /**
     * Export Transactions to native Excel (.xls) spreadsheet with custom styles and totals.
     */
    public function exportCsv(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $monthFilter = $request->input('month_filter');
        $year = (int) $request->input('year', 2026);

        $query = Transaction::with(['club', 'user']);

        if (!empty($startDate) && !empty($endDate)) {
            $query->whereBetween('date', [$startDate, $endDate]);
        } elseif (!empty($monthFilter)) {
            if (str_contains($monthFilter, '-')) {
                [$y, $m] = explode('-', $monthFilter);
                $query->whereYear('date', $y)->whereMonth('date', $m);
            } else {
                $query->whereYear('date', $year)->whereMonth('date', $monthFilter);
            }
        }

        $transactions = $query->orderBy('date', 'asc')->get();

        $institutional = Setting::getInstitutionalData();
        $assocName = $institutional['association_name'] ?? 'ASOCIACIÓN DE FÚTBOL CATEMU';

        $totalIncome = (float) $transactions->where('type', 'income')->sum('amount');
        $totalExpense = (float) $transactions->where('type', 'expense')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;

        $filename = "Movimientos_Contables_Catemu_" . date('Ymd_His') . ".xls";

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($transactions, $assocName, $totalIncome, $totalExpense, $netBalance) {
            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
            echo '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Movimientos Contables</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
            echo '<style>';
            echo 'body { font-family: Arial, sans-serif; font-size: 11px; }';
            echo '.header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }';
            echo '.title { font-size: 16px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; }';
            echo '.subtitle { font-size: 12px; font-weight: bold; color: #15803d; text-transform: uppercase; }';
            echo '.data-table { width: 100%; border-collapse: collapse; }';
            echo '.data-table th { background-color: #15803d; color: #ffffff; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #0f766e; text-transform: uppercase; font-size: 10px; }';
            echo '.data-table td { padding: 6px; border: 1px solid #cbd5e1; font-size: 10px; }';
            echo '.income { color: #047857; font-weight: bold; text-align: right; }';
            echo '.expense { color: #b91c1c; font-weight: bold; text-align: right; }';
            echo '.summary-row { background-color: #f1f5f9; font-weight: bold; font-size: 11px; }';
            echo '.summary-income { background-color: #ecfdf5; color: #047857; font-weight: bold; }';
            echo '.summary-expense { background-color: #fef2f2; color: #b91c1c; font-weight: bold; }';
            echo '.summary-net { background-color: #eff6ff; color: #1e40af; font-weight: bold; }';
            echo '</style>';
            echo '</head><body>';

            echo '<table class="header-table">';
            echo '<tr><td colspan="10" class="title">' . htmlspecialchars($assocName) . '</td></tr>';
            echo '<tr><td colspan="10" class="subtitle">INFORME DE MOVIMIENTOS CONTABLES Y LIBRO DE CAJA</td></tr>';
            echo '<tr><td colspan="10">Generado el: ' . date('d/m/Y H:i') . ' hrs | Total Registros: ' . count($transactions) . '</td></tr>';
            echo '<tr><td colspan="10">&nbsp;</td></tr>';
            echo '</table>';

            echo '<table class="data-table">';
            echo '<thead><tr>';
            echo '<th>N° Folio</th>';
            echo '<th>Fecha</th>';
            echo '<th>Tipo</th>';
            echo '<th>Categoría</th>';
            echo '<th>Club / Entidad</th>';
            echo '<th>Concepto / Detalle</th>';
            echo '<th style="text-align: right;">Monto ($ CLP)</th>';
            echo '<th>Método de Pago</th>';
            echo '<th>N° Referencia</th>';
            echo '<th>Registrado Por</th>';
            echo '</tr></thead>';
            echo '<tbody>';

            foreach ($transactions as $tx) {
                $isIncome = ($tx->type === 'income');
                $montoStr = ($isIncome ? '+' : '-') . '$' . number_format($tx->amount, 0, ',', '.');
                $classStr = $isIncome ? 'income' : 'expense';

                echo '<tr>';
                echo '<td><strong>' . htmlspecialchars($tx->folio_number) . '</strong></td>';
                echo '<td>' . htmlspecialchars($tx->formatted_date) . '</td>';
                echo '<td>' . ($isIncome ? 'INGRESO' : 'EGRESO') . '</td>';
                echo '<td>' . htmlspecialchars(ucfirst($tx->category)) . '</td>';
                echo '<td>' . htmlspecialchars($tx->club ? $tx->club->name : 'Asociación (General)') . '</td>';
                echo '<td>' . htmlspecialchars($tx->concept) . '</td>';
                echo '<td class="' . $classStr . '">' . $montoStr . '</td>';
                echo '<td>' . htmlspecialchars(ucfirst($tx->payment_method)) . '</td>';
                echo '<td>' . htmlspecialchars($tx->reference_number ?? '-') . '</td>';
                echo '<td>' . htmlspecialchars($tx->user ? $tx->user->name : 'Sistema') . '</td>';
                echo '</tr>';
            }

            echo '<tr class="summary-row summary-income">';
            echo '<td colspan="6" style="text-align: right;">TOTAL INGRESOS RECAUDADOS:</td>';
            echo '<td style="text-align: right;">+$' . number_format($totalIncome, 0, ',', '.') . '</td>';
            echo '<td colspan="3"></td>';
            echo '</tr>';

            echo '<tr class="summary-row summary-expense">';
            echo '<td colspan="6" style="text-align: right;">TOTAL EGRESOS DESEMBOLSADOS:</td>';
            echo '<td style="text-align: right;">-$' . number_format($totalExpense, 0, ',', '.') . '</td>';
            echo '<td colspan="3"></td>';
            echo '</tr>';

            echo '<tr class="summary-row summary-net">';
            echo '<td colspan="6" style="text-align: right;">BALANCE NETO FINAL:</td>';
            echo '<td style="text-align: right;">$' . number_format($netBalance, 0, ',', '.') . '</td>';
            echo '<td colspan="3"></td>';
            echo '</tr>';

            echo '</tbody></table>';
            echo '</body></html>';
        };

        return response()->stream($callback, 200, $headers);
    }
}
