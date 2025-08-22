<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Find Marti's user IDs in new database
$martiEmails = ['marti@fitq.studio', 'marti@firmasport.ee', 'marti.soosaar@gmail.com'];
$newUsers = DB::table('users')->whereIn('email', $martiEmails)->get();

echo "Found " . $newUsers->count() . " Marti accounts in new database:\n";
foreach($newUsers as $user) {
    echo "- {$user->email} (ID: {$user->id})\n";
}

// Map old user IDs
$oldUserIds = [65899, 58241, 66387];
$userIdMap = [];

// Create mapping from old DB
$oldUsers = DB::connection('mysql_old')->table('user')
    ->whereIn('id', $oldUserIds)
    ->get();

foreach($oldUsers as $oldUser) {
    $newUser = $newUsers->where('email', $oldUser->email)->first();
    if ($newUser) {
        $userIdMap[$oldUser->id] = $newUser->id;
        echo "Mapped old user {$oldUser->id} ({$oldUser->email}) to new user {$newUser->id}\n";
    }
}

// Get exercise mapping
$exerciseIdMap = [];
$exercises = DB::connection('mysql_old')->table('exercise')
    ->leftJoin('exercise_translation', function($join) {
        $join->on('exercise.id', '=', 'exercise_translation.exercise_id')
             ->where('exercise_translation.language_id', 1);
    })
    ->select('exercise.id', 'exercise_translation.translation as name')
    ->get();

foreach($exercises as $exercise) {
    $name = $exercise->name ?: 'Exercise ' . $exercise->id;
    $name = substr($name, 0, 255);
    
    $newExercise = DB::table('exercises')
        ->where('name', $name)
        ->first();
    
    if ($newExercise) {
        $exerciseIdMap[$exercise->id] = $newExercise->id;
    }
}

echo "Found " . count($exerciseIdMap) . " exercise mappings\n";

// Migrate strength workouts for these users
$workouts = DB::connection('mysql_old')->table('workout')
    ->whereIn('user_id', $oldUserIds)
    ->where('is_deleted', 0)
    ->get();

echo "\nMigrating " . $workouts->count() . " strength workouts...\n";

$migratedCount = 0;
foreach($workouts as $oldWorkout) {
    if (!isset($userIdMap[$oldWorkout->user_id])) {
        continue;
    }
    
    // Create new workout
    $newWorkoutId = DB::table('workouts')->insertGetId([
        'user_id' => $userIdMap[$oldWorkout->user_id],
        'title' => $oldWorkout->name ?: 'Workout',
        'description' => $oldWorkout->notes,
        'scheduled_at' => $oldWorkout->date_trained ?: $oldWorkout->date_created,
        'started_at' => $oldWorkout->date_trained,
        'completed_at' => $oldWorkout->date_trained,
        'location' => null,
        'is_template' => 0,
        'template_id' => null,
        'visibility' => $oldWorkout->is_private == 1 ? 'private' : 'public',
        'created_at' => $oldWorkout->date_created,
        'updated_at' => $oldWorkout->date_created,
    ]);
    
    // Create strength segment
    $segmentId = DB::table('workout_segments')->insertGetId([
        'workout_id' => $newWorkoutId,
        'name' => 'Strength Training',
        'type' => 'strength',
        'order' => 1,
        'notes' => null,
        'created_at' => $oldWorkout->date_created,
        'updated_at' => $oldWorkout->date_created,
    ]);
    
    // Get workout exercises
    $workoutExercises = DB::connection('mysql_old')->table('workout_exercise')
        ->where('workout_id', $oldWorkout->id)
        ->orderBy('order')
        ->get();
    
    $exerciseCount = 0;
    foreach ($workoutExercises as $oldExercise) {
        // Skip if exercise not mapped
        if (!isset($exerciseIdMap[$oldExercise->exercise_id])) {
            continue;
        }
        
        // Create workout exercise
        $workoutExerciseId = DB::table('workout_exercises')->insertGetId([
            'workout_id' => $newWorkoutId,
            'segment_id' => $segmentId,
            'exercise_id' => $exerciseIdMap[$oldExercise->exercise_id],
            'exercise_order' => $oldExercise->order,
            'notes' => $oldExercise->notes,
            'rest_seconds' => $oldExercise->rest_time,
            'superset_with' => null,
            'created_at' => $oldWorkout->date_created,
            'updated_at' => $oldWorkout->date_created,
        ]);
        
        // Get sets
        $sets = DB::connection('mysql_old')->table('workout_exercise_set')
            ->where('workout_exercise_id', $oldExercise->id)
            ->orderBy('set_number')
            ->get();
        
        foreach ($sets as $oldSet) {
            // Convert weight if imperial
            $weightKg = $oldSet->weight;
            if ($oldWorkout->unit_system == 1 && $weightKg) {
                $weightKg = round($weightKg * 0.453592, 2);
            }
            
            DB::table('exercise_sets')->insert([
                'workout_exercise_id' => $workoutExerciseId,
                'set_number' => $oldSet->set_number,
                'reps' => $oldSet->reps,
                'weight_kg' => $weightKg,
                'distance_km' => null,
                'duration_seconds' => $oldSet->duration,
                'rpe' => null,
                'is_warmup' => 0,
                'is_dropset' => 0,
                'created_at' => $oldWorkout->date_created,
                'updated_at' => $oldWorkout->date_created,
            ]);
        }
        $exerciseCount++;
    }
    
    $migratedCount++;
    echo "Migrated workout {$oldWorkout->id} → {$newWorkoutId} with {$exerciseCount} exercises\n";
}

echo "\nMigrated {$migratedCount} workouts successfully!\n";

// Check final results
foreach($newUsers as $user) {
    $workoutCount = DB::table('workouts')->where('user_id', $user->id)->count();
    echo "{$user->email}: {$workoutCount} workouts\n";
}