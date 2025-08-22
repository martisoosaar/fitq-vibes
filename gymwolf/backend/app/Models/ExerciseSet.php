<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExerciseSet extends Model
{
    use HasFactory;

    protected $fillable = [
        'workout_exercise_id',
        'set_number',
        'reps',
        'weight_kg',
        'distance_km',
        'duration_seconds',
        'rpe',
        'is_warmup',
        'is_dropset',
    ];

    protected $casts = [
        'set_number' => 'integer',
        'reps' => 'integer',
        'weight_kg' => 'float',
        'distance_km' => 'float',
        'duration_seconds' => 'integer',
        'rpe' => 'integer',
        'is_warmup' => 'boolean',
        'is_dropset' => 'boolean',
    ];

    public function workoutExercise(): BelongsTo
    {
        return $this->belongsTo(WorkoutExercise::class);
    }

    public function getVolume(): float
    {
        return ($this->weight_kg ?? 0) * ($this->reps ?? 0);
    }

    public function getIntensity(): ?float
    {
        // Calculate intensity as percentage of 1RM using Epley formula
        if ($this->weight_kg && $this->reps && $this->reps > 1) {
            $oneRM = $this->weight_kg * (1 + 0.0333 * $this->reps);
            return ($this->weight_kg / $oneRM) * 100;
        }
        return null;
    }

    public function getFormattedDuration(): ?string
    {
        if (!$this->duration_seconds) {
            return null;
        }

        $minutes = floor($this->duration_seconds / 60);
        $seconds = $this->duration_seconds % 60;

        if ($minutes > 0) {
            return sprintf('%d:%02d', $minutes, $seconds);
        }
        return sprintf('0:%02d', $seconds);
    }
}