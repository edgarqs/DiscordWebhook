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
        Schema::create('message_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webhook_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('scheduled_message_id')->nullable()->constrained()->onDelete('set null');
            $table->json('message_content');
            $table->timestamp('sent_at')->useCurrent();
            $table->enum('status', ['success', 'failed'])->default('success');
            $table->json('response')->nullable();
            $table->timestamps();

            $table->index('webhook_id');
            $table->index('user_id');
            $table->index('sent_at');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_history');
    }
};
