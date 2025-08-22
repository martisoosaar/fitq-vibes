<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workout;
use App\Models\WorkoutExercise;
use App\Models\ExerciseSet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Get overview analytics for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function overview(Request $request)
    {
        $user = auth()->user();
        $period = $request->get('period', '30'); // days

        $startDate = Carbon::now()->subDays($period);

        // Total workouts in period (using date field for actual workout dates)
        $totalWorkouts = $user->workouts()
            ->where('date', '>=', $startDate)
            ->count();

        // Workout frequency (workouts per week)
        $weeksInPeriod = max(1, $period / 7);
        $workoutFrequency = round($totalWorkouts / $weeksInPeriod, 1);

        // Total volume (weight * reps)
        $totalVolume = ExerciseSet::whereHas('workoutExercise.workout', function ($q) use ($user, $startDate) {
            $q->where('user_id', $user->id)
              ->where('date', '>=', $startDate);
        })->sum(DB::raw('weight_kg * reps'));

        // Total duration (from workouts table or calculate from sets)
        $totalDuration = $user->workouts()
            ->where('date', '>=', $startDate)
            ->sum('duration_minutes') ?: 0;
        
        // If no duration in workouts, estimate from sets count
        if ($totalDuration == 0) {
            $totalSets = ExerciseSet::whereHas('workoutExercise.workout', function ($q) use ($user, $startDate) {
                $q->where('user_id', $user->id)
                  ->where('date', '>=', $startDate);
            })->count();
            // Estimate 1.5 minutes per set
            $totalDuration = round($totalSets * 1.5);
        }

        // Most used exercises
        $topExercises = WorkoutExercise::whereHas('workout', function ($q) use ($user, $startDate) {
            $q->where('user_id', $user->id)
              ->where('date', '>=', $startDate);
        })
        ->select('exercise_id', DB::raw('COUNT(*) as count'))
        ->groupBy('exercise_id')
        ->orderBy('count', 'desc')
        ->with('exercise:id,name,category')
        ->limit(5)
        ->get();

        // Workout distribution by type
        $workoutTypes = DB::table('workout_segments')
            ->join('workouts', 'workouts.id', '=', 'workout_segments.workout_id')
            ->where('workouts.user_id', $user->id)
            ->where('workouts.date', '>=', $startDate)
            ->select('workout_segments.segment_type', DB::raw('COUNT(DISTINCT workouts.id) as count'))
            ->groupBy('workout_segments.segment_type')
            ->get();

        // Recent personal records
        $personalRecords = $this->getPersonalRecords($user->id, $startDate);

        // Also get all-time stats
        $allTimeWorkouts = $user->workouts()->count();
        $allTimeVolume = ExerciseSet::whereHas('workoutExercise.workout', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->sum(DB::raw('weight_kg * reps'));
        
        // Get cardio stats - distance and duration
        $cardioStats = ExerciseSet::whereHas('workoutExercise.workout', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->whereHas('workoutExercise.segment', function ($q) {
            $q->where('segment_type', 'cardio');
        })
        ->selectRaw('SUM(distance_km) as total_distance, SUM(duration_seconds) as total_duration')
        ->first();
        
        $totalDistance = $cardioStats->total_distance ?? 0;
        $totalCardioMinutes = ($cardioStats->total_duration ?? 0) / 60;
        
        // Calculate total time (workout duration or estimated from sets)
        if ($totalDuration == 0 && $totalCardioMinutes == 0) {
            // Estimate from strength sets if no other data
            $totalSets = ExerciseSet::whereHas('workoutExercise.workout', function ($q) use ($user, $startDate) {
                $q->where('user_id', $user->id)
                  ->where('date', '>=', $startDate);
            })->count();
            $totalDuration = round($totalSets * 1.5); // 1.5 min per set estimate
        } else {
            $totalDuration = $totalDuration ?: round($totalCardioMinutes);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'period_days' => $period,
                'total_workouts' => $totalWorkouts,
                'all_time_workouts' => $allTimeWorkouts,
                'workout_frequency' => $workoutFrequency,
                'total_volume_kg' => round($totalVolume, 2),
                'all_time_volume_kg' => round($allTimeVolume, 2),
                'total_duration_minutes' => $totalDuration,
                'total_distance_km' => round($totalDistance, 2),
                'total_cardio_minutes' => round($totalCardioMinutes),
                'top_exercises' => $topExercises,
                'workout_types' => $workoutTypes,
                'personal_records' => $personalRecords,
            ]
        ]);
    }

    /**
     * Get progress analytics for specific exercises.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function progress(Request $request)
    {
        $user = auth()->user();
        $exerciseId = $request->get('exercise_id');
        $period = $request->get('period', '90'); // days

        if (!$exerciseId) {
            return response()->json([
                'success' => false,
                'message' => 'Exercise ID is required'
            ], 422);
        }

        $startDate = Carbon::now()->subDays($period);

        // Get all sets for this exercise
        $sets = ExerciseSet::whereHas('workoutExercise', function ($q) use ($exerciseId) {
            $q->where('exercise_id', $exerciseId);
        })
        ->whereHas('workoutExercise.workout', function ($q) use ($user, $startDate) {
            $q->where('user_id', $user->id)
              ->where('date', '>=', $startDate);
        })
        ->with(['workoutExercise.workout:id,scheduled_at,created_at'])
        ->orderBy('created_at')
        ->get();

        // Group by date and calculate metrics
        $progressData = $sets->groupBy(function ($set) {
            return Carbon::parse($set->workoutExercise->workout->scheduled_at ?? $set->created_at)
                ->format('Y-m-d');
        })->map(function ($dateSets) {
            $maxWeight = $dateSets->max('weight_kg');
            $totalVolume = $dateSets->sum(function ($set) {
                return ($set->weight_kg ?? 0) * ($set->reps ?? 0);
            });
            $avgReps = $dateSets->avg('reps');
            $totalSets = $dateSets->count();

            return [
                'date' => $dateSets->first()->workoutExercise->workout->scheduled_at ?? $dateSets->first()->created_at,
                'max_weight_kg' => round($maxWeight, 2),
                'total_volume_kg' => round($totalVolume, 2),
                'avg_reps' => round($avgReps, 1),
                'total_sets' => $totalSets,
            ];
        })->values();

        // Calculate overall progress
        if ($progressData->count() > 1) {
            $firstWorkout = $progressData->first();
            $lastWorkout = $progressData->last();

            $weightProgress = $lastWorkout['max_weight_kg'] - $firstWorkout['max_weight_kg'];
            $volumeProgress = $lastWorkout['total_volume_kg'] - $firstWorkout['total_volume_kg'];

            $progressSummary = [
                'weight_increase_kg' => round($weightProgress, 2),
                'weight_increase_percent' => $firstWorkout['max_weight_kg'] > 0 
                    ? round(($weightProgress / $firstWorkout['max_weight_kg']) * 100, 1) 
                    : 0,
                'volume_increase_kg' => round($volumeProgress, 2),
                'volume_increase_percent' => $firstWorkout['total_volume_kg'] > 0 
                    ? round(($volumeProgress / $firstWorkout['total_volume_kg']) * 100, 1) 
                    : 0,
            ];
        } else {
            $progressSummary = [
                'weight_increase_kg' => 0,
                'weight_increase_percent' => 0,
                'volume_increase_kg' => 0,
                'volume_increase_percent' => 0,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'exercise_id' => $exerciseId,
                'period_days' => $period,
                'progress_data' => $progressData,
                'progress_summary' => $progressSummary,
            ]
        ]);
    }

    /**
     * Get personal records for user.
     *
     * @param int $userId
     * @param Carbon $startDate
     * @return array
     */
    private function getPersonalRecords($userId, $startDate)
    {
        $records = [];

        // Get max weight for each exercise
        $maxWeights = DB::table('exercise_sets')
            ->join('workout_exercises', 'exercise_sets.workout_exercise_id', '=', 'workout_exercises.id')
            ->join('workouts', 'workout_exercises.workout_id', '=', 'workouts.id')
            ->join('exercises', 'workout_exercises.exercise_id', '=', 'exercises.id')
            ->where('workouts.user_id', $userId)
            ->where('workouts.date', '>=', $startDate)
            ->whereNotNull('exercise_sets.weight_kg')
            ->where('exercise_sets.weight_kg', '>', 0)
            ->select(
                'exercises.id',
                'exercises.name',
                DB::raw('MAX(exercise_sets.weight_kg) as max_weight'),
                DB::raw('MAX(exercise_sets.reps) as max_reps_at_weight')
            )
            ->groupBy('exercises.id', 'exercises.name')
            ->orderBy('max_weight', 'desc')
            ->limit(5)
            ->get();

        foreach ($maxWeights as $record) {
            $records[] = [
                'exercise_id' => $record->id,
                'exercise_name' => $record->name,
                'type' => 'max_weight',
                'value' => $record->max_weight,
                'unit' => 'kg',
                'reps' => $record->max_reps_at_weight,
            ];
        }

        return $records;
    }
}