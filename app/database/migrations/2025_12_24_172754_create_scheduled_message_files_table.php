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
        Schema::create('scheduled_message_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scheduled_message_id')->constrained()->onDelete('cascade');
            $table->string('filename'); // Original filename
            $table->string('stored_path'); // Path in storage
            $table->string('mime_type');
            $table->integer('size'); // File size in bytes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduled_message_files');
    }
};
