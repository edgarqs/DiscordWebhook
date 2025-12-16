<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageHistory extends Model
{
    protected $table = 'message_history';

    protected $fillable = [
        'webhook_id',
        'user_id',
        'scheduled_message_id',
        'message_content',
        'sent_at',
        'status',
        'response',
    ];

    protected $casts = [
        'message_content' => 'array',
        'response' => 'array',
        'sent_at' => 'datetime',
    ];

    // Relationships
    public function webhook(): BelongsTo
    {
        return $this->belongsTo(Webhook::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scheduledMessage(): BelongsTo
    {
        return $this->belongsTo(ScheduledMessage::class);
    }
}
