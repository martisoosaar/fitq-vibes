<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('workout_exercises', function (Blueprint $table) {
            // Template target fields
            $table->integer('target_sets')->nullable();
            $table->integer('target_reps')->nullable();
            $table->decimal('target_weight_kg', 6, 2)->nullable();
            $table->integer('target_duration_seconds')->nullable();
            $table->decimal('target_distance_km', 8, 3)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workout_exercises', function (Blueprint $table) {
            $table->dropColumn([
                'target_sets',
                'target_reps',
                'target_weight_kg',
                'target_duration_seconds',
                'target_distance_km'
            ]);
        });
    }
};