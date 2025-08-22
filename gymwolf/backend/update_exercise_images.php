<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$imagesPath = __DIR__ . '/public/images/exercises/';
$updatedCount = 0;

// Get all image files
$files = scandir($imagesPath);
$exerciseImages = [];

foreach ($files as $file) {
    // Match files like 1066_0.jpg (not thumbnails)
    if (preg_match('/^(\d+)_(\d+)\.jpg$/', $file, $matches)) {
        $exerciseId = $matches[1];
        $position = $matches[2];
        
        if (!isset($exerciseImages[$exerciseId])) {
            $exerciseImages[$exerciseId] = [];
        }
        
        $exerciseImages[$exerciseId][] = '/images/exercises/' . $file;
    }
}

// Update database for each exercise that has images
foreach ($exerciseImages as $exerciseId => $images) {
    // Sort images to ensure proper order
    sort($images);
    
    // Store all images as JSON array
    $imageUrls = json_encode($images);
    
    // Check if exercise exists
    $exercise = DB::table('exercises')->where('id', $exerciseId)->first();
    
    if ($exercise) {
        // Update the exercise with all image URLs (stored as JSON in image_url field)
        DB::table('exercises')
            ->where('id', $exerciseId)
            ->update([
                'image_url' => $imageUrls
            ]);
        
        $updatedCount++;
        echo "Updated exercise ID {$exerciseId} ({$exercise->name}) with " . count($images) . " images\n";
    } else {
        echo "Exercise ID {$exerciseId} not found in database\n";
    }
}

echo "\n=== Summary ===\n";
echo "Updated: {$updatedCount} exercises with images\n";
echo "Total exercises with images found: " . count($exerciseImages) . "\n";