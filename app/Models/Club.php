<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Club extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'short_name',
        'crest',
        'founded_at',
        'stadium_name',
        'stadium_address',
        'stadium_image',
        'history',
        'president_name',
        'secretary_name',
        'treasurer_name',
        'categories',
        'gallery',
        'is_active',
    ];

    protected $casts = [
        'categories' => 'array',
        'gallery' => 'array',
        'founded_at' => 'date:Y-m-d',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'crest_url',
        'stadium_image_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($club) {
            if (empty($club->slug)) {
                $club->slug = Str::slug($club->name);
            }
        });

        static::updating(function ($club) {
            if ($club->isDirty('name') && empty($club->slug)) {
                $club->slug = Str::slug($club->name);
            }
        });
    }

    public function getCrestUrlAttribute(): ?string
    {
        if ($this->crest) {
            if (str_starts_with($this->crest, 'http')) {
                return $this->crest;
            }
            return '/storage/' . ltrim($this->crest, '/');
        }
        return null;
    }

    public function getStadiumImageUrlAttribute(): ?string
    {
        if ($this->stadium_image) {
            if (str_starts_with($this->stadium_image, 'http')) {
                return $this->stadium_image;
            }
            return '/storage/' . ltrim($this->stadium_image, '/');
        }
        return null;
    }
}
