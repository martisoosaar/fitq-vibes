<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique()->nullable();
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->enum('category', ['strength', 'cardio', 'flexibility', 'plyometric', 'olympic', 'powerlifting', 'bodyweight'])->nullable();
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced'])->nullable();
            $table->string('video_url', 500)->nullable();
            $table->string('image_url', 500)->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamps();
            
            $table->index('category');
            $table->index('created_by');
            $table->fullText(['name', 'description']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};