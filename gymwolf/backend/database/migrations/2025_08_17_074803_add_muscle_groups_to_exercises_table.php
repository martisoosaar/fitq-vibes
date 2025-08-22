<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exercises', function (Blueprint $table) {
            $table->string('primary_muscle_group')->nullable()->after('category');
            $table->json('secondary_muscle_groups')->nullable()->after('primary_muscle_group');
            $table->string('equipment')->nullable()->after('secondary_muscle_groups');
        });
    }

    public function down(): void
    {
        Schema::table('exercises', function (Blueprint $table) {
            $table->dropColumn(['primary_muscle_group', 'secondary_muscle_groups', 'equipment']);
        });
    }
};