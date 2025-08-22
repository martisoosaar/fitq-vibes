<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\ChallengeResult;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    /**
     * Get all active challenges.
     */
    public function active()
    {
        $challenges = Challenge::where('is_active', true)
            ->where('end_date', '>=', now())
            ->where('start_date', '<=', now())
            ->orderBy('end_date', 'asc')
            ->get()
            ->map(function ($challenge) {
                // Get participant count
                $challenge->participant_count = $challenge->results()->count();
                
                // Get top result
                $topResult = $challenge->leaderboard()->first();
                $challenge->top_result = $topResult ? [
                    'user_name' => $topResult->user->name,
                    'result_value' => $topResult->numeric_value,
                    'formatted_result' => $topResult->result_value,
                ] : null;
                
                return $challenge;
            });
        
        return response()->json($challenges);
    }

    /**
     * Get current active challenge.
     */
    public function current()
    {
        $challenge = Challenge::current();
        
        if (!$challenge) {
            return response()->json([
                'message' => 'No active challenge at the moment'
            ], 404);
        }
        
        // Get leaderboard
        $leaderboard = $challenge->leaderboard()
            ->limit(10)
            ->get()
            ->map(function ($result, $index) {
                return [
                    'rank' => $index + 1,
                    'user' => [
                        'id' => $result->user->id,
                        'name' => $result->user->name,
                    ],
                    'result' => $result->result_value,
                    'numeric_value' => $result->numeric_value,
                    'is_verified' => $result->is_verified,
                    'submitted_at' => $result->created_at->diffForHumans(),
                ];
            });
        
        // Get current user's result if authenticated
        $userResult = null;
        if (auth()->check()) {
            $userResult = ChallengeResult::where('challenge_id', $challenge->id)
                ->where('user_id', auth()->id())
                ->first();
        }
        
        // Get stats
        $stats = [
            'total_participants' => $challenge->results()->count(),
            'average_result' => $challenge->results()->avg('numeric_value'),
            'best_result' => $challenge->scoring_type === 'higher_better' 
                ? $challenge->results()->max('numeric_value')
                : $challenge->results()->min('numeric_value'),
        ];
        
        return response()->json([
            'challenge' => $challenge,
            'leaderboard' => $leaderboard,
            'user_result' => $userResult,
            'stats' => $stats,
            'time_remaining' => [
                'days' => now()->diffInDays($challenge->end_date),
                'hours' => now()->diffInHours($challenge->end_date) % 24,
            ],
        ]);
    }
    
    /**
     * Get past challenges.
     */
    public function past(Request $request)
    {
        $challenges = Challenge::where('end_date', '<', now())
            ->orderBy('end_date', 'desc')
            ->paginate(12);
        
        // Add winner info to each challenge
        $challenges->getCollection()->transform(function ($challenge) {
            $winner = $challenge->leaderboard()->first();
            $challenge->winner = $winner ? [
                'user' => $winner->user->name,
                'result' => $winner->result_value,
            ] : null;
            $challenge->total_participants = $challenge->results()->count();
            return $challenge;
        });
        
        return response()->json($challenges);
    }
    
    /**
     * Get specific challenge details.
     */
    public function show($id)
    {
        $challenge = Challenge::findOrFail($id);
        
        // Get full leaderboard
        $leaderboard = $challenge->leaderboard()
            ->get()
            ->map(function ($result, $index) {
                return [
                    'rank' => $index + 1,
                    'user' => [
                        'id' => $result->user->id,
                        'name' => $result->user->name,
                    ],
                    'result' => $result->result_value,
                    'numeric_value' => $result->numeric_value,
                    'is_verified' => $result->is_verified,
                    'submitted_at' => $result->created_at->diffForHumans(),
                    'created_at' => $result->created_at->toISOString(),
                    'video_proof_url' => $result->video_proof_url,
                    'notes' => $result->notes,
                ];
            });
        
        return response()->json([
            'challenge' => $challenge,
            'leaderboard' => $leaderboard,
            'total_participants' => $challenge->results()->count(),
        ]);
    }
    
    /**
     * Submit a result for a challenge.
     */
    public function submitResult(Request $request, $challengeId)
    {
        $challenge = Challenge::findOrFail($challengeId);
        
        // Check if challenge is active and within date range
        if (!$challenge->isCurrentlyActive()) {
            return response()->json([
                'message' => 'This challenge is not currently accepting submissions'
            ], 403);
        }
        
        $request->validate([
            'result_value' => 'required|string',
            'notes' => 'nullable|string',
            'video_proof_url' => 'nullable|url',
        ]);
        
        // Calculate numeric value for sorting
        $numericValue = $challenge->result_type === 'time' 
            ? ChallengeResult::timeToSeconds($request->result_value)
            : (float) preg_replace('/[^0-9.]/', '', $request->result_value);
        
        // Create or update user's result
        $result = ChallengeResult::updateOrCreate(
            [
                'challenge_id' => $challenge->id,
                'user_id' => auth()->id(),
            ],
            [
                'result_value' => $request->result_value,
                'numeric_value' => $numericValue,
                'notes' => $request->notes,
                'video_proof_url' => $request->video_proof_url,
            ]
        );
        
        // Get user's rank
        $rank = $result->getRank();
        
        return response()->json([
            'success' => true,
            'message' => 'Result submitted successfully',
            'result' => $result,
            'rank' => $rank,
        ]);
    }
}