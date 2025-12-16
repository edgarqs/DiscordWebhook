<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Webhook extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'webhook_url',
        'guild_id',
        'channel_id',
        'avatar_url',
        'description',
        'tags',
        'is_active',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function collaborators(): HasMany
    {
        return $this->hasMany(WebhookCollaborator::class);
    }

    public function templates(): HasMany
    {
        return $this->hasMany(Template::class);
    }

    public function scheduledMessages(): HasMany
    {
        return $this->hasMany(ScheduledMessage::class);
    }

    public function messageHistory(): HasMany
    {
        return $this->hasMany(MessageHistory::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }
}
