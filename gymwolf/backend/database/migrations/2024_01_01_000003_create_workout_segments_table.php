<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_segments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_id')->constrained()->onDelete('cascade');
            $table->enum('segment_type', ['warmup', 'strength', 'cardio', 'circuit', 'mobility', 'cooldown']);
            $table->unsignedTinyInteger('segment_order')->default(1);
            $table->string('name')->nullable();
            $table->unsignedSmallInteger('duration_minutes')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['workout_id', 'segment_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_segments');
    }
};