<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'instructions',
        'category',
        'primary_muscle_group',
        'secondary_muscle_groups',
        'equipment',
        'difficulty',
        'video_url',
        'image_url',
        'created_by',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'created_by' => 'integer',
        'secondary_muscle_groups' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($exercise) {
            if (empty($exercise->slug)) {
                $exercise->slug = Str::slug($exercise->name);
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }
}