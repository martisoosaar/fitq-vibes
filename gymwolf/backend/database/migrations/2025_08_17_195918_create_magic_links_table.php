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
        Schema::create('magic_links', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('token', 64)->unique();
            $table->timestamp('expires_at');
            $table->boolean('used')->default(false);
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            
            $table->index('email');
            $table->index('token');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('magic_links');
    }
};