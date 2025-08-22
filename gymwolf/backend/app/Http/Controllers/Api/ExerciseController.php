<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExerciseController extends Controller
{
    /**
     * Display a listing of exercises.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Exercise::query();

        // Include user's custom exercises and public exercises
        $query->where(function ($q) {
            $q->whereNull('created_by')
              ->orWhere('created_by', auth()->id());
        });

        // Search by name with relevance scoring
        if ($request->has('search')) {
            $search = $request->search;
            $searchLower = strtolower($search);
            
            // Add relevance scoring for sorting
            $query->selectRaw('*, 
                CASE 
                    WHEN LOWER(name) = ? THEN 1
                    WHEN LOWER(name) LIKE ? THEN 2
                    WHEN LOWER(name) LIKE ? THEN 3
                    ELSE 4
                END as relevance', 
                [$searchLower, $searchLower . '%', '%' . $searchLower . '%']
            );
            
            $query->where('name', 'like', '%' . $search . '%');
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by muscle group
        if ($request->has('muscle_group')) {
            $query->where('primary_muscle_group', $request->muscle_group);
        }

        // Filter by equipment
        if ($request->has('equipment')) {
            $query->where('equipment', $request->equipment);
        }

        // Order by relevance if searching, otherwise by name
        if ($request->has('search')) {
            $exercises = $query->orderBy('relevance')
                              ->orderByRaw('CASE WHEN created_by IS NULL THEN 0 ELSE 1 END')
                              ->orderBy('name')
                              ->paginate($request->get('per_page', 50));
        } else {
            $exercises = $query->orderBy('name')->paginate($request->get('per_page', 50));
        }

        return response()->json([
            'success' => true,
            'data' => $exercises
        ]);
    }

    /**
     * Store a newly created custom exercise.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category' => 'required|in:strength,cardio,flexibility,sports,other',
            'primary_muscle_group' => 'nullable|string|max:100',
            'secondary_muscle_groups' => 'nullable|json',
            'equipment' => 'nullable|string|max:100',
            'instructions' => 'nullable|string',
            'video_url' => 'nullable|url',
            'image_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $exercise = Exercise::create([
            'name' => $request->name,
            'category' => $request->category,
            'primary_muscle_group' => $request->primary_muscle_group,
            'secondary_muscle_groups' => $request->secondary_muscle_groups,
            'equipment' => $request->equipment,
            'instructions' => $request->instructions,
            'video_url' => $request->video_url,
            'image_url' => $request->image_url,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Exercise created successfully',
            'data' => $exercise
        ], 201);
    }

    /**
     * Display the specified exercise.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        // Allow viewing any exercise (system, own, or community)
        $exercise = Exercise::with('creator')->find($id);

        if (!$exercise) {
            return response()->json([
                'success' => false,
                'message' => 'Exercise not found'
            ], 404);
        }

        // Add a flag to indicate if the user can edit this exercise
        $exercise->can_edit = $exercise->created_by === auth()->id();

        return response()->json([
            'success' => true,
            'data' => $exercise
        ]);
    }

    /**
     * Update the specified custom exercise.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $exercise = Exercise::where('created_by', auth()->id())->find($id);

        if (!$exercise) {
            return response()->json([
                'success' => false,
                'message' => 'Exercise not found or you do not have permission to edit it'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|in:strength,cardio,flexibility,sports,other',
            'primary_muscle_group' => 'nullable|string|max:100',
            'secondary_muscle_groups' => 'nullable|json',
            'equipment' => 'nullable|string|max:100',
            'instructions' => 'nullable|string',
            'video_url' => 'nullable|url',
            'image_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $exercise->update($request->only([
            'name', 'category', 'primary_muscle_group', 'secondary_muscle_groups',
            'equipment', 'instructions', 'video_url', 'image_url'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Exercise updated successfully',
            'data' => $exercise
        ]);
    }

    /**
     * Remove the specified custom exercise.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $exercise = Exercise::where('created_by', auth()->id())->find($id);

        if (!$exercise) {
            return response()->json([
                'success' => false,
                'message' => 'Exercise not found or you do not have permission to delete it'
            ], 404);
        }

        // Check if exercise is used in any workouts
        $usageCount = \App\Models\WorkoutExercise::where('exercise_id', $id)->count();
        
        if ($usageCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete exercise. It's used in {$usageCount} workout(s)"
            ], 409);
        }

        $exercise->delete();

        return response()->json([
            'success' => true,
            'message' => 'Exercise deleted successfully'
        ]);
    }
}