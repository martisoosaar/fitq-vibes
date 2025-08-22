<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

// Get all exercises
$exercises = DB::table('exercises')->get();

$updatedCount = 0;
$skippedCount = 0;

foreach ($exercises as $exercise) {
    // Find the earliest workout that used this exercise
    $firstUsage = DB::table('workout_exercises')
        ->join('workout_segments', 'workout_exercises.segment_id', '=', 'workout_segments.id')
        ->join('workouts', 'workout_segments.workout_id', '=', 'workouts.id')
        ->where('workout_exercises.exercise_id', $exercise->id)
        ->orderBy('workouts.date', 'asc')
        ->orderBy('workouts.created_at', 'asc')
        ->select('workouts.date', 'workouts.created_at as workout_created_at')
        ->first();
    
    if ($firstUsage) {
        // Use the workout date as the exercise created_at
        // If date is before 2000, use workout created_at instead (to avoid corrupted dates)
        $workoutDate = $firstUsage->date;
        $workoutCreatedAt = $firstUsage->workout_created_at;
        
        // Check if date is reasonable (after year 2000)
        if ($workoutDate && strtotime($workoutDate) > strtotime('2000-01-01')) {
            $newCreatedAt = $workoutDate;
        } elseif ($workoutCreatedAt && strtotime($workoutCreatedAt) > strtotime('2000-01-01')) {
            $newCreatedAt = $workoutCreatedAt;
        } else {
            // If both dates are unreasonable, skip
            $newCreatedAt = null;
        }
        
        if ($newCreatedAt) {
            DB::table('exercises')
                ->where('id', $exercise->id)
                ->update([
                    'created_at' => $newCreatedAt,
                    'updated_at' => DB::raw('updated_at') // Keep the original updated_at
                ]);
            
            $updatedCount++;
            echo "Updated exercise ID {$exercise->id} ({$exercise->name}) - set created_at to: {$newCreatedAt}\n";
        } else {
            $skippedCount++;
            echo "Skipped exercise ID {$exercise->id} ({$exercise->name}) - no valid date found (date: {$workoutDate}, created: {$workoutCreatedAt})\n";
        }
    } else {
        // Exercise has never been used, keep current created_at
        $skippedCount++;
        echo "Skipped exercise ID {$exercise->id} ({$exercise->name}) - never used in any workout\n";
    }
}

echo "\n=== Summary ===\n";
echo "Updated: {$updatedCount} exercises\n";
echo "Skipped: {$skippedCount} exercises\n";
echo "Total: " . ($updatedCount + $skippedCount) . " exercises\n";