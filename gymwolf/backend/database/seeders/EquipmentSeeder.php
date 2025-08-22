<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Equipment;

class EquipmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $equipment = [
            // Bodyweight
            ['name' => 'None (Bodyweight)', 'category' => 'bodyweight', 'sort_order' => 1],
            
            // Free Weights
            ['name' => 'Barbell', 'category' => 'free_weight', 'sort_order' => 2],
            ['name' => 'Dumbbell', 'category' => 'free_weight', 'sort_order' => 3],
            ['name' => 'Kettlebell', 'category' => 'free_weight', 'sort_order' => 4],
            ['name' => 'EZ-Bar', 'category' => 'free_weight', 'sort_order' => 5],
            ['name' => 'Trap Bar', 'category' => 'free_weight', 'sort_order' => 6],
            ['name' => 'Weight Plate', 'category' => 'free_weight', 'sort_order' => 7],
            ['name' => 'Medicine Ball', 'category' => 'free_weight', 'sort_order' => 8],
            ['name' => 'Slam Ball', 'category' => 'free_weight', 'sort_order' => 9],
            
            // Machines
            ['name' => 'Cable Machine', 'category' => 'machine', 'sort_order' => 10],
            ['name' => 'Smith Machine', 'category' => 'machine', 'sort_order' => 11],
            ['name' => 'Leg Press Machine', 'category' => 'machine', 'sort_order' => 12],
            ['name' => 'Chest Press Machine', 'category' => 'machine', 'sort_order' => 13],
            ['name' => 'Lat Pulldown Machine', 'category' => 'machine', 'sort_order' => 14],
            ['name' => 'Leg Curl Machine', 'category' => 'machine', 'sort_order' => 15],
            ['name' => 'Leg Extension Machine', 'category' => 'machine', 'sort_order' => 16],
            ['name' => 'Hack Squat Machine', 'category' => 'machine', 'sort_order' => 17],
            ['name' => 'Calf Raise Machine', 'category' => 'machine', 'sort_order' => 18],
            ['name' => 'Pec Deck Machine', 'category' => 'machine', 'sort_order' => 19],
            ['name' => 'Shoulder Press Machine', 'category' => 'machine', 'sort_order' => 20],
            ['name' => 'Row Machine', 'category' => 'machine', 'sort_order' => 21],
            ['name' => 'Abdominal Machine', 'category' => 'machine', 'sort_order' => 22],
            
            // Cardio Equipment
            ['name' => 'Treadmill', 'category' => 'cardio', 'sort_order' => 23],
            ['name' => 'Stationary Bike', 'category' => 'cardio', 'sort_order' => 24],
            ['name' => 'Elliptical', 'category' => 'cardio', 'sort_order' => 25],
            ['name' => 'Rowing Machine', 'category' => 'cardio', 'sort_order' => 26],
            ['name' => 'Stair Climber', 'category' => 'cardio', 'sort_order' => 27],
            ['name' => 'Assault Bike', 'category' => 'cardio', 'sort_order' => 28],
            ['name' => 'Ski Erg', 'category' => 'cardio', 'sort_order' => 29],
            
            // Other Equipment
            ['name' => 'Pull-up Bar', 'category' => 'other', 'sort_order' => 30],
            ['name' => 'Dip Bars', 'category' => 'other', 'sort_order' => 31],
            ['name' => 'Bench', 'category' => 'other', 'sort_order' => 32],
            ['name' => 'Incline Bench', 'category' => 'other', 'sort_order' => 33],
            ['name' => 'Decline Bench', 'category' => 'other', 'sort_order' => 34],
            ['name' => 'Preacher Bench', 'category' => 'other', 'sort_order' => 35],
            ['name' => 'Squat Rack', 'category' => 'other', 'sort_order' => 36],
            ['name' => 'Power Rack', 'category' => 'other', 'sort_order' => 37],
            ['name' => 'Resistance Bands', 'category' => 'other', 'sort_order' => 38],
            ['name' => 'TRX', 'category' => 'other', 'sort_order' => 39],
            ['name' => 'Battle Ropes', 'category' => 'other', 'sort_order' => 40],
            ['name' => 'Foam Roller', 'category' => 'other', 'sort_order' => 41],
            ['name' => 'Bosu Ball', 'category' => 'other', 'sort_order' => 42],
            ['name' => 'Swiss Ball', 'category' => 'other', 'sort_order' => 43],
            ['name' => 'Ab Wheel', 'category' => 'other', 'sort_order' => 44],
            ['name' => 'Jump Rope', 'category' => 'other', 'sort_order' => 45],
            ['name' => 'Box', 'category' => 'other', 'sort_order' => 46],
            ['name' => 'Sled', 'category' => 'other', 'sort_order' => 47],
            ['name' => 'Tire', 'category' => 'other', 'sort_order' => 48],
            ['name' => 'Sandbag', 'category' => 'other', 'sort_order' => 49],
        ];
        
        foreach ($equipment as $item) {
            Equipment::updateOrCreate(
                ['name' => $item['name']],
                $item
            );
        }
    }
}