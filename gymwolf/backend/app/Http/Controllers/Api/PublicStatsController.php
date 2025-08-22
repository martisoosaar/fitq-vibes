<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Exercise;
use App\Models\ExerciseSet;
use App\Models\Workout;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class PublicStatsController extends Controller
{
    /**
     * Get public statistics for the platform
     * No authentication required
     */
    public function index()
    {
        // Cache for 1 hour to avoid heavy calculations on every request
        $stats = Cache::remember('public_stats', 3600, function () {
            // Total weight lifted (kg)
            $totalKgLifted = ExerciseSet::sum(DB::raw('weight_kg * reps'));
            
            // Total exercises in database
            $totalExercises = Exercise::count();
            
            // Total users
            $totalUsers = User::count();
            
            // Total workouts completed
            $totalWorkouts = Workout::count();
            
            return [
                'total_kg_lifted' => round($totalKgLifted),
                'total_exercises' => $totalExercises,
                'total_users' => $totalUsers,
                'total_workouts' => $totalWorkouts
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}