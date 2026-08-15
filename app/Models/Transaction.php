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

        return $incomeCats[$this->category] ?? ucfirst($this->category);
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
