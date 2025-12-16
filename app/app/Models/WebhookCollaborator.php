<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookCollaborator extends Model
{
    protected $fillable = [
        'webhook_id',
        'user_id',
        'permission_level',
        'invited_by',
        'invited_at',
        'accepted_at',
    ];

    protected $casts = [
        'invited_at' => 'datetime',
        'accepted_at' => 'datetime',
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

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
