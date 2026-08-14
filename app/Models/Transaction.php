<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

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
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (empty($transaction->folio_number)) {
                $transaction->folio_number = self::generateNextFolio();
            }
        });
    }

    public static function generateNextFolio(): string
    {
        $lastId = self::max('id') ?? 0;
        $nextId = $lastId + 1;
        return 'FOL-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);
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
}
