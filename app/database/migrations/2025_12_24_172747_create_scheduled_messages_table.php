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
        Schema::create('scheduled_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('webhook_id')->constrained()->onDelete('cascade');
            $table->foreignId('template_id')->nullable()->constrained()->onDelete('set null');
            
            // Message content (JSON with content + embeds)
            $table->json('message_content');
            
            // Schedule configuration
            $table->enum('schedule_type', ['once', 'recurring'])->default('once');
            $table->timestamp('scheduled_at')->nullable(); // For one-time messages
            $table->json('recurrence_pattern')->nullable(); // For recurring messages
            $table->string('timezone')->default('UTC');
            
            // Execution tracking
            $table->timestamp('next_send_at')->nullable()->index();
            $table->integer('send_count')->default(0);
            $table->integer('max_sends')->nullable(); // For recurring messages
            
            // Status
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'paused'])->default('pending');
            $table->text('error_message')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduled_messages');
    }
};
