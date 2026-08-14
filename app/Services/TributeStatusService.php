<?php

namespace App\Services;

use App\Models\Club;
use App\Models\Transaction;
use Carbon\Carbon;

class TributeStatusService
{
    /**
     * Map month names in Spanish to month number (1-12).
     */
    protected static array $spanishMonths = [
        'enero' => 1,
        'febrero' => 2,
        'marzo' => 3,
        'abril' => 4,
        'mayo' => 5,
        'junio' => 6,
        'julio' => 7,
        'agosto' => 8,
        'septiembre' => 9,
        'octubre' => 10,
        'noviembre' => 11,
        'diciembre' => 12,
    ];

    /**
     * Get the last business day (días hábiles: Monday-Friday) of a given month and year.
     */
    public static function getLastBusinessDayOfMonth(int $year, int $month): Carbon
    {
        // Start at last day of the month
        $date = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        // If Saturday (6), subtract 1 day -> Friday
        if ($date->dayOfWeek === Carbon::SATURDAY) {
            $date->subDay();
        }
        // If Sunday (0), subtract 2 days -> Friday
        elseif ($date->dayOfWeek === Carbon::SUNDAY) {
            $date->subDays(2);
        }

        return $date->startOfDay();
    }

    /**
     * Parse month & year string like "Agosto 2026" or "08-2026".
     */
    public static function parsePeriodString(string $periodMonth): array
    {
        $parts = explode(' ', trim($periodMonth));
        if (count($parts) === 2) {
            $monthName = mb_strtolower($parts[0]);
            $year = (int) $parts[1];
            $monthNum = self::$spanishMonths[$monthName] ?? Carbon::now()->month;
            return [$year, $monthNum];
        }

        return [Carbon::now()->year, Carbon::now()->month];
    }

    /**
     * Get tribute compliance status for all active clubs for a specific period (e.g. "Agosto 2026").
     */
    public static function getTributeStatusForPeriod(string $periodMonth): array
    {
        [$year, $monthNum] = self::parsePeriodString($periodMonth);
        $dueDate = self::getLastBusinessDayOfMonth($year, $monthNum);
        $today = Carbon::now()->startOfDay();

        $clubs = Club::where('is_active', true)->orderBy('name')->get();

        // Fetch all tributo transactions for this period_month
        $tributeTransactions = Transaction::where('category', 'tributo')
            ->where('period_month', $periodMonth)
            ->get()
            ->keyBy('club_id');

        $statusList = [];

        foreach ($clubs as $club) {
            $payment = $tributeTransactions->get($club->id);

            if ($payment) {
                $paymentDate = Carbon::parse($payment->date)->startOfDay();
                $paidOnTime = $paymentDate->lessThanOrEqualTo($dueDate);

                $statusList[] = [
                    'club_id' => $club->id,
                    'club_name' => $club->name,
                    'short_name' => $club->short_name,
                    'status' => 'paid',
                    'status_label' => $paidOnTime ? 'Pagado en Fecha' : 'Pagado Fuera de Plazo',
                    'status_color' => $paidOnTime ? 'emerald' : 'amber',
                    'badge' => $paidOnTime ? '🟢 Al Día' : '🟡 Pagado Atrasado',
                    'payment_date' => Carbon::parse($payment->date)->format('d-m-Y'),
                    'folio_number' => $payment->folio_number,
                    'amount' => (float) $payment->amount,
                    'due_date' => $dueDate->format('d-m-Y'),
                    'due_date_formatted' => $dueDate->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY'),
                ];
            } else {
                $isOverdue = $today->greaterThan($dueDate);

                $statusList[] = [
                    'club_id' => $club->id,
                    'club_name' => $club->name,
                    'short_name' => $club->short_name,
                    'status' => $isOverdue ? 'overdue' : 'pending',
                    'status_label' => $isOverdue ? 'Vencido / Moroso' : 'Pendiente de Pago',
                    'status_color' => $isOverdue ? 'rose' : 'blue',
                    'badge' => $isOverdue ? '🔴 Vencido / Moroso' : '🔵 En Plazo Hábil',
                    'payment_date' => null,
                    'folio_number' => null,
                    'amount' => 0,
                    'due_date' => $dueDate->format('d-m-Y'),
                    'due_date_formatted' => $dueDate->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY'),
                ];
            }
        }

        return [
            'period_month' => $periodMonth,
            'due_date' => $dueDate->format('d-m-Y'),
            'due_date_formatted' => $dueDate->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
            'is_due_passed' => $today->greaterThan($dueDate),
            'summary' => [
                'total_clubs' => count($statusList),
                'paid_count' => collect($statusList)->where('status', 'paid')->count(),
                'overdue_count' => collect($statusList)->where('status', 'overdue')->count(),
                'pending_count' => collect($statusList)->where('status', 'pending')->count(),
            ],
            'clubs' => $statusList,
        ];
    }
}
