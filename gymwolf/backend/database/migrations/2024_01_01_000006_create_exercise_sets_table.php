<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercise_sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_exercise_id')->constrained('workout_exercises')->onDelete('cascade');
            $table->unsignedTinyInteger('set_number');
            $table->unsignedSmallInteger('reps')->nullable();
            $table->decimal('weight_kg', 6, 2)->nullable();
            $table->decimal('distance_km', 6, 3)->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->unsignedTinyInteger('rpe')->nullable(); // Rate of Perceived Exertion (1-10)
            $table->boolean('is_warmup')->default(false);
            $table->boolean('is_dropset')->default(false);
            $table->timestamps();
            
            $table->index(['workout_exercise_id', 'set_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercise_sets');
    }
};