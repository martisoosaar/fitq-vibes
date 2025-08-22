<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workout extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'date',
        'duration_minutes',
        'notes',
        'bodyweight_kg',
        'mood',
        'energy_level',
        'gym_id',
        'is_template',
        'template_id',
    ];

    protected $casts = [
        'date' => 'datetime',
        'duration_minutes' => 'integer',
        'bodyweight_kg' => 'float',
        'energy_level' => 'integer',
        'is_template' => 'boolean',
        'gym_id' => 'integer',
        'template_id' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function segments(): HasMany
    {
        return $this->hasMany(WorkoutSegment::class)->orderBy('segment_order');
    }

    public function exercises(): HasMany
    {
        return $this->hasMany(WorkoutExercise::class)->orderBy('exercise_order');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Workout::class, 'template_id');
    }

    public function scopeTemplates($query)
    {
        return $query->where('is_template', true);
    }

    public function scopeWorkouts($query)
    {
        return $query->where('is_template', false);
    }

    public function getTotalVolume(): float
    {
        return $this->exercises()
            ->with('sets')
            ->get()
            ->sum(function ($exercise) {
                return $exercise->sets->sum(function ($set) {
                    return ($set->weight_kg ?? 0) * ($set->reps ?? 0);
                });
            });
    }

    public function getTotalSets(): int
    {
        return $this->exercises()
            ->withCount('sets')
            ->get()
            ->sum('sets_count');
    }
}