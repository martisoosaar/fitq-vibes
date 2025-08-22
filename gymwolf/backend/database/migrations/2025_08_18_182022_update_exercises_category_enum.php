<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // MySQL doesn't allow direct modification of ENUM columns
        // We need to use raw SQL to modify the enum values
        DB::statement("ALTER TABLE exercises MODIFY COLUMN category ENUM('strength', 'cardio', 'flexibility', 'plyometric', 'olympic', 'powerlifting', 'bodyweight', 'sports', 'mobility') NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original enum values
        DB::statement("ALTER TABLE exercises MODIFY COLUMN category ENUM('strength', 'cardio', 'flexibility', 'plyometric', 'olympic', 'powerlifting', 'bodyweight') NULL");
    }
};
