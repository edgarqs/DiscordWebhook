<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ScheduledMessageFile extends Model
{
    protected $fillable = [
        'scheduled_message_id',
        'filename',
        'stored_path',
        'mime_type',
        'size',
    ];

    // Relationships
    public function scheduledMessage(): BelongsTo
    {
        return $this->belongsTo(ScheduledMessage::class);
    }

    // Accessors
    public function getFullPathAttribute(): string
    {
        return Storage::path($this->stored_path);
    }

    // Boot method to handle file deletion
    protected static function booted()
    {
        static::deleting(function ($file) {
            if (Storage::exists($file->stored_path)) {
                Storage::delete($file->stored_path);
            }
        });
    }
}
