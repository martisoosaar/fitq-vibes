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
        // Main documents table - stores current version
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // 'terms', 'privacy', etc.
            $table->string('title');
            $table->longText('content');
            $table->string('version', 10);
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            $table->index('slug');
        });
        
        // Document history table - stores all previous versions
        Schema::create('document_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('document_id');
            $table->string('title');
            $table->longText('content');
            $table->string('version', 10);
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->string('change_summary')->nullable();
            $table->timestamps();
            
            $table->foreign('document_id')->references('id')->on('documents')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['document_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_history');
        Schema::dropIfExists('documents');
    }
};