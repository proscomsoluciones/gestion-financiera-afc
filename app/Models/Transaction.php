<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'folio_number',
        'type',
        'category',
        'club_id',
        'amount',
        'breakdown',
        'concept',
        'period_month',
        'player_name',
        'payment_method',
        'reference_number',
        'receipt_image',
        'user_id',
        'date',
        'notes',
    ];

    protected $casts = [
        'breakdown' => 'array',
        'amount' => 'float',
        'date' => 'date:Y-m-d',
    ];

    protected $appends = [
        'receipt_image_url',
        'formatted_date',
        'category_label',
    ];

    protected static function boot()
    {
        parent::boot();
    }

    public function getCategoryLabelAttribute(): string
    {
        if ($this->type === 'expense') {
            $typeKey = $this->breakdown['expense_type'] ?? null;
            if ($typeKey) {
                $expenseCats = Setting::getExpenseCategories();
                foreach ($expenseCats as $cat) {
                    if (isset($cat['id']) && $cat['id'] === $typeKey) {
                        return $cat['label'];
                    }
                }
                return str_replace('_', ' ', ucfirst($typeKey));
            }
            return 'Egreso General (Asociación)';
        }

        $incomeCats = [
            'tributo' => 'Tributo Mensual',
            'fondo_solidario' => 'Fondo Solidario',
            'inscripcion' => 'Inscripción Jugador',
            'inscripcion_campeonato' => 'Inscripción Campeonato',
            'pase' => 'Pase Jugador',
            'apelacion' => 'Apelación',
            'multa' => 'Multa / Sanción',
            'otro_ingreso' => 'Otro Ingreso',
        ];

        return $incomeCats[$this->category ?? ''] ?? ucfirst($this->category ?? '');
    }

    /** Códigos de trámite que son inscripciones de jugadores (1 Adulto, 2 Infantil, 3 Femenina). */
    public const INSCRIPTION_CODES = ['1', '2', '3'];

    /**
     * Separa los comprobantes de "Pase / Trámite" (categoría pase) en pases (códigos 4 a 7)
     * e inscripciones de jugadores (códigos 1 a 3), que se registran como ítems del mismo comprobante.
     *
     * @param  iterable<Transaction>  $transactions
     * @return array{pase: float, pase_arfa: float, pase_afc: float, inscripcion: float, inscripcion_arfa: float, inscripcion_afc: float, pase_count: int, inscripcion_count: int}
     */
    public static function splitTramites(iterable $transactions): array
    {
        $totals = [
            'pase' => 0.0, 'pase_arfa' => 0.0, 'pase_afc' => 0.0,
            'inscripcion' => 0.0, 'inscripcion_arfa' => 0.0, 'inscripcion_afc' => 0.0,
            'pase_count' => 0, 'inscripcion_count' => 0,
        ];

        foreach ($transactions as $tx) {
            $items = $tx->breakdown['items'] ?? null;

            if (is_array($items) && count($items) > 0) {
                foreach ($items as $item) {
                    $key = in_array((string) ($item['code'] ?? ''), self::INSCRIPTION_CODES, true) ? 'inscripcion' : 'pase';
                    $amount = (float) ($item['amount'] ?? 0);
                    $arfa = (float) ($item['arfa_cost'] ?? 0);
                    $totals[$key] += $amount;
                    $totals[$key.'_arfa'] += $arfa;
                    $totals[$key.'_afc'] += $amount - $arfa;
                    $totals[$key.'_count']++;
                }

                continue;
            }

            // Comprobantes antiguos sin detalle por ítem: se consideran pases completos.
            $arfa = (float) ($tx->breakdown['arfa_cost'] ?? 17000);
            $totals['pase'] += (float) $tx->amount;
            $totals['pase_arfa'] += $arfa;
            $totals['pase_afc'] += (float) ($tx->breakdown['afc_margin'] ?? ((float) $tx->amount - $arfa));
            $totals['pase_count']++;
        }

        return $totals;
    }

    public static function generateNextFolio(): string
    {
        $lastId = self::withTrashed()->max('id') ?? 0;
        $nextId = $lastId + 1;
        $folio = 'FOL-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);
        while (self::withTrashed()->where('folio_number', $folio)->exists()) {
            $nextId++;
            $folio = 'FOL-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);
        }
        return $folio;
    }

    public function getReceiptImageUrlAttribute(): ?string
    {
        if ($this->receipt_image) {
            return '/storage/' . $this->receipt_image;
        }
        return null;
    }

    public function getFormattedDateAttribute(): string
    {
        if ($this->date) {
            return Carbon::parse($this->date)->format('d-m-Y');
        }
        return '';
    }

    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
