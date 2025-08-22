<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChallengeResult extends Model
{
    protected $fillable = [
        'challenge_id',
        'user_id',
        'result_value',
        'numeric_value',
        'notes',
        'video_proof_url',
        'is_verified',
        'verified_by',
        'verified_at',
    ];
    
    protected $casts = [
        'numeric_value' => 'float',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];
    
    /**
     * Get the challenge this result belongs to.
     */
    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }
    
    /**
     * Get the user who submitted the result.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Get the user who verified the result.
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
    
    /**
     * Convert time string to seconds for numeric storage.
     */
    public static function timeToSeconds($timeString): float
    {
        // Handle formats like "5:30", "1:23:45", "45s", "2m 30s"
        $timeString = trim($timeString);
        
        // If it's already a number, return it
        if (is_numeric($timeString)) {
            return (float) $timeString;
        }
        
        // Handle MM:SS or HH:MM:SS format
        if (strpos($timeString, ':') !== false) {
            $parts = array_reverse(explode(':', $timeString));
            $seconds = 0;
            
            // Seconds
            if (isset($parts[0])) {
                $seconds += (float) $parts[0];
            }
            // Minutes
            if (isset($parts[1])) {
                $seconds += (float) $parts[1] * 60;
            }
            // Hours
            if (isset($parts[2])) {
                $seconds += (float) $parts[2] * 3600;
            }
            
            return $seconds;
        }
        
        // Handle "2m 30s" format
        $seconds = 0;
        if (preg_match('/(\d+)h/i', $timeString, $matches)) {
            $seconds += (float) $matches[1] * 3600;
        }
        if (preg_match('/(\d+)m/i', $timeString, $matches)) {
            $seconds += (float) $matches[1] * 60;
        }
        if (preg_match('/(\d+(?:\.\d+)?)s/i', $timeString, $matches)) {
            $seconds += (float) $matches[1];
        }
        
        return $seconds ?: (float) $timeString;
    }
    
    /**
     * Get rank position in the challenge.
     */
    public function getRank(): ?int
    {
        if (!$this->challenge || !$this->numeric_value) {
            return null;
        }
        
        $query = ChallengeResult::where('challenge_id', $this->challenge_id)
            ->whereNotNull('numeric_value');
        
        if ($this->challenge->scoring_type === 'higher_better') {
            $betterCount = $query->where('numeric_value', '>', $this->numeric_value)->count();
        } else {
            $betterCount = $query->where('numeric_value', '<', $this->numeric_value)->count();
        }
        
        return $betterCount + 1;
    }
}