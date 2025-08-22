<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_id')->constrained()->onDelete('cascade');
            $table->foreignId('segment_id')->nullable()->constrained('workout_segments')->onDelete('cascade');
            $table->foreignId('exercise_id')->constrained();
            $table->unsignedTinyInteger('exercise_order');
            $table->text('notes')->nullable();
            $table->unsignedSmallInteger('rest_seconds')->nullable();
            $table->unsignedBigInteger('superset_with')->nullable(); // For supersets
            $table->timestamps();
            
            $table->index(['workout_id', 'exercise_order']);
            $table->index('segment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_exercises');
    }
};