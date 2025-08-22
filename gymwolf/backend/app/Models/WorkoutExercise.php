<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutExercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'workout_id',
        'segment_id',
        'exercise_id',
        'exercise_order',
        'notes',
        'rest_seconds',
        'superset_with',
        'target_sets',
        'target_reps',
        'target_weight_kg',
        'target_duration_seconds',
        'target_distance_km',
    ];

    protected $casts = [
        'exercise_order' => 'integer',
        'rest_seconds' => 'integer',
        'superset_with' => 'integer',
        'target_sets' => 'integer',
        'target_reps' => 'integer',
        'target_weight_kg' => 'float',
        'target_duration_seconds' => 'integer',
        'target_distance_km' => 'float',
    ];

    public function workout(): BelongsTo
    {
        return $this->belongsTo(Workout::class);
    }

    public function segment(): BelongsTo
    {
        return $this->belongsTo(WorkoutSegment::class);
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    public function sets(): HasMany
    {
        return $this->hasMany(ExerciseSet::class)->orderBy('set_number');
    }

    public function supersetPartner(): BelongsTo
    {
        return $this->belongsTo(WorkoutExercise::class, 'superset_with');
    }

    public function isSuperset(): bool
    {
        return !is_null($this->superset_with);
    }

    public function getBestSet()
    {
        return $this->sets()
            ->where('is_warmup', false)
            ->orderByDesc('weight_kg')
            ->orderByDesc('reps')
            ->first();
    }

    public function getTotalVolume(): float
    {
        return $this->sets()
            ->where('is_warmup', false)
            ->get()
            ->sum(function ($set) {
                return ($set->weight_kg ?? 0) * ($set->reps ?? 0);
            });
    }
}