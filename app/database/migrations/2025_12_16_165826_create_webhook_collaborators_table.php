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
        Schema::create('webhook_collaborators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webhook_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('permission_level', ['admin', 'editor', 'viewer'])->default('viewer');
            $table->foreignId('invited_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('invited_at')->useCurrent();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->unique(['webhook_id', 'user_id']);
            $table->index('webhook_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhook_collaborators');
    }
};
