<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\ExerciseSet;
use App\Models\WorkoutExercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExerciseStatsController extends Controller
{
    /**
     * Get statistics for a specific exercise.
     *
     * @param int $exerciseId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($exerciseId)
    {
        $user = auth()->user();
        
        // Check if exercise exists
        $exercise = Exercise::find($exerciseId);
        if (!$exercise) {
            return response()->json([
                'success' => false,
                'message' => 'Exercise not found'
            ], 404);
        }

        // Get all sets for this exercise by the user
        $allSets = ExerciseSet::whereHas('workoutExercise', function ($q) use ($exerciseId) {
                $q->where('exercise_id', $exerciseId);
            })
            ->whereHas('workoutExercise.workout', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->with(['workoutExercise.workout:id,date,name'])
            ->get();

        if ($allSets->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'exercise_id' => $exerciseId,
                    'exercise_name' => $exercise->name,
                    'total_workouts' => 0,
                    'total_sets' => 0,
                    'total_reps' => 0,
                    'total_volume_kg' => 0,
                    'max_weight_kg' => null,
                    'max_reps' => null,
                    'avg_weight_kg' => null,
                    'avg_reps' => null,
                    'personal_record' => null,
                    'last_workout' => null,
                    'first_workout' => null,
                    'recent_sets' => []
                ]
            ]);
        }

        // Check if this is a cardio exercise
        $isCardio = $exercise->category === 'cardio';
        
        // Calculate statistics
        $totalSets = $allSets->count();
        $totalReps = $allSets->sum('reps');
        $totalVolume = $allSets->sum(function ($set) {
            return ($set->weight_kg ?? 0) * ($set->reps ?? 0);
        });
        
        // Calculate cardio-specific stats
        $totalDistance = $allSets->sum('distance_km');
        $totalDuration = $allSets->sum('duration_seconds');
        $maxDistance = $allSets->max('distance_km');
        $maxDuration = $allSets->max('duration_seconds');
        $avgDistance = $allSets->avg('distance_km');
        $avgDuration = $allSets->avg('duration_seconds');
        
        // Get max values
        $maxWeight = $allSets->max('weight_kg');
        $maxReps = $allSets->max('reps');
        
        // Get averages (excluding warmup sets)
        $workingSets = $allSets->where('is_warmup', false);
        $avgWeight = $workingSets->avg('weight_kg');
        $avgReps = $workingSets->avg('reps');
        
        // Find personal records
        $personalRecords = [];
        
        // 1. Max weight (1 repetition record) - highest weight ever lifted
        if ($maxWeight) {
            $maxWeightSet = $allSets->where('weight_kg', $maxWeight)->first();
            $personalRecords['max_weight'] = [
                'weight_kg' => $maxWeight,
                'reps' => $maxWeightSet->reps,
                'date' => $maxWeightSet->workoutExercise->workout->date,
                'workout_name' => $maxWeightSet->workoutExercise->workout->name
            ];
        }
        
        // 2. Record set - best single set volume (weight × reps)
        $allSetsWithVolume = $allSets->map(function ($set) {
            $set->single_set_volume = ($set->weight_kg ?? 0) * ($set->reps ?? 0);
            return $set;
        });
        $recordSet = $allSetsWithVolume->sortByDesc('single_set_volume')->first();
        if ($recordSet && $recordSet->single_set_volume > 0) {
            $personalRecords['record_set'] = [
                'weight_kg' => $recordSet->weight_kg,
                'reps' => $recordSet->reps,
                'volume' => $recordSet->single_set_volume,
                'date' => $recordSet->workoutExercise->workout->date,
                'workout_name' => $recordSet->workoutExercise->workout->name
            ];
        }
        
        // 3. Record training - best total volume in one workout
        $workoutVolumes = $allSets->groupBy('workoutExercise.workout.id')
            ->map(function ($workoutSets) {
                $totalVolume = $workoutSets->sum(function ($set) {
                    return ($set->weight_kg ?? 0) * ($set->reps ?? 0);
                });
                $totalReps = $workoutSets->sum('reps');
                $totalSets = $workoutSets->count();
                $workout = $workoutSets->first()->workoutExercise->workout;
                
                return [
                    'total_volume' => $totalVolume,
                    'total_reps' => $totalReps,
                    'total_sets' => $totalSets,
                    'date' => $workout->date,
                    'workout_name' => $workout->name
                ];
            })
            ->sortByDesc('total_volume')
            ->first();
            
        if ($workoutVolumes && $workoutVolumes['total_volume'] > 0) {
            $personalRecords['record_training'] = $workoutVolumes;
        }
        
        // Get unique workout count
        $uniqueWorkouts = $allSets->pluck('workoutExercise.workout.id')->unique()->count();
        
        // Get last and first workout dates
        $lastWorkout = $allSets->sortByDesc('workoutExercise.workout.date')->first();
        $firstWorkout = $allSets->sortBy('workoutExercise.workout.date')->first();
        
        // Get recent sets (last 5 workouts)
        $recentWorkoutIds = $allSets->pluck('workoutExercise.workout.id')
            ->unique()
            ->sortDesc()
            ->take(5);
            
        $recentSets = $allSets->whereIn('workoutExercise.workout.id', $recentWorkoutIds)
            ->sortByDesc('workoutExercise.workout.date')
            ->groupBy('workoutExercise.workout.id')
            ->map(function ($workoutSets) use ($isCardio) {
                $workout = $workoutSets->first()->workoutExercise->workout;
                return [
                    'date' => $workout->date,
                    'workout_name' => $workout->name,
                    'sets' => $workoutSets->map(function ($set) {
                        return [
                            'set_number' => $set->set_number,
                            'weight_kg' => $set->weight_kg,
                            'reps' => $set->reps,
                            'distance_km' => $set->distance_km,
                            'duration_seconds' => $set->duration_seconds,
                            'is_warmup' => $set->is_warmup
                        ];
                    })->values(),
                    'total_volume' => $workoutSets->sum(function ($set) {
                        return ($set->weight_kg ?? 0) * ($set->reps ?? 0);
                    }),
                    'total_distance' => $workoutSets->sum('distance_km'),
                    'total_duration' => $workoutSets->sum('duration_seconds')
                ];
            })
            ->values()
            ->take(5);

        // Calculate progress (compare last month to previous month)
        $lastMonth = Carbon::now()->subMonth();
        $twoMonthsAgo = Carbon::now()->subMonths(2);
        
        $lastMonthSets = $allSets->filter(function ($set) use ($lastMonth) {
            return Carbon::parse($set->workoutExercise->workout->date)->gte($lastMonth);
        });
        
        $previousMonthSets = $allSets->filter(function ($set) use ($lastMonth, $twoMonthsAgo) {
            $date = Carbon::parse($set->workoutExercise->workout->date);
            return $date->lt($lastMonth) && $date->gte($twoMonthsAgo);
        });
        
        $progress = null;
        if ($lastMonthSets->count() > 0 && $previousMonthSets->count() > 0) {
            $lastMonthMaxWeight = $lastMonthSets->max('weight_kg');
            $previousMonthMaxWeight = $previousMonthSets->max('weight_kg');
            
            if ($previousMonthMaxWeight > 0) {
                $weightProgress = (($lastMonthMaxWeight - $previousMonthMaxWeight) / $previousMonthMaxWeight) * 100;
                $progress = [
                    'weight_change_percent' => round($weightProgress, 1),
                    'weight_change_kg' => round($lastMonthMaxWeight - $previousMonthMaxWeight, 1)
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'exercise_id' => $exerciseId,
                'exercise_name' => $exercise->name,
                'exercise_category' => $exercise->category,
                'is_cardio' => $isCardio,
                'total_workouts' => $uniqueWorkouts,
                'total_sets' => $totalSets,
                'total_reps' => $totalReps,
                'total_volume_kg' => round($totalVolume, 1),
                'max_weight_kg' => $maxWeight,
                'max_reps' => $maxReps,
                'avg_weight_kg' => round($avgWeight, 1),
                'avg_reps' => round($avgReps, 1),
                // Cardio-specific stats
                'total_distance_km' => round($totalDistance, 2),
                'total_duration_seconds' => $totalDuration,
                'max_distance_km' => $maxDistance ? round($maxDistance, 2) : null,
                'max_duration_seconds' => $maxDuration,
                'avg_distance_km' => $avgDistance ? round($avgDistance, 2) : null,
                'avg_duration_seconds' => $avgDuration ? round($avgDuration) : null,
                'personal_records' => $personalRecords,
                'last_workout' => $lastWorkout ? [
                    'date' => $lastWorkout->workoutExercise->workout->date,
                    'name' => $lastWorkout->workoutExercise->workout->name
                ] : null,
                'first_workout' => $firstWorkout ? [
                    'date' => $firstWorkout->workoutExercise->workout->date,
                    'name' => $firstWorkout->workoutExercise->workout->name
                ] : null,
                'recent_sets' => $recentSets,
                'progress' => $progress
            ]
        ]);
    }
}