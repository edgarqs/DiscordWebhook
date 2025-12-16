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
            $table->json('message_content'); // Full message payload sent to Discord
            $table->timestamp('sent_at');
            $table->string('status', 20); // 'success' or 'failed'
            $table->json('response')->nullable(); // Discord API response
            $table->timestamps();
            
            $table->index(['webhook_id', 'sent_at']);
            $table->index('user_id');
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
