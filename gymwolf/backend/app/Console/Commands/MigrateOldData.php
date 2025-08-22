<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class MigrateOldData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'gymwolf:migrate {--fresh : Drop all tables and start fresh} {--users-only : Migrate only users} {--limit=0 : Limit number of records} {--continue : Continue from where left off}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate data from old Gymwolf database to new structure';

    private $userIdMap = [];
    private $exerciseIdMap = [];
    private $workoutIdMap = [];
    private $limit = 0;

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->limit = $this->option('limit');
        
        if ($this->option('fresh')) {
            if (!$this->confirm('This will DELETE all existing data in gymwolf2. Are you sure?')) {
                return;
            }
            $this->call('migrate:fresh');
        }
        
        $this->info('Starting migration from old Gymwolf database...');
        $startTime = microtime(true);
        
        try {
            // Run without transaction to see progress
            $this->migrateUsers();
            
            if (!$this->option('users-only')) {
                $this->migrateExercises();
                $this->migrateWorkouts();
                $this->migrateCardioWorkouts();
            }
            
            $duration = round(microtime(true) - $startTime, 2);
            $this->info("Migration completed successfully in {$duration} seconds!");
            $this->printStats();
            
        } catch (\Exception $e) {
            $this->error('Migration failed: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }
        
        return 0;
    }
    
    /**
     * Migrate users and profiles
     */
    private function migrateUsers()
    {
        $this->info('Migrating users...');
        
        // Load existing user mapping
        $this->loadExistingUserMapping();
        
        $bar = $this->output->createProgressBar();
        
        $query = DB::connection('mysql_old')->table('user')
            ->where('is_deleted', 0)
            ->orderBy('id');
            
        if ($this->limit > 0) {
            $query->limit($this->limit);
        }
        
        $users = $query->get();
        $bar->start($users->count());
        
        foreach ($users as $oldUser) {
            // Skip if no email
            if (!$oldUser->email) {
                $bar->advance();
                continue;
            }
            
            // Skip if email already exists
            if (DB::table('users')->where('email', $oldUser->email)->exists()) {
                $existingUser = DB::table('users')->where('email', $oldUser->email)->first();
                $this->userIdMap[$oldUser->id] = $existingUser->id;
                $bar->advance();
                continue;
            }
            
            // Fix date if invalid
            $createdAt = ($oldUser->created && $oldUser->created != '0000-00-00 00:00:00') 
                ? $oldUser->created 
                : Carbon::now()->subYears(5); // Default to 5 years ago
            
            // Create new user with bcrypt password
            $newUserId = DB::table('users')->insertGetId([
                'name' => $oldUser->name ?: 'User ' . $oldUser->id,
                'email' => $oldUser->email,
                'password' => $oldUser->password ?: Hash::make('gymwolf123'), // Default password
                'email_verified_at' => null, // No verified field in old DB
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
            
            // Map old ID to new ID
            $this->userIdMap[$oldUser->id] = $newUserId;
            
            // Create user profile with default values
            DB::table('user_profiles')->insert([
                'user_id' => $newUserId,
                'name' => $oldUser->name,
                'bio' => '',
                'avatar_url' => null,
                'birth_date' => null,
                'gender' => null,
                'height_cm' => null,
                'weight_kg' => null,
                'unit_system' => 'metric',
                'timezone' => 'UTC',
                'is_public' => true,
                'trainer_level' => $oldUser->trainer_id ? 1 : 0,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info('Migrated ' . count($this->userIdMap) . ' users');
    }
    
    /**
     * Migrate exercises database
     */
    private function migrateExercises()
    {
        $this->info('Migrating exercises...');
        
        // Load existing exercise mappings
        $this->loadExistingExerciseMapping();
        
        // Get English translations
        $exercises = DB::connection('mysql_old')->table('exercise')
            ->leftJoin('exercise_translation', function($join) {
                $join->on('exercise.id', '=', 'exercise_translation.exercise_id')
                     ->where('exercise_translation.language_id', 1);
            })
            ->select(
                'exercise.*', 
                'exercise_translation.translation as name', 
                'exercise_translation.description'
            )
            ->get();
        
        $bar = $this->output->createProgressBar($exercises->count());
        $bar->start();
        
        foreach ($exercises as $oldExercise) {
            $name = $oldExercise->name ?: 'Exercise ' . $oldExercise->id;
            
            // Check if already exists
            $exists = DB::table('exercises')
                ->where('name', $name)
                ->first();
            
            if ($exists) {
                $this->exerciseIdMap[$oldExercise->id] = $exists->id;
                $bar->advance();
                continue;
            }
            
            // Truncate name if too long
            $name = substr($name, 0, 255);
            
            $newExerciseId = DB::table('exercises')->insertGetId([
                'name' => $name,
                'category' => 'strength',
                'primary_muscle_group' => $this->mapMuscleGroup($oldExercise->muscle_group_id ?? null),
                'secondary_muscle_groups' => null,
                'equipment' => $this->mapEquipment($oldExercise->equipment_id ?? null),
                'instructions' => $oldExercise->description,
                'video_url' => $oldExercise->video_url ?? null,
                'image_url' => null,
                'created_by' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            
            $this->exerciseIdMap[$oldExercise->id] = $newExerciseId;
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        
        // Migrate cardio exercises
        $this->info('Migrating cardio exercises...');
        
        $cardioExercises = DB::connection('mysql_old')->table('cardio_exercise')
            ->leftJoin('cardio_exercise_translation', function($join) {
                $join->on('cardio_exercise.id', '=', 'cardio_exercise_translation.cardio_exercise_id')
                     ->where('cardio_exercise_translation.language_id', 1);
            })
            ->select(
                'cardio_exercise.*', 
                'cardio_exercise_translation.translation as name'
            )
            ->get();
        
        foreach ($cardioExercises as $cardio) {
            $name = $cardio->name ?: 'Cardio ' . $cardio->id;
            $name = substr($name, 0, 255); // Truncate if too long
            
            $exists = DB::table('exercises')
                ->where('name', $name)
                ->first();
            
            if ($exists) {
                $this->exerciseIdMap['cardio_' . $cardio->id] = $exists->id;
                continue;
            }
            
            $newExerciseId = DB::table('exercises')->insertGetId([
                'name' => $name,
                'category' => 'cardio',
                'primary_muscle_group' => null,
                'secondary_muscle_groups' => null,
                'equipment' => null,
                'instructions' => null,
                'video_url' => null,
                'image_url' => null,
                'created_by' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            
            $this->exerciseIdMap['cardio_' . $cardio->id] = $newExerciseId;
        }
        
        $this->info('Migrated ' . count($this->exerciseIdMap) . ' exercises');
    }
    
    /**
     * Migrate strength workouts
     */
    private function migrateWorkouts()
    {
        $this->info('Migrating strength workouts...');
        
        // Load existing workout mappings
        $this->loadExistingWorkoutMapping();
        
        $query = DB::connection('mysql_old')->table('workout')
            ->orderBy('id');
            
        // If continuing, skip already migrated workouts
        if ($this->option('continue')) {
            $migratedIds = array_keys($this->workoutIdMap);
            if (!empty($migratedIds)) {
                $maxId = max($migratedIds);
                $query->where('id', '>', $maxId);
                $this->info("Continuing from workout ID: {$maxId} (skipping " . count($migratedIds) . " already migrated workouts)");
            }
        }
            
        if ($this->limit > 0) {
            $query->limit($this->limit * 10); // More workouts than users
        }
        
        $totalWorkouts = $query->count();
        $bar = $this->output->createProgressBar($totalWorkouts);
        $bar->start();
        
        $query->chunk(100, function ($workouts) use ($bar) {
            foreach ($workouts as $oldWorkout) {
                // Skip if already migrated
                if (isset($this->workoutIdMap[$oldWorkout->id])) {
                    $bar->advance();
                    continue;
                }
                
                // Skip if user not migrated
                if (!isset($this->userIdMap[$oldWorkout->user_id])) {
                    $bar->advance();
                    continue;
                }
                
                // Create new workout (skip problematic notes to avoid encoding issues)
                $safeNotes = null; // Skip notes for now to avoid encoding issues
                $workoutName = 'Treening ' . $oldWorkout->id;
                
                // Fix invalid dates
                $workoutDate = $oldWorkout->date;
                if (!$workoutDate || $workoutDate == '0000-00-00' || $workoutDate == '0000-00-00 00:00:00') {
                    $workoutDate = $oldWorkout->created ?: Carbon::now()->subYears(5)->format('Y-m-d');
                }
                
                $newWorkoutId = DB::table('workouts')->insertGetId([
                    'user_id' => $this->userIdMap[$oldWorkout->user_id],
                    'name' => $workoutName,
                    'date' => $workoutDate,
                    'notes' => $safeNotes,
                    'is_template' => 0, // Regular workouts, not templates
                    'template_id' => null,
                    'created_at' => $oldWorkout->created,
                    'updated_at' => $oldWorkout->created,
                ]);
                
                $this->workoutIdMap[$oldWorkout->id] = $newWorkoutId;
                
                // Create strength segment
                $segmentId = DB::table('workout_segments')->insertGetId([
                    'workout_id' => $newWorkoutId,
                    'name' => 'Strength Training',
                    'segment_type' => 'strength',
                    'segment_order' => 1,
                    'notes' => null,
                    'created_at' => $oldWorkout->created,
                    'updated_at' => $oldWorkout->created,
                ]);
                
                // Get workout exercises (ordered by ID since there's no order column)
                $workoutExercises = DB::connection('mysql_old')->table('workout_exercise')
                    ->where('workout_id', $oldWorkout->id)
                    ->orderBy('id')
                    ->get();
                
                $exerciseOrder = 1;
                foreach ($workoutExercises as $oldExercise) {
                    // Skip if exercise not migrated
                    if (!isset($this->exerciseIdMap[$oldExercise->exercise_id])) {
                        continue;
                    }
                    
                    // Create workout exercise
                    $workoutExerciseId = DB::table('workout_exercises')->insertGetId([
                        'workout_id' => $newWorkoutId,
                        'segment_id' => $segmentId,
                        'exercise_id' => $this->exerciseIdMap[$oldExercise->exercise_id],
                        'exercise_order' => $exerciseOrder++, // Increment order for each exercise
                        'notes' => null, // Skip comments to avoid encoding issues
                        'rest_seconds' => null, // Old DB doesn't have rest_time
                        'superset_with' => null,
                        'created_at' => $oldWorkout->created,
                        'updated_at' => $oldWorkout->created,
                    ]);
                    
                    // Get sets from 'set' table (not workout_exercise_set)
                    $sets = DB::connection('mysql_old')->table('set')
                        ->where('workout_exercise_id', $oldExercise->id)
                        ->orderBy('id') // Order by ID since no set_number column
                        ->get();
                    
                    $setNumber = 1;
                    foreach ($sets as $oldSet) {
                        // Validate and limit reps to reasonable values
                        $reps = $oldSet->reps;
                        if ($reps === null || $reps > 999) {
                            $reps = null; // Skip invalid rep counts
                        }
                        
                        // Validate weight
                        $weight = $this->convertWeight($oldSet->weight, $oldSet->unit ?? 'kg');
                        if ($weight > 9999) {
                            $weight = null; // Skip invalid weights
                        }
                        
                        try {
                            DB::table('exercise_sets')->insert([
                                'workout_exercise_id' => $workoutExerciseId,
                                'set_number' => $setNumber++,
                                'reps' => $reps,
                                'weight_kg' => $weight,
                                'distance_km' => null,
                                'duration_seconds' => null, // Old DB doesn't have duration for sets
                                'rpe' => null,
                                'is_warmup' => 0,
                                'is_dropset' => 0,
                                'created_at' => $oldWorkout->created,
                                'updated_at' => $oldWorkout->created,
                            ]);
                        } catch (\Exception $e) {
                            // Skip problematic sets but continue
                            $this->warn("Skipped set for workout {$oldWorkout->id}: " . $e->getMessage());
                        }
                    }
                }
                
                $bar->advance();
            }
        });
        
        $bar->finish();
        $this->newLine();
        $this->info('Migrated ' . count($this->workoutIdMap) . ' strength workouts');
    }
    
    /**
     * Migrate cardio workouts
     */
    private function migrateCardioWorkouts()
    {
        $this->info('Migrating cardio workouts...');
        $count = 0;
        
        $query = DB::connection('mysql_old')->table('cardio_workout')
            ->orderBy('id');
            
        if ($this->limit > 0) {
            $query->limit($this->limit * 5);
        }
        
        $cardioWorkouts = $query->get();
        $bar = $this->output->createProgressBar($cardioWorkouts->count());
        $bar->start();
        
        foreach ($cardioWorkouts as $oldWorkout) {
            // Skip if user not migrated
            if (!isset($this->userIdMap[$oldWorkout->user_id])) {
                $bar->advance();
                continue;
            }
            
            // Create new workout
            $newWorkoutId = DB::table('workouts')->insertGetId([
                'user_id' => $this->userIdMap[$oldWorkout->user_id],
                'name' => 'Cardio Workout',
                'date' => $oldWorkout->date ?: ($oldWorkout->created ?? Carbon::now()),
                'notes' => $oldWorkout->notes,
                'is_template' => 0,
                'template_id' => null,
                'created_at' => $oldWorkout->created ?? Carbon::now(),
                'updated_at' => $oldWorkout->created ?? Carbon::now(),
            ]);
            
            // Create cardio segment
            $segmentId = DB::table('workout_segments')->insertGetId([
                'workout_id' => $newWorkoutId,
                'name' => 'Cardio',
                'segment_type' => 'cardio',
                'segment_order' => 1,
                'notes' => null,
                'created_at' => $oldWorkout->created ?? Carbon::now(),
                'updated_at' => $oldWorkout->created ?? Carbon::now(),
            ]);
            
            // Get cardio exercises
            $cardioExercises = DB::connection('mysql_old')->table('cardio_workout_exercise')
                ->where('cardio_workout_id', $oldWorkout->id)
                ->get();
            
            foreach ($cardioExercises as $oldExercise) {
                $exerciseKey = 'cardio_' . $oldExercise->cardio_exercise_id;
                
                // Skip if exercise not migrated
                if (!isset($this->exerciseIdMap[$exerciseKey])) {
                    continue;
                }
                
                // Create workout exercise
                $workoutExerciseId = DB::table('workout_exercises')->insertGetId([
                    'workout_id' => $newWorkoutId,
                    'segment_id' => $segmentId,
                    'exercise_id' => $this->exerciseIdMap[$exerciseKey],
                    'exercise_order' => 1,
                    'notes' => null,
                    'rest_seconds' => null,
                    'superset_with' => null,
                    'created_at' => $oldWorkout->created ?? Carbon::now(),
                    'updated_at' => $oldWorkout->created ?? Carbon::now(),
                ]);
                
                // Create single set with duration and distance
                DB::table('exercise_sets')->insert([
                    'workout_exercise_id' => $workoutExerciseId,
                    'set_number' => 1,
                    'reps' => null,
                    'weight_kg' => null,
                    'distance_km' => $this->convertDistance($oldExercise->distance, $oldWorkout->unit_system ?? 0),
                    'duration_seconds' => ($oldExercise->duration ?: 0) * 60, // Convert minutes to seconds
                    'rpe' => null,
                    'is_warmup' => 0,
                    'is_dropset' => 0,
                    'created_at' => $oldWorkout->created ?? Carbon::now(),
                    'updated_at' => $oldWorkout->created ?? Carbon::now(),
                ]);
            }
            
            $count++;
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("Migrated $count cardio workouts");
    }
    
    /**
     * Helper functions
     */
    private function mapGender($oldGender)
    {
        switch ($oldGender) {
            case 1: return 'male';
            case 2: return 'female';
            default: return null;
        }
    }
    
    private function mapMuscleGroup($muscleGroupId)
    {
        $muscleGroups = [
            1 => 'Chest',
            2 => 'Back', 
            3 => 'Shoulders',
            4 => 'Biceps',
            5 => 'Triceps',
            6 => 'Forearms',
            7 => 'Abs',
            8 => 'Quads',
            9 => 'Hamstrings',
            10 => 'Glutes',
            11 => 'Calves',
            12 => 'Traps',
            13 => 'Lats',
        ];
        
        return $muscleGroups[$muscleGroupId] ?? null;
    }
    
    private function mapSecondaryMuscles($muscleIds)
    {
        if (!$muscleIds) return [];
        
        $ids = explode(',', $muscleIds);
        $muscles = [];
        
        foreach ($ids as $id) {
            $muscle = $this->mapMuscleGroup(trim($id));
            if ($muscle) {
                $muscles[] = $muscle;
            }
        }
        
        return $muscles;
    }
    
    private function mapEquipment($equipmentId)
    {
        $equipment = [
            1 => 'Barbell',
            2 => 'Dumbbell',
            3 => 'Cable',
            4 => 'Machine',
            5 => 'Bodyweight',
            6 => 'Kettlebell',
            7 => 'Resistance Bands',
            8 => 'Medicine Ball',
            9 => 'EZ Bar',
            10 => 'Smith Machine',
        ];
        
        return $equipment[$equipmentId] ?? 'Other';
    }
    
    private function convertWeight($weight, $unit)
    {
        // If unit is 'lbs' or 'lb', convert pounds to kg
        if (($unit === 'lbs' || $unit === 'lb' || $unit === 1) && $weight) {
            return round($weight * 0.453592, 2);
        }
        return $weight;
    }
    
    private function convertDistance($distance, $unitSystem)
    {
        // If imperial (1), convert miles to km
        if ($unitSystem == 1 && $distance) {
            return round($distance * 1.60934, 2);
        }
        return $distance;
    }
    
    /**
     * Print migration statistics
     */
    private function printStats()
    {
        $this->newLine();
        $this->info('=== Migration Statistics ===');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Users migrated', count($this->userIdMap)],
                ['Exercises migrated', count($this->exerciseIdMap)],
                ['Workouts migrated', count($this->workoutIdMap)],
            ]
        );
        
        $this->newLine();
        $this->info('=== New Database Totals ===');
        $this->table(
            ['Table', 'Records'],
            [
                ['Users', DB::table('users')->count()],
                ['User Profiles', DB::table('user_profiles')->count()],
                ['Exercises', DB::table('exercises')->count()],
                ['Workouts', DB::table('workouts')->count()],
                ['Workout Segments', DB::table('workout_segments')->count()],
                ['Workout Exercises', DB::table('workout_exercises')->count()],
                ['Exercise Sets', DB::table('exercise_sets')->count()],
            ]
        );
    }
    
    /**
     * Load existing user mapping from database
     */
    private function loadExistingUserMapping()
    {
        $this->info('Loading existing user mappings...');
        
        // Get all existing users with emails
        $existingUsers = DB::table('users')
            ->whereNotNull('email')
            ->get();
            
        foreach ($existingUsers as $user) {
            // Try to find old user ID by email
            $oldUser = DB::connection('mysql_old')->table('user')
                ->where('email', $user->email)
                ->first();
                
            if ($oldUser) {
                $this->userIdMap[$oldUser->id] = $user->id;
            }
        }
        
        $this->info('Loaded ' . count($this->userIdMap) . ' existing user mappings');
    }
    
    /**
     * Load existing exercise mapping from database
     */
    private function loadExistingExerciseMapping()
    {
        $this->info('Loading existing exercise mappings...');
        
        // Get all existing exercises
        $existingExercises = DB::table('exercises')->get();
        
        foreach ($existingExercises as $exercise) {
            // Try to match by name
            if (strpos($exercise->name, 'Exercise ') === 0) {
                $oldId = intval(str_replace('Exercise ', '', $exercise->name));
                $this->exerciseIdMap[$oldId] = $exercise->id;
            } elseif (strpos($exercise->name, 'Cardio ') === 0) {
                $oldId = intval(str_replace('Cardio ', '', $exercise->name));
                $this->exerciseIdMap['cardio_' . $oldId] = $exercise->id;
            } else {
                // Try to find by exact name match
                $oldExercise = DB::connection('mysql_old')->table('exercise_translation')
                    ->where('translation', $exercise->name)
                    ->where('language_id', 1)
                    ->first();
                    
                if ($oldExercise) {
                    $this->exerciseIdMap[$oldExercise->exercise_id] = $exercise->id;
                }
            }
        }
        
        $this->info('Loaded ' . count($this->exerciseIdMap) . ' existing exercise mappings');
    }
    
    /**
     * Load existing workout mapping from database
     */
    private function loadExistingWorkoutMapping()
    {
        $this->info('Loading existing workout mappings...');
        
        // Get all workouts with "Treening X" pattern
        $existingWorkouts = DB::table('workouts')
            ->where('name', 'LIKE', 'Treening %')
            ->get();
            
        foreach ($existingWorkouts as $workout) {
            $oldId = intval(str_replace('Treening ', '', $workout->name));
            if ($oldId > 0) {
                $this->workoutIdMap[$oldId] = $workout->id;
            }
        }
        
        $this->info('Loaded ' . count($this->workoutIdMap) . ' existing workout mappings');
    }
}