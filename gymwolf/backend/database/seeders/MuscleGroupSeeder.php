<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\MuscleGroup;

class MuscleGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $muscleGroups = [
            // Upper Body
            ['name' => 'Chest', 'category' => 'upper', 'sort_order' => 1],
            ['name' => 'Back', 'category' => 'upper', 'sort_order' => 2],
            ['name' => 'Shoulders', 'category' => 'upper', 'sort_order' => 3],
            ['name' => 'Biceps', 'category' => 'upper', 'sort_order' => 4],
            ['name' => 'Triceps', 'category' => 'upper', 'sort_order' => 5],
            ['name' => 'Forearms', 'category' => 'upper', 'sort_order' => 6],
            ['name' => 'Traps', 'category' => 'upper', 'sort_order' => 7],
            ['name' => 'Lats', 'category' => 'upper', 'sort_order' => 8],
            ['name' => 'Middle Back', 'category' => 'upper', 'sort_order' => 9],
            ['name' => 'Lower Back', 'category' => 'upper', 'sort_order' => 10],
            
            // Lower Body
            ['name' => 'Quadriceps', 'category' => 'lower', 'sort_order' => 11],
            ['name' => 'Hamstrings', 'category' => 'lower', 'sort_order' => 12],
            ['name' => 'Glutes', 'category' => 'lower', 'sort_order' => 13],
            ['name' => 'Calves', 'category' => 'lower', 'sort_order' => 14],
            ['name' => 'Adductors', 'category' => 'lower', 'sort_order' => 15],
            ['name' => 'Abductors', 'category' => 'lower', 'sort_order' => 16],
            ['name' => 'Hip Flexors', 'category' => 'lower', 'sort_order' => 17],
            
            // Core
            ['name' => 'Abs', 'category' => 'core', 'sort_order' => 18],
            ['name' => 'Obliques', 'category' => 'core', 'sort_order' => 19],
            ['name' => 'Core', 'category' => 'core', 'sort_order' => 20],
            
            // Full Body / Other
            ['name' => 'Full Body', 'category' => 'full', 'sort_order' => 21],
            ['name' => 'Cardio', 'category' => 'full', 'sort_order' => 22],
            ['name' => 'Neck', 'category' => 'other', 'sort_order' => 23],
            ['name' => 'Other', 'category' => 'other', 'sort_order' => 24],
        ];
        
        foreach ($muscleGroups as $group) {
            MuscleGroup::updateOrCreate(
                ['name' => $group['name']],
                $group
            );
        }
    }
}