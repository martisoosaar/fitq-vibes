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
        // Main challenges table
        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->text('rules')->nullable();
            $table->text('prizes')->nullable();
            $table->string('image_url')->nullable();
            $table->string('video_url')->nullable();
            $table->enum('result_type', ['reps', 'time']); // reps or time
            $table->enum('scoring_type', ['higher_better', 'lower_better']); // higher is better or lower is better
            $table->string('result_unit')->nullable(); // e.g., "reps", "seconds", "minutes"
            $table->datetime('start_date');
            $table->datetime('end_date');
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['start_date', 'end_date']);
            $table->index('is_active');
        });
        
        // Challenge results/submissions table
        Schema::create('challenge_results', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('challenge_id');
            $table->unsignedBigInteger('user_id');
            $table->string('result_value'); // Store as string to handle both numbers and time formats
            $table->decimal('numeric_value', 10, 2)->nullable(); // For sorting (convert time to seconds)
            $table->text('notes')->nullable();
            $table->string('video_proof_url')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->datetime('verified_at')->nullable();
            $table->timestamps();
            
            $table->foreign('challenge_id')->references('id')->on('challenges')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
            
            $table->unique(['challenge_id', 'user_id']); // One result per user per challenge
            $table->index(['challenge_id', 'numeric_value']); // For leaderboard sorting
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenge_results');
        Schema::dropIfExists('challenges');
    }
};
