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
        // For PostgreSQL, we need to modify the column to accept new enum values
        // Drop the existing check constraint and recreate with new values
        DB::statement("ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_status_check");
        DB::statement("ALTER TABLE invitations ALTER COLUMN status TYPE VARCHAR(20)");
        DB::statement("ALTER TABLE invitations ADD CONSTRAINT invitations_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_status_check");
        DB::statement("ALTER TABLE invitations ADD CONSTRAINT invitations_status_check CHECK (status IN ('pending', 'accepted', 'rejected'))");
    }
};
