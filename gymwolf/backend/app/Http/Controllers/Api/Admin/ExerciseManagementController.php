<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\MuscleGroup;
use App\Models\Equipment;
use App\Models\WorkoutExercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExerciseManagementController extends Controller
{
    /**
     * Display a listing of all exercises.
     */
    public function index(Request $request)
    {
        $query = Exercise::with('creator');

        // Search by exercise name, category, muscle group, creator name or email
        if ($request->has('search')) {
            $search = $request->search;
            $searchLower = strtolower($search);
            
            // Add relevance scoring for sorting
            $query->selectRaw('exercises.*, 
                CASE 
                    WHEN LOWER(exercises.name) = ? THEN 1
                    WHEN LOWER(exercises.name) LIKE ? THEN 2
                    WHEN LOWER(exercises.name) LIKE ? THEN 3
                    ELSE 4
                END as relevance', 
                [$searchLower, $searchLower . '%', '%' . $searchLower . '%']
            );
            
            $query->where(function($q) use ($search) {
                $q->where('exercises.name', 'like', '%' . $search . '%')
                  ->orWhere('exercises.category', 'like', '%' . $search . '%')
                  ->orWhere('exercises.primary_muscle_group', 'like', '%' . $search . '%')
                  ->orWhereHas('creator', function($q) use ($search) {
                      $q->where('name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
                  });
            });
        }

        // Filter by verified/custom
        if ($request->has('type')) {
            if ($request->type === 'verified') {
                $query->whereNull('created_by');
            } elseif ($request->type === 'custom') {
                $query->whereNotNull('created_by');
            }
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        // Filter by media (image/video)
        if ($request->has('media')) {
            if ($request->media === 'with_image') {
                $query->whereNotNull('image_url');
            } elseif ($request->media === 'without_image') {
                $query->whereNull('image_url');
            } elseif ($request->media === 'with_video') {
                $query->whereNotNull('video_url');
            } elseif ($request->media === 'without_video') {
                $query->whereNull('video_url');
            } elseif ($request->media === 'with_any') {
                $query->where(function($q) {
                    $q->whereNotNull('image_url')
                      ->orWhereNotNull('video_url');
                });
            } elseif ($request->media === 'without_any') {
                $query->whereNull('image_url')
                      ->whereNull('video_url');
            }
        }

        // Sort by relevance if searching, otherwise by system exercises first
        if ($request->has('search')) {
            $exercises = $query->orderBy('relevance')
                              ->orderByRaw('CASE WHEN created_by IS NULL THEN 0 ELSE 1 END')
                              ->orderBy('name')
                              ->paginate($request->get('per_page', 50));
        } else {
            $exercises = $query->orderByRaw('CASE WHEN created_by IS NULL THEN 0 ELSE 1 END')
                              ->orderBy('name')
                              ->paginate($request->get('per_page', 50));
        }

        return response()->json([
            'success' => true,
            'data' => $exercises
        ]);
    }

    /**
     * Display the specified exercise.
     */
    public function show($id)
    {
        $exercise = Exercise::with('creator')->findOrFail($id);

        // Get usage statistics
        $stats = [
            'total_uses' => WorkoutExercise::where('exercise_id', $id)->count(),
            'unique_users' => WorkoutExercise::where('exercise_id', $id)
                ->join('workout_segments', 'workout_exercises.segment_id', '=', 'workout_segments.id')
                ->join('workouts', 'workout_segments.workout_id', '=', 'workouts.id')
                ->distinct('workouts.user_id')
                ->count('workouts.user_id'),
            'last_used' => WorkoutExercise::where('exercise_id', $id)
                ->join('workout_segments', 'workout_exercises.segment_id', '=', 'workout_segments.id')
                ->join('workouts', 'workout_segments.workout_id', '=', 'workouts.id')
                ->latest('workouts.date')
                ->first()?->date,
        ];

        // Get recent workouts that use this exercise
        $recentWorkouts = WorkoutExercise::where('exercise_id', $id)
            ->join('workout_segments', 'workout_exercises.segment_id', '=', 'workout_segments.id')
            ->join('workouts', 'workout_segments.workout_id', '=', 'workouts.id')
            ->join('users', 'workouts.user_id', '=', 'users.id')
            ->select('workouts.id', 'workouts.name', 'workouts.date', 'users.id as user_id', 'users.name as user_name')
            ->orderBy('workouts.date', 'desc')
            ->limit(5)
            ->get()
            ->map(function($workout) {
                return [
                    'id' => $workout->id,
                    'name' => $workout->name,
                    'date' => $workout->date,
                    'user' => [
                        'id' => $workout->user_id,
                        'name' => $workout->user_name
                    ]
                ];
            });
        
        // Get users who have used this exercise
        $recentUsers = WorkoutExercise::where('exercise_id', $id)
            ->join('workout_segments', 'workout_exercises.segment_id', '=', 'workout_segments.id')
            ->join('workouts', 'workout_segments.workout_id', '=', 'workouts.id')
            ->join('users', 'workouts.user_id', '=', 'users.id')
            ->select('users.id', 'users.name', 'users.email')
            ->selectRaw('COUNT(DISTINCT workouts.id) as workout_count')
            ->selectRaw('MAX(workouts.date) as last_used')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('workout_count')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'exercise' => $exercise,
                'stats' => $stats,
                'recent_workouts' => $recentWorkouts,
                'recent_users' => $recentUsers
            ]
        ]);
    }

    /**
     * Verify an exercise (make it public/verified).
     */
    public function verify($id)
    {
        $exercise = Exercise::findOrFail($id);
        $exercise->created_by = null;
        $exercise->save();

        return response()->json([
            'success' => true,
            'message' => 'Exercise verified successfully',
            'data' => $exercise
        ]);
    }
    
    /**
     * Assign an exercise to a specific user as custom.
     */
    public function assignToUser($id, Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);
        
        $exercise = Exercise::findOrFail($id);
        $exercise->created_by = $request->user_id;
        $exercise->save();

        return response()->json([
            'success' => true,
            'message' => 'Exercise assigned to user successfully',
            'data' => $exercise->load('creator')
        ]);
    }

    /**
     * Update an exercise.
     */
    public function update(Request $request, $id)
    {
        $exercise = Exercise::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|nullable|string|max:255',
            'primary_muscle_group' => 'sometimes|nullable|string|max:255',
            'secondary_muscle_groups' => 'sometimes|nullable|array',
            'secondary_muscle_groups.*' => 'string|max:255',
            'equipment' => 'sometimes|nullable|string|max:255',
            'description' => 'sometimes|nullable|string',
            'instructions' => 'sometimes|nullable|string',
            'image_url' => 'sometimes|nullable|string',
            'video_url' => 'sometimes|nullable|string|url',
        ]);
        
        $exercise->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Exercise updated successfully',
            'data' => $exercise->load('creator')
        ]);
    }
    
    /**
     * Upload images for an exercise.
     */
    public function uploadImages(Request $request, $id)
    {
        $exercise = Exercise::findOrFail($id);
        
        $request->validate([
            'images' => 'required|array|max:4',
            'images.*' => 'required|image|mimes:jpeg,jpg,png,gif|max:5120', // Max 5MB per image
        ]);
        
        $uploadedImages = [];
        
        // Create exercise images directory if it doesn't exist
        $exerciseImagesPath = public_path('images/exercises');
        if (!file_exists($exerciseImagesPath)) {
            mkdir($exerciseImagesPath, 0755, true);
        }
        
        // Get existing images if any
        $existingImages = [];
        if ($exercise->image_url) {
            try {
                $existingImages = json_decode($exercise->image_url, true) ?: [];
            } catch (\Exception $e) {
                $existingImages = [];
            }
        }
        
        // Upload new images
        foreach ($request->file('images') as $index => $image) {
            $position = count($existingImages) + $index;
            if ($position >= 4) break; // Max 4 images
            
            // Generate filename
            $filename = $exercise->id . '_' . $position . '.jpg';
            $thumbFilename = $exercise->id . '_' . $position . '_thumb.jpg';
            
            // Save the main image
            $image->move($exerciseImagesPath, $filename);
            
            // Create thumbnail (simple copy for now, could be resized)
            copy($exerciseImagesPath . '/' . $filename, $exerciseImagesPath . '/' . $thumbFilename);
            
            $uploadedImages[] = '/images/exercises/' . $filename;
        }
        
        // Merge with existing images
        $allImages = array_merge($existingImages, $uploadedImages);
        
        // Update exercise with new image URLs
        $exercise->image_url = json_encode(array_slice($allImages, 0, 4)); // Max 4 images
        $exercise->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Images uploaded successfully',
            'data' => $exercise->load('creator')
        ]);
    }
    
    /**
     * Delete an image from an exercise.
     */
    public function deleteImage(Request $request, $id)
    {
        $exercise = Exercise::findOrFail($id);
        
        $request->validate([
            'position' => 'required|integer|min:0|max:3',
        ]);
        
        $position = $request->position;
        
        // Get existing images
        $existingImages = [];
        if ($exercise->image_url) {
            try {
                $existingImages = json_decode($exercise->image_url, true) ?: [];
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid image data'
                ], 400);
            }
        }
        
        // Remove the image at the specified position
        if (isset($existingImages[$position])) {
            // Delete the physical files
            $imagePath = str_replace('/images/exercises/', '', $existingImages[$position]);
            $fullPath = public_path('images/exercises/' . $imagePath);
            $thumbPath = str_replace('.jpg', '_thumb.jpg', $fullPath);
            
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
            if (file_exists($thumbPath)) {
                unlink($thumbPath);
            }
            
            // Remove from array and reindex
            array_splice($existingImages, $position, 1);
            
            // Rename remaining files to maintain sequence
            $reorderedImages = [];
            foreach ($existingImages as $index => $imageUrl) {
                $oldFilename = basename($imageUrl);
                preg_match('/^(\d+)_(\d+)\.jpg$/', $oldFilename, $matches);
                if ($matches) {
                    $exerciseId = $matches[1];
                    $newFilename = $exerciseId . '_' . $index . '.jpg';
                    $newThumbFilename = $exerciseId . '_' . $index . '_thumb.jpg';
                    
                    $oldPath = public_path('images/exercises/' . $oldFilename);
                    $newPath = public_path('images/exercises/' . $newFilename);
                    $oldThumbPath = str_replace('.jpg', '_thumb.jpg', $oldPath);
                    $newThumbPath = public_path('images/exercises/' . $newThumbFilename);
                    
                    if ($oldFilename !== $newFilename && file_exists($oldPath)) {
                        rename($oldPath, $newPath);
                        if (file_exists($oldThumbPath)) {
                            rename($oldThumbPath, $newThumbPath);
                        }
                    }
                    
                    $reorderedImages[] = '/images/exercises/' . $newFilename;
                } else {
                    $reorderedImages[] = $imageUrl;
                }
            }
            
            // Update exercise
            $exercise->image_url = count($reorderedImages) > 0 ? json_encode($reorderedImages) : null;
            $exercise->save();
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully',
            'data' => $exercise->load('creator')
        ]);
    }
    
    /**
     * Delete an exercise.
     */
    public function destroy($id)
    {
        $exercise = Exercise::findOrFail($id);
        
        // Check if exercise is in use
        $inUse = WorkoutExercise::where('exercise_id', $id)->exists();
        
        if ($inUse) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete exercise that is in use'
            ], 400);
        }

        $exercise->delete();

        return response()->json([
            'success' => true,
            'message' => 'Exercise deleted successfully'
        ]);
    }
    
    /**
     * Get all muscle groups.
     */
    public function getMuscleGroups()
    {
        // Get unique muscle groups from exercises with their counts
        $muscleGroups = Exercise::select('primary_muscle_group as name')
            ->selectRaw('COUNT(*) as exercise_count')
            ->whereNotNull('primary_muscle_group')
            ->groupBy('primary_muscle_group')
            ->orderByDesc('exercise_count')
            ->get();
            
        $formattedGroups = [];
        foreach ($muscleGroups as $index => $group) {
            $formattedGroups[] = [
                'id' => $index + 1,
                'name' => $group->name,
                'category' => $this->getCategoryForMuscleGroup($group->name),
                'exercise_count' => $group->exercise_count
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => $formattedGroups
        ]);
    }
    
    /**
     * Get category for muscle group
     */
    private function getCategoryForMuscleGroup($muscleGroup)
    {
        $categories = [
            'Chest' => 'Upper Body',
            'Back' => 'Upper Body',
            'Shoulders' => 'Upper Body',
            'Biceps' => 'Arms',
            'Triceps' => 'Arms',
            'Forearms' => 'Arms',
            'Abs' => 'Core',
            'Quads' => 'Legs',
            'Hamstrings' => 'Legs',
            'Glutes' => 'Legs',
            'Calves' => 'Legs',
            'Cardio' => 'Cardio',
            'Full Body' => 'Full Body'
        ];
        
        return $categories[$muscleGroup] ?? 'Other';
    }
    
    /**
     * Get all equipment.
     */
    public function getEquipment()
    {
        $equipment = Equipment::where('is_active', true)
                             ->orderBy('sort_order')
                             ->get();
        
        return response()->json([
            'success' => true,
            'data' => $equipment
        ]);
    }
    
    /**
     * Create new equipment.
     */
    public function createEquipment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:equipment,name',
            'category' => 'nullable|string|in:bodyweight,free_weight,machine,cardio,other',
        ]);
        
        // Get the max sort_order and add 1
        $maxSortOrder = Equipment::max('sort_order') ?? 0;
        
        $equipment = Equipment::create([
            'name' => $validated['name'],
            'category' => $validated['category'] ?? 'other',
            'sort_order' => $maxSortOrder + 1,
            'is_active' => true,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Equipment created successfully',
            'data' => $equipment
        ]);
    }
}