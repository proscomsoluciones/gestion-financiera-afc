<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\Setting;
use App\Models\Transaction;
use App\Services\TributeStatusService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    /**
     * Allowed file types for uploaded vouchers: photos of paper receipts
     * (jpeg/png/webp/heic from phone cameras) or digital PDF invoices.
     */
    private const RECEIPT_IMAGE_RULE = 'nullable|file|mimes:jpeg,jpg,png,webp,heic,heif,pdf|max:25600';

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Transaction::with(['club', 'user']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('folio_number', 'like', "%{$search}%")
                  ->orWhere('concept', 'like', "%{$search}%")
                  ->orWhere('player_name', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('club_id')) {
            $clubVal = $request->input('club_id');
            if ($clubVal === 'afc' || $clubVal === 'null') {
                $query->whereNull('club_id');
            } else {
                $query->where('club_id', $clubVal);
            }
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $perPage = (int) $request->input('per_page', 50);
        if ($perPage <= 0) { $perPage = 50; }
        if ($perPage > 200) { $perPage = 200; }

        $transactions = $query->latest('id')->paginate($perPage)->withQueryString();

        // Metrics calculations
        $totalIncome = Transaction::where('type', 'income')->sum('amount');
        $totalExpense = Transaction::where('type', 'expense')->sum('amount');
        $balance = $totalIncome - $totalExpense;

        $clubs = Club::where('is_active', true)->orderBy('name')->get(['id', 'name', 'short_name', 'crest']);
        $nextFolio = Transaction::generateNextFolio();
        $tariffs = Setting::getTariffs();
        $institutional = Setting::getInstitutionalData();

        // Tribute Compliance Status for active period
        $tributePeriod = $request->input('tribute_period', 'Agosto 2026');
        $tributeStatus = TributeStatusService::getTributeStatusForPeriod($tributePeriod);

        // Voided transactions (audit trail)
        $voided = Transaction::onlyTrashed()
            ->with(['club', 'user', 'voidedBy'])
            ->latest('deleted_at')
            ->paginate(20, ['*'], 'voided_page')
            ->withQueryString();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'voided' => $voided,
            'filters' => array_merge(
                ['per_page' => $perPage],
                $request->only(['search', 'club_id', 'category', 'type', 'tribute_period', 'per_page'])
            ),
            'clubs' => $clubs,
            'tariffs' => $tariffs,
            'institutional' => $institutional,
            'other_income_categories' => Setting::getOtherIncomeCategories(),
            'expense_categories' => Setting::getExpenseCategories(),
            'tribute_status' => $tributeStatus,
            'metrics' => [
                'total_income' => (float) $totalIncome,
                'total_expense' => (float) $totalExpense,
                'balance' => (float) $balance,
                'next_folio' => $nextFolio,
            ],
            'flash' => [
                'success' => session('success'),
                'created_transaction' => session('created_transaction'),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $isExpense = $request->input('type') === 'expense';

        $rules = [
            'folio_number' => 'nullable|string|max:50',
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:50',
            'club_id' => 'nullable|exists:clubs,id',
            'amount' => 'required|numeric|min:0.01',
            'concept' => 'required|string|max:255',
            'period_month' => 'nullable|string|max:100',
            'player_name' => 'nullable|string|max:255',
            'payment_method' => 'required|in:efectivo,transferencia,deposito,cheque',
            'reference_number' => 'nullable|string|max:255',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'breakdown' => 'nullable|array',
            'receipt_image' => self::RECEIPT_IMAGE_RULE,
        ];

        $validated = $request->validate($rules);

        if ($request->hasFile('receipt_image')) {
            $path = $request->file('receipt_image')->store('vouchers', 'public');
            $validated['receipt_image'] = $path;
        }

        // Auto breakdown for tributo category if not provided
        if ($validated['category'] === 'tributo') {
            if (empty($validated['breakdown'])) {
                $tributoVal = (float) Setting::get('rate_tributo_club', 30000);
                $seleccionVal = (float) Setting::get('rate_aporte_seleccion', 10000);
                $validated['breakdown'] = [
                    'tributo_club' => $tributoVal,
                    'aporte_seleccion' => $seleccionVal,
                ];
            }
        }

        // Auto breakdown for pase category if not provided
        if ($validated['category'] === 'pase') {
            if (empty($validated['breakdown'])) {
                $conceptLower = strtolower($validated['concept']);
                if (str_contains($conceptLower, 'primera') || str_contains($conceptLower, 'inscrip')) {
                    $arfaCost = 0;
                } elseif (str_contains($conceptLower, 'femenino')) {
                    $arfaCost = 12000;
                } else {
                    $arfaCost = 17000;
                }
                $afcNet = max(0, (float) $validated['amount'] - $arfaCost);
                $validated['breakdown'] = [
                    'total_amount' => (float) $validated['amount'],
                    'arfa_cost' => (float) $arfaCost,
                    'afc_net' => (float) $afcNet,
                ];
            }
        }

        $validated['user_id'] = Auth::id();
        if (!empty($validated['folio_number'])) {
            $validated['folio_number'] = trim($validated['folio_number']);
        } else {
            $validated['folio_number'] = null;
        }

        $transaction = Transaction::create($validated);
        $transaction->load(['club', 'user']);

        $folioMsg = $transaction->folio_number ? "folio {$transaction->folio_number}" : "ID #{$transaction->id}";

        return redirect()->route('transactions.index')->with([
            'success' => "Comprobante ({$folioMsg}) emitido exitosamente.",
            'created_transaction' => $transaction,
        ]);
    }

    /**
     * Download transaction voucher as PDF document.
     */
    public function downloadPdf(Transaction $transaction)
    {
        $transaction->load(['club', 'user']);
        $institutional = Setting::getInstitutionalData();
        $amountInWords = \App\Services\NumberToWordsService::convert($transaction->amount);

        $pdf = Pdf::loadView('pdf.voucher', compact('transaction', 'institutional', 'amountInWords'));

        $folioStr = $transaction->folio_number ?: "ID_{$transaction->id}";
        $filename = "Comprobante_{$folioStr}.pdf";

        return $pdf->stream($filename);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction): Response
    {
        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction->load(['club', 'user']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        $rules = [
            'folio_number' => 'nullable|string|max:50',
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:50',
            'club_id' => 'nullable|exists:clubs,id',
            'amount' => 'required|numeric|min:0.01',
            'concept' => 'required|string|max:255',
            'period_month' => 'nullable|string|max:100',
            'player_name' => 'nullable|string|max:255',
            'payment_method' => 'required|in:efectivo,transferencia,deposito,cheque',
            'reference_number' => 'nullable|string|max:255',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'breakdown' => 'nullable|array',
            'receipt_image' => self::RECEIPT_IMAGE_RULE,
        ];

        $validated = $request->validate($rules);

        if ($request->hasFile('receipt_image')) {
            $path = $request->file('receipt_image')->store('vouchers', 'public');
            $validated['receipt_image'] = $path;
        }

        if (!empty($validated['folio_number'])) {
            $validated['folio_number'] = trim($validated['folio_number']);
        } else {
            $validated['folio_number'] = null;
        }

        $transaction->update($validated);

        $folioMsg = $transaction->folio_number ? "folio {$transaction->folio_number}" : "ID #{$transaction->id}";

        return redirect()->route('transactions.index')->with([
            'success' => "Comprobante ({$folioMsg}) actualizado exitosamente.",
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        $folio = $transaction->folio_number ? "folio {$transaction->folio_number}" : "registro ID #{$transaction->id}";

        $transaction->deleted_by = Auth::id();
        $transaction->void_reason = $validated['reason'] ?? null;
        $transaction->save();
        $transaction->delete();

        return redirect()->route('transactions.index')->with('success', "El comprobante ({$folio}) ha sido anulado.");
    }
}
