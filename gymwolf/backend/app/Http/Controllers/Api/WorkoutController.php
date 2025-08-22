<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workout;
use App\Models\WorkoutSegment;
use App\Models\WorkoutExercise;
use App\Models\ExerciseSet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WorkoutController extends Controller
{
    /**
     * Display a listing of the user's workouts.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = auth()->user()->workouts()
            ->with(['segments' => function ($q) {
                $q->whereHas('exercises'); // Only include segments that have exercises
            }, 'segments.exercises.exercise', 'segments.exercises.sets'])
            ->orderBy('date', 'desc');

        // Filter by date range
        if ($request->has('from')) {
            $query->where('date', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->where('date', '<=', $request->to);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->whereHas('segments', function ($q) use ($request) {
                $q->where('segment_type', $request->type);
            });
        }

        $workouts = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $workouts
        ]);
    }

    /**
     * Store a newly created workout.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date',
            'location' => 'nullable|string|max:255',
            'segments' => 'required|array|min:1',
            'segments.*.name' => 'required|string|max:255',
            'segments.*.type' => 'required|in:strength,cardio,mobility,sports,other',
            'segments.*.exercises' => 'required|array|min:1',
            'segments.*.exercises.*.exercise_id' => 'required|exists:exercises,id',
            'segments.*.exercises.*.order' => 'required|integer|min:1',
            'segments.*.exercises.*.notes' => 'nullable|string',
            'segments.*.exercises.*.sets' => 'required|array|min:1',
            'segments.*.exercises.*.sets.*.reps' => 'nullable|integer|min:0',
            'segments.*.exercises.*.sets.*.weight_kg' => 'nullable|numeric|min:0',
            'segments.*.exercises.*.sets.*.distance_km' => 'nullable|numeric|min:0',
            'segments.*.exercises.*.sets.*.duration_seconds' => 'nullable|integer|min:0',
            'segments.*.exercises.*.sets.*.rpe' => 'nullable|integer|min:1|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create workout
            $workout = auth()->user()->workouts()->create([
                'name' => $request->title,
                'notes' => $request->description,
                'date' => $request->scheduled_at,
                'duration_minutes' => $request->duration_minutes ?? null,
                'bodyweight_kg' => $request->bodyweight_kg ?? null,
                'mood' => $request->mood ?? 'good',
                'energy_level' => $request->energy_level ?? 3,
                'is_template' => false,
            ]);

            // Create segments with exercises
            foreach ($request->segments as $segmentOrder => $segmentData) {
                $segment = $workout->segments()->create([
                    'name' => $segmentData['name'],
                    'segment_type' => $segmentData['type'],
                    'segment_order' => $segmentOrder + 1,
                    'notes' => $segmentData['notes'] ?? null,
                ]);

                // Create exercises for this segment
                foreach ($segmentData['exercises'] as $exerciseData) {
                    $workoutExercise = $segment->exercises()->create([
                        'workout_id' => $workout->id,
                        'exercise_id' => $exerciseData['exercise_id'],
                        'exercise_order' => $exerciseData['order'],
                        'notes' => $exerciseData['notes'] ?? null,
                        'superset_with' => $exerciseData['superset_group'] ?? null,
                    ]);

                    // Create sets for this exercise
                    foreach ($exerciseData['sets'] as $setNumber => $setData) {
                        $workoutExercise->sets()->create([
                            'set_number' => $setNumber + 1,
                            'reps' => $setData['reps'] ?? null,
                            'weight_kg' => $setData['weight_kg'] ?? null,
                            'distance_km' => $setData['distance_km'] ?? null,
                            'duration_seconds' => $setData['duration_seconds'] ?? null,
                            'rpe' => $setData['rpe'] ?? null,
                            'is_warmup' => $setData['is_warmup'] ?? false,
                            'is_dropset' => $setData['is_dropset'] ?? false,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Workout created successfully',
                'data' => $workout->load(['segments.exercises.exercise', 'segments.exercises.sets'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create workout',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified workout.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $workout = auth()->user()->workouts()
            ->with(['segments.exercises.exercise', 'segments.exercises.sets'])
            ->find($id);

        if (!$workout) {
            return response()->json([
                'success' => false,
                'message' => 'Workout not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $workout
        ]);
    }

    /**
     * Update the specified workout.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $workout = auth()->user()->workouts()->find($id);

        if (!$workout) {
            return response()->json([
                'success' => false,
                'message' => 'Workout not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'sometimes|required|date',
            'completed_at' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'visibility' => 'sometimes|in:public,private,friends',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $workout->update($request->only([
            'name', 'notes', 'date', 
            'duration_minutes', 'bodyweight_kg', 'mood', 'energy_level'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Workout updated successfully',
            'data' => $workout->load(['segments.exercises.exercise', 'segments.exercises.sets'])
        ]);
    }

    /**
     * Remove the specified workout.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $workout = auth()->user()->workouts()->find($id);

        if (!$workout) {
            return response()->json([
                'success' => false,
                'message' => 'Workout not found'
            ], 404);
        }

        $workout->delete();

        return response()->json([
            'success' => true,
            'message' => 'Workout deleted successfully'
        ]);
    }
}