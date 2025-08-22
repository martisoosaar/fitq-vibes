<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutSegment extends Model
{
    use HasFactory;

    protected $fillable = [
        'workout_id',
        'segment_type',
        'segment_order',
        'name',
        'duration_minutes',
        'notes',
    ];

    protected $casts = [
        'segment_order' => 'integer',
        'duration_minutes' => 'integer',
    ];

    public function workout(): BelongsTo
    {
        return $this->belongsTo(Workout::class);
    }

    public function exercises(): HasMany
    {
        return $this->hasMany(WorkoutExercise::class, 'segment_id')->orderBy('exercise_order');
    }

    public function isCardio(): bool
    {
        return $this->segment_type === 'cardio';
    }

    public function isStrength(): bool
    {
        return $this->segment_type === 'strength';
    }
}