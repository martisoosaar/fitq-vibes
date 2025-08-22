<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'bio',
        'avatar_url',
        'birth_date',
        'gender',
        'height_cm',
        'weight_kg',
        'unit_system',
        'timezone',
        'is_public',
        'trainer_level',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'is_public' => 'boolean',
        'trainer_level' => 'integer',
        'height_cm' => 'integer',
        'weight_kg' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isTrainer(): bool
    {
        return $this->trainer_level > 0;
    }

    public function getAge(): ?int
    {
        return $this->birth_date?->age;
    }
}