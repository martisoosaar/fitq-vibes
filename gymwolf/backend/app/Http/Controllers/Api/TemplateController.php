<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TemplateController extends Controller
{
    /**
     * Display a listing of workout templates.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = auth()->user()->templates()
            ->with(['segments.workoutExercises.exercise'])
            ->orderBy('title');

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $templates = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    /**
     * Store a newly created template.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'segments' => 'required|array|min:1',
            'segments.*.name' => 'required|string|max:255',
            'segments.*.type' => 'required|in:strength,cardio,mobility,sports,other',
            'segments.*.exercises' => 'required|array|min:1',
            'segments.*.exercises.*.exercise_id' => 'required|exists:exercises,id',
            'segments.*.exercises.*.order' => 'required|integer|min:1',
            'segments.*.exercises.*.notes' => 'nullable|string',
            'segments.*.exercises.*.target_sets' => 'nullable|integer|min:1',
            'segments.*.exercises.*.target_reps' => 'nullable|integer|min:1',
            'segments.*.exercises.*.target_weight_kg' => 'nullable|numeric|min:0',
            'segments.*.exercises.*.target_duration_seconds' => 'nullable|integer|min:0',
            'segments.*.exercises.*.target_distance_km' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create template
            $template = auth()->user()->templates()->create([
                'title' => $request->title,
                'description' => $request->description,
                'scheduled_at' => now(), // Templates don't have real scheduled time
                'is_template' => true,
                'visibility' => 'private',
            ]);

            // Create segments with exercises
            foreach ($request->segments as $segmentOrder => $segmentData) {
                $segment = $template->segments()->create([
                    'name' => $segmentData['name'],
                    'type' => $segmentData['type'],
                    'order' => $segmentOrder + 1,
                    'notes' => $segmentData['notes'] ?? null,
                ]);

                // Create exercises for this segment
                foreach ($segmentData['exercises'] as $exerciseData) {
                    $segment->workoutExercises()->create([
                        'workout_id' => $template->id,
                        'exercise_id' => $exerciseData['exercise_id'],
                        'order' => $exerciseData['order'],
                        'notes' => $exerciseData['notes'] ?? null,
                        'superset_group' => $exerciseData['superset_group'] ?? null,
                        'target_sets' => $exerciseData['target_sets'] ?? null,
                        'target_reps' => $exerciseData['target_reps'] ?? null,
                        'target_weight_kg' => $exerciseData['target_weight_kg'] ?? null,
                        'target_duration_seconds' => $exerciseData['target_duration_seconds'] ?? null,
                        'target_distance_km' => $exerciseData['target_distance_km'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Template created successfully',
                'data' => $template->load(['segments.workoutExercises.exercise'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified template.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $template = auth()->user()->templates()
            ->with(['segments.workoutExercises.exercise'])
            ->find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $template
        ]);
    }

    /**
     * Update the specified template.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $template = auth()->user()->templates()->find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $template->update($request->only(['title', 'description']));

        return response()->json([
            'success' => true,
            'message' => 'Template updated successfully',
            'data' => $template->load(['segments.workoutExercises.exercise'])
        ]);
    }

    /**
     * Remove the specified template.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $template = auth()->user()->templates()->find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template deleted successfully'
        ]);
    }

    /**
     * Create a workout from a template.
     *
     * @param  int  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createWorkout($id, Request $request)
    {
        $template = auth()->user()->templates()
            ->with(['segments.workoutExercises.exercise'])
            ->find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'scheduled_at' => 'required|date',
            'location' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create workout from template
            $workout = auth()->user()->workouts()->create([
                'title' => $template->title,
                'description' => $template->description,
                'scheduled_at' => $request->scheduled_at,
                'location' => $request->location,
                'is_template' => false,
                'visibility' => 'public',
                'template_id' => $template->id,
            ]);

            // Copy segments and exercises
            foreach ($template->segments as $segment) {
                $newSegment = $workout->segments()->create([
                    'name' => $segment->name,
                    'type' => $segment->type,
                    'order' => $segment->order,
                    'notes' => $segment->notes,
                ]);

                foreach ($segment->workoutExercises as $exercise) {
                    $newExercise = $newSegment->workoutExercises()->create([
                        'workout_id' => $workout->id,
                        'exercise_id' => $exercise->exercise_id,
                        'order' => $exercise->order,
                        'notes' => $exercise->notes,
                        'superset_group' => $exercise->superset_group,
                    ]);

                    // Create empty sets based on target
                    $targetSets = $exercise->target_sets ?? 3;
                    for ($i = 1; $i <= $targetSets; $i++) {
                        $newExercise->sets()->create([
                            'set_number' => $i,
                            'reps' => $exercise->target_reps,
                            'weight_kg' => $exercise->target_weight_kg,
                            'duration_seconds' => $exercise->target_duration_seconds,
                            'distance_km' => $exercise->target_distance_km,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Workout created from template',
                'data' => $workout->load(['segments.workoutExercises.exercise', 'segments.workoutExercises.sets'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create workout from template',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}