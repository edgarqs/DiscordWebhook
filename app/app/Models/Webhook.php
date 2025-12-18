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
    ];

    protected $casts = [
        'tags' => 'array',
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

    // Helper methods
    public function getUserPermissionLevel(?int $userId = null): string
    {
        $userId = $userId ?? auth()->id();
        
        if (!$userId) {
            return 'none';
        }

        // Check if user is owner
        if ($this->user_id === $userId) {
            return 'owner';
        }

        // Check if user is a collaborator
        $collaborator = $this->collaborators()
            ->where('user_id', $userId)
            ->whereNotNull('accepted_at')
            ->first();

        return $collaborator ? $collaborator->permission_level : 'none';
    }

    public function isOwnedBy(?int $userId = null): bool
    {
        $userId = $userId ?? auth()->id();
        return $this->user_id === $userId;
    }
}
