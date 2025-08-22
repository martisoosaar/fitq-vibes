<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Exercise;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Define muscle group keywords for pattern matching
        $muscleGroupPatterns = [
            'Chest' => [
                'chest', 'pec', 'bench', 'fly', 'flye', 'push-up', 'push up', 'pushup', 
                'crossover', 'dip', 'supino', 'panca', 'pectoralis', 'decline press',
                'incline press', 'flat press', 'cable press', 'dumbbell press',
                'barbell press', 'machine press', 'pec deck', 'butterfly'
            ],
            'Back' => [
                'back', 'lat', 'row', 'pull-up', 'pull up', 'pullup', 'chin-up', 'chinup',
                'pulldown', 'pull-down', 'deadlift', 'dead lift', 'shrug', 'rhomboid',
                'trapezius', 'trap', 'dorsal', 'remada', 'barra fixa', 'puxada',
                'levantamento terra', 'good morning', 'hyperextension', 'reverse fly',
                'face pull', 't-bar', 'cable row', 'pendlay', 'meadows', 'kroc'
            ],
            'Shoulders' => [
                'shoulder', 'delt', 'lateral raise', 'front raise', 'rear delt',
                'military press', 'overhead press', 'ohp', 'arnold press', 'upright row',
                'ombro', 'desenvolvimento', 'elevação lateral', 'elevação frontal',
                'scaption', 'cuban press', 'pike push', 'handstand', 'y-raise',
                't-raise', 'w-raise', 'overhead', 'õlakehitus', 'õlg'
            ],
            'Biceps' => [
                'bicep', 'curl', 'preacher', 'hammer', 'concentration', 'bíceps',
                'rosca', 'supination', 'chin up narrow', 'drag curl', 'spider curl',
                'cable curl', 'barbell curl', 'dumbbell curl', 'ez bar curl',
                '21s', 'twenty-one', 'peak contraction'
            ],
            'Triceps' => [
                'tricep', 'extension', 'pushdown', 'push-down', 'push down', 'kickback',
                'dip', 'close grip', 'close-grip', 'diamond push', 'skull crusher',
                'overhead extension', 'french press', 'tríceps', 'paralela', 'fundos',
                'rope pushdown', 'overhead tricep', 'jm press', 'tate press'
            ],
            'Abs' => [
                'abs', 'ab', 'core', 'plank', 'crunch', 'sit-up', 'sit up', 'situp',
                'leg raise', 'knee raise', 'oblique', 'russian twist', 'side bend',
                'abdominal', 'abdomen', 'v-up', 'v up', 'mountain climber', 'flutter',
                'scissor', 'bicycle', 'dead bug', 'bird dog', 'pallof', 'rollout',
                'hanging knee', 'hanging leg', 'woodchop', 'cable crunch', 'pike'
            ],
            'Quads' => [
                'quad', 'squat', 'leg press', 'lunge', 'leg extension', 'front squat',
                'hack squat', 'bulgarian split', 'goblet squat', 'pistol squat',
                'step up', 'step-up', 'sissy', 'wall sit', 'quadriceps', 'agachamento',
                'leg machine', 'smith squat', 'zercher', 'box squat', 'jump squat',
                'split squat', 'walking lunge', 'reverse lunge', 'curtsy lunge'
            ],
            'Hamstrings' => [
                'hamstring', 'leg curl', 'nordic', 'romanian deadlift', 'rdl',
                'good morning', 'glute ham', 'glute-ham', 'lying curl', 'seated curl',
                'standing curl', 'stiff leg', 'straight leg', 'posterior chain',
                'hip thrust', 'glute bridge', 'single leg deadlift', 'sumo deadlift'
            ],
            'Glutes' => [
                'glute', 'glút', 'hip thrust', 'hip bridge', 'butt', 'booty',
                'donkey kick', 'fire hydrant', 'clamshell', 'bulgarian squat',
                'curtsy lunge', 'hip abduction', 'hip extension', 'cable kickback',
                'barbell hip thrust', 'glute ham raise', 'reverse hyper'
            ],
            'Calves' => [
                'calf', 'calve', 'calf raise', 'standing calf', 'seated calf',
                'donkey calf', 'toe raise', 'panturrilha', 'gêmeos', 'soleus',
                'gastrocnemius', 'toe press', 'single leg calf', 'box calf'
            ],
            'Forearms' => [
                'forearm', 'wrist', 'grip', 'farmer', 'farmers walk', 'farmers carry',
                'wrist curl', 'wrist extension', 'reverse curl', 'antebraço',
                'grip strength', 'plate pinch', 'dead hang', 'towel pull',
                'wrist roller', 'pronation', 'supination'
            ],
            'Cardio' => [
                'run', 'treadmill', 'bike', 'bicycle', 'cycling', 'elliptical',
                'rowing', 'swimming', 'jogging', 'sprint', 'hiit', 'cardio',
                'burpee', 'jumping jack', 'jump rope', 'skipping', 'stair',
                'stepper', 'aerobic', 'conditioning', 'interval', 'circuit',
                'crossfit', 'metcon', 'emom', 'amrap', 'tabata', 'fartlek'
            ],
            'Full Body' => [
                'clean', 'snatch', 'jerk', 'thruster', 'burpee', 'man maker',
                'turkish get up', 'get-up', 'complex', 'circuit', 'superset',
                'giant set', 'crossfit', 'compound movement', 'olympic lift',
                'power clean', 'hang clean', 'clean and jerk', 'full body'
            ]
        ];
        
        // Process exercises in batches
        $batchSize = 1000;
        $offset = 0;
        $totalUpdated = 0;
        
        do {
            $exercises = Exercise::select('id', 'name', 'primary_muscle_group')
                ->offset($offset)
                ->limit($batchSize)
                ->get();
            
            if ($exercises->isEmpty()) {
                break;
            }
            
            foreach ($exercises as $exercise) {
                $exerciseName = strtolower($exercise->name);
                $currentMuscleGroup = $exercise->primary_muscle_group;
                $newMuscleGroup = null;
                $bestScore = 0;
                
                // Check if already correctly categorized (e.g., "Chest - Other" should be "Chest")
                if (strpos($exerciseName, ' - other') !== false) {
                    $parts = explode(' - ', $exercise->name);
                    $potentialGroup = ucfirst(strtolower($parts[0]));
                    if (array_key_exists($potentialGroup, $muscleGroupPatterns)) {
                        $newMuscleGroup = $potentialGroup;
                    }
                }
                
                // Pattern matching if not already determined
                if (!$newMuscleGroup) {
                    foreach ($muscleGroupPatterns as $muscleGroup => $patterns) {
                        $score = 0;
                        foreach ($patterns as $pattern) {
                            if (strpos($exerciseName, $pattern) !== false) {
                                // Give higher score for exact word matches
                                if (preg_match('/\b' . preg_quote($pattern, '/') . '\b/i', $exerciseName)) {
                                    $score += 3;
                                } else {
                                    $score += 1;
                                }
                            }
                        }
                        
                        if ($score > $bestScore) {
                            $bestScore = $score;
                            $newMuscleGroup = $muscleGroup;
                        }
                    }
                }
                
                // If we found a muscle group and it's different from current, update it
                if ($newMuscleGroup && $newMuscleGroup !== $currentMuscleGroup) {
                    $exercise->primary_muscle_group = $newMuscleGroup;
                    $exercise->save();
                    $totalUpdated++;
                }
                // If no pattern matched and current group seems wrong, set to most likely based on partial matches
                elseif (!$newMuscleGroup && $bestScore == 0) {
                    // Check for very generic names
                    if (in_array($exerciseName, ['workout', 'exercise', 'training', 'other', 'custom', 'test'])) {
                        // Skip generic names
                        continue;
                    }
                    
                    // For numbered exercises or very short names, keep current
                    if (strlen($exerciseName) <= 3 || preg_match('/^\d+$/', $exerciseName)) {
                        continue;
                    }
                    
                    // Default fallback based on common equipment or movement patterns
                    if (strpos($exerciseName, 'barbell') !== false || strpos($exerciseName, 'bar') !== false) {
                        $newMuscleGroup = 'Back'; // Many barbell exercises are compound back movements
                    } elseif (strpos($exerciseName, 'dumbbell') !== false || strpos($exerciseName, 'db') !== false) {
                        $newMuscleGroup = 'Chest'; // Many dumbbell exercises are chest/upper body
                    } elseif (strpos($exerciseName, 'cable') !== false) {
                        $newMuscleGroup = 'Back'; // Cable exercises often target back
                    } elseif (strpos($exerciseName, 'machine') !== false) {
                        $newMuscleGroup = 'Quads'; // Many machines are for legs
                    }
                    
                    if ($newMuscleGroup && $newMuscleGroup !== $currentMuscleGroup) {
                        $exercise->primary_muscle_group = $newMuscleGroup;
                        $exercise->save();
                        $totalUpdated++;
                    }
                }
            }
            
            $offset += $batchSize;
            echo "Processed $offset exercises, updated $totalUpdated so far...\n";
            
        } while (true);
        
        echo "Migration complete! Updated $totalUpdated exercises.\n";
        
        // Show final distribution
        $distribution = Exercise::selectRaw('primary_muscle_group, COUNT(*) as count')
            ->groupBy('primary_muscle_group')
            ->orderBy('count', 'desc')
            ->get();
            
        echo "\nFinal distribution:\n";
        foreach ($distribution as $group) {
            echo $group->primary_muscle_group . ': ' . $group->count . "\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not reversible as we don't store the old values
        echo "This migration cannot be reversed. Original muscle group assignments were not preserved.\n";
    }
};