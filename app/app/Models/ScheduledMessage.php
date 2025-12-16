<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduledMessage extends Model
{
    protected $fillable = [
        'webhook_id',
        'user_id',
        'template_id',
        'message_content',
        'scheduled_at',
        'recurrence_rule',
        'status',
        'sent_at',
        'error_message',
    ];

    protected $casts = [
        'message_content' => 'array',
        'recurrence_rule' => 'array',
        'scheduled_at' => 'datetime',
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

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }
}
