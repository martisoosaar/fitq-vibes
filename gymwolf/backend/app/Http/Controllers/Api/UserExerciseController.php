<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\WorkoutExercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserExerciseController extends Controller
{
    /**
     * Get exercises that the user has used in their workouts
     */
    public function myExercises(Request $request)
    {
        $user = $request->user();
        
        // Get all exercise IDs that the user has used in their workouts
        $usedExerciseIds = WorkoutExercise::whereHas('workout', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->distinct()->pluck('exercise_id');
        
        // Build query for exercises
        $query = Exercise::whereIn('id', $usedExerciseIds);
        
        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }
        
        if ($request->has('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }
        
        if ($request->has('muscle_group') && $request->input('muscle_group') !== 'all') {
            $query->where('primary_muscle_group', $request->input('muscle_group'));
        }
        
        if ($request->has('equipment') && $request->input('equipment') !== 'all') {
            $query->where('equipment', $request->input('equipment'));
        }
        
        // Add usage count for each exercise
        $exercises = $query->select('exercises.*')
            ->selectSub(function ($query) use ($user) {
                $query->selectRaw('COUNT(*)')
                    ->from('workout_exercises')
                    ->join('workouts', 'workouts.id', '=', 'workout_exercises.workout_id')
                    ->whereColumn('workout_exercises.exercise_id', 'exercises.id')
                    ->where('workouts.user_id', $user->id);
            }, 'usage_count')
            ->orderBy('usage_count', 'desc')
            ->orderBy('name', 'asc')
            ->get();
        
        // Parse secondary muscle groups JSON
        $exercises = $exercises->map(function ($exercise) {
            if ($exercise->secondary_muscle_groups) {
                $exercise->secondary_muscle_groups = json_decode($exercise->secondary_muscle_groups, true);
            }
            return $exercise;
        });
        
        return response()->json([
            'exercises' => $exercises
        ]);
    }
    
    /**
     * Get exercises by muscle group (for all exercises tab)
     */
    public function byMuscleGroup($muscleGroupName)
    {
        $exercises = Exercise::where('primary_muscle_group', $muscleGroupName)
            ->orWhereJsonContains('secondary_muscle_groups', $muscleGroupName)
            ->orderBy('name', 'asc')
            ->get();
        
        // Parse secondary muscle groups JSON
        $exercises = $exercises->map(function ($exercise) {
            if ($exercise->secondary_muscle_groups) {
                $exercise->secondary_muscle_groups = json_decode($exercise->secondary_muscle_groups, true);
            }
            return $exercise;
        });
        
        return response()->json([
            'exercises' => $exercises
        ]);
    }
    
    /**
     * Get verified exercises (system exercises where created_by is null)
     */
    public function verified(Request $request)
    {
        $query = Exercise::whereNull('created_by');
        
        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }
        
        if ($request->has('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }
        
        if ($request->has('muscle_group') && $request->input('muscle_group') !== 'all') {
            $query->where('primary_muscle_group', $request->input('muscle_group'));
        }
        
        if ($request->has('equipment') && $request->input('equipment') !== 'all') {
            $query->where('equipment', $request->input('equipment'));
        }
        
        $exercises = $query->orderBy('name', 'asc')
            ->limit(500) // Limit to prevent too large responses
            ->get();
        
        // Parse secondary muscle groups JSON
        $exercises = $exercises->map(function ($exercise) {
            if ($exercise->secondary_muscle_groups) {
                $exercise->secondary_muscle_groups = json_decode($exercise->secondary_muscle_groups, true);
            }
            return $exercise;
        });
        
        return response()->json([
            'exercises' => $exercises
        ]);
    }
}