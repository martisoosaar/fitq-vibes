<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Challenge extends Model
{
    protected $fillable = [
        'title',
        'description',
        'rules',
        'prizes',
        'image_url',
        'video_url',
        'result_type',
        'scoring_type',
        'result_unit',
        'start_date',
        'end_date',
        'is_active',
        'created_by',
    ];
    
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];
    
    /**
     * Get the user who created the challenge.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    /**
     * Get the results for the challenge.
     */
    public function results(): HasMany
    {
        return $this->hasMany(ChallengeResult::class);
    }
    
    /**
     * Get the leaderboard (sorted results).
     */
    public function leaderboard()
    {
        $query = $this->results()
            ->with('user')
            ->whereNotNull('numeric_value');
        
        if ($this->scoring_type === 'higher_better') {
            $query->orderBy('numeric_value', 'desc');
        } else {
            $query->orderBy('numeric_value', 'asc');
        }
        
        return $query;
    }
    
    /**
     * Check if challenge is currently active (within date range).
     */
    public function isCurrentlyActive(): bool
    {
        $now = now();
        return $this->is_active && 
               $now->gte($this->start_date) && 
               $now->lte($this->end_date);
    }
    
    /**
     * Check if challenge has ended.
     */
    public function hasEnded(): bool
    {
        return now()->gt($this->end_date);
    }
    
    /**
     * Check if challenge has started.
     */
    public function hasStarted(): bool
    {
        return now()->gte($this->start_date);
    }
    
    /**
     * Get the current/active challenge.
     */
    public static function current()
    {
        return self::where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();
    }
}