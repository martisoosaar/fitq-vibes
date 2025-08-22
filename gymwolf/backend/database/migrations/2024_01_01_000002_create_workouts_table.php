<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name')->nullable();
            $table->dateTime('date');
            $table->unsignedSmallInteger('duration_minutes')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('bodyweight_kg', 5, 2)->nullable();
            $table->enum('mood', ['great', 'good', 'okay', 'bad'])->default('good');
            $table->unsignedTinyInteger('energy_level')->default(3); // 1-5 scale
            $table->unsignedBigInteger('gym_id')->nullable();
            $table->boolean('is_template')->default(false);
            $table->unsignedBigInteger('template_id')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'date']);
            $table->index('date');
            $table->index('template_id');
            $table->fullText(['name', 'notes']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workouts');
    }
};