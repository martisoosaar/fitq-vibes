<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Exercise;
use App\Models\WorkoutExercise;
use Illuminate\Support\Facades\DB;

class CleanupUnusedExercises extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exercises:cleanup-unused {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete exercises that have never been used in any workout';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        
        $this->info('Analyzing unused exercises...');
        
        // Get all exercise IDs that have been used in workouts
        $usedExerciseIds = WorkoutExercise::distinct('exercise_id')
            ->pluck('exercise_id')
            ->toArray();
        
        // Count statistics
        $totalExercises = Exercise::count();
        $usedCount = count($usedExerciseIds);
        
        // Get unused exercises
        $unusedExercises = Exercise::whereNotIn('id', $usedExerciseIds);
        $unusedCount = $unusedExercises->count();
        
        $this->info("Total exercises: $totalExercises");
        $this->info("Used exercises: $usedCount");
        $this->warn("Unused exercises to delete: $unusedCount");
        
        if ($unusedCount === 0) {
            $this->info('No unused exercises found.');
            return Command::SUCCESS;
        }
        
        // Show breakdown by pattern
        $this->info("\nBreakdown of unused exercises:");
        
        $patterns = [
            'Cardio%' => 'Cardio exercises',
            'Abs%' => 'Abs exercises',
            '%- Other' => 'Other category exercises',
            'Test%' => 'Test exercises',
            'Exercise%' => 'Generic exercise names',
        ];
        
        foreach ($patterns as $pattern => $description) {
            $count = Exercise::whereNotIn('id', $usedExerciseIds)
                ->where('name', 'like', $pattern)
                ->count();
            if ($count > 0) {
                $this->line("  $description (like '$pattern'): $count");
            }
        }
        
        // Show some sample exercises that will be deleted
        $this->info("\nSample exercises to be deleted:");
        $samples = Exercise::whereNotIn('id', $usedExerciseIds)
            ->limit(10)
            ->get(['id', 'name', 'created_by']);
        
        foreach ($samples as $exercise) {
            $creator = $exercise->created_by ? "User $exercise->created_by" : "System";
            $this->line("  ID: {$exercise->id}, Name: {$exercise->name}, Created by: $creator");
        }
        
        if ($isDryRun) {
            $this->warn("\nDRY RUN MODE: No exercises were deleted.");
            $this->info("Run without --dry-run flag to actually delete the exercises.");
            return Command::SUCCESS;
        }
        
        // Confirm deletion
        if (!$this->confirm("Do you want to delete $unusedCount unused exercises? This action cannot be undone!")) {
            $this->info('Operation cancelled.');
            return Command::SUCCESS;
        }
        
        $this->info('Deleting unused exercises...');
        
        // Delete in chunks to avoid memory issues
        $deleted = 0;
        $chunkSize = 1000;
        
        DB::beginTransaction();
        try {
            Exercise::whereNotIn('id', $usedExerciseIds)
                ->chunkById($chunkSize, function ($exercises) use (&$deleted) {
                    foreach ($exercises as $exercise) {
                        // Delete associated images if stored locally
                        if ($exercise->image_url) {
                            // Handle image deletion if needed
                        }
                        $exercise->delete();
                        $deleted++;
                    }
                    $this->info("Deleted $deleted exercises so far...");
                });
            
            DB::commit();
            $this->info("\nSuccessfully deleted $deleted unused exercises!");
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Error occurred during deletion: ' . $e->getMessage());
            return Command::FAILURE;
        }
        
        // Show final statistics
        $newTotal = Exercise::count();
        $this->info("\nFinal statistics:");
        $this->info("Total exercises remaining: $newTotal");
        $this->info("Exercises deleted: $deleted");
        
        return Command::SUCCESS;
    }
}