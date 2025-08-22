<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Get user 66387 (marti@fitq.studio) from old DB
$oldUser = DB::connection('mysql_old')->table('user')->where('id', 66387)->first();
echo "Old user: {$oldUser->email} (ID: {$oldUser->id})\n";

// Get new user
$newUser = DB::table('users')->where('email', 'marti@fitq.studio')->first();
if (!$newUser) {
    die("New user not found!\n");
}
echo "New user: {$newUser->email} (ID: {$newUser->id})\n";

// Get first 5 workouts
$workouts = DB::connection('mysql_old')->table('workout')
    ->where('user_id', 66387)
    ->limit(5)
    ->get();

echo "Found " . $workouts->count() . " workouts to migrate\n";

// Create simple exercise mapping
$exerciseMap = [];
$exercises = DB::table('exercises')->limit(100)->get();
foreach($exercises as $i => $ex) {
    $exerciseMap[$i+1] = $ex->id;
}

foreach($workouts as $workout) {
    echo "Migrating workout {$workout->id}\n";
    
    // Create workout
    $newWorkoutId = DB::table('workouts')->insertGetId([
        'user_id' => $newUser->id,
        'name' => $workout->notes ?: 'Workout',
        'date' => $workout->date ?: Carbon::now(),
        'notes' => $workout->notes,
        'is_template' => 0,
        'created_at' => $workout->created,
        'updated_at' => $workout->created,
    ]);
    
    echo "  Created workout ID: {$newWorkoutId}\n";
    
    // Create segment
    $segmentId = DB::table('workout_segments')->insertGetId([
        'workout_id' => $newWorkoutId,
        'name' => 'Strength Training',
        'segment_type' => 'strength',
        'segment_order' => 1,
        'created_at' => Carbon::now(),
        'updated_at' => Carbon::now(),
    ]);
    
    echo "  Created segment ID: {$segmentId}\n";
}

// Check results
$count = DB::table('workouts')->where('user_id', $newUser->id)->count();
echo "\nUser now has {$count} workouts\n";