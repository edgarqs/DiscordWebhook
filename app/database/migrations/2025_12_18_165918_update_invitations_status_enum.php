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
        // Compatible with both PostgreSQL and MySQL
        Schema::table('invitations', function (Blueprint $table) {
            $table->enum('status', ['pending', 'accepted', 'declined', 'cancelled'])
                  ->default('pending')
                  ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        Schema::table('invitations', function (Blueprint $table) {
            $table->enum('status', ['pending', 'accepted', 'rejected'])
                  ->default('pending')
                  ->change();
        });
    }
};
