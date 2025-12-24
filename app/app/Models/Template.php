<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Template extends Model
{
    protected $fillable = [
        'user_id',
        'webhook_id',
        'name',
        'description',
        'category',
        'content',
        'is_shared',
    ];

    protected $casts = [
        'content' => 'array',
        'is_shared' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function webhook(): BelongsTo
    {
        return $this->belongsTo(Webhook::class);
    }

    // Scopes
    public function scopePersonal(Builder $query): Builder
    {
        return $query->where('user_id', auth()->id());
    }

    public function scopeShared(Builder $query): Builder
    {
        return $query->where('is_shared', true)
            ->whereHas('webhook.collaborators', function ($q) {
                $q->where('user_id', auth()->id());
            });
    }

    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    // Helper methods
    public function isOwnedBy(?int $userId = null): bool
    {
        $userId = $userId ?? auth()->id();
        return $this->user_id === $userId;
    }

    public function isSharedWith(User $user): bool
    {
        return $this->collaborators()->where('user_id', $user->id)->exists();
    }

    public function getCollaboratorPermission(User $user): ?string
    {
        $collaborator = $this->collaborators()->where('user_id', $user->id)->first();
        return $collaborator?->pivot->permission_level;
    }

    public function canBeEditedBy(User $user): bool
    {
        if ($this->isOwnedBy($user->id)) {
            return true;
        }
        
        return $this->getCollaboratorPermission($user) === 'edit';
    }

    public function getUserPermissionLevel(?int $userId = null): string
    {
        $userId = $userId ?? auth()->id();
        
        if ($this->isOwnedBy($userId)) {
            return 'owner';
        }
        
        $user = User::find($userId);
        if (!$user) {
            return 'view';
        }
        
        return $this->getCollaboratorPermission($user) ?? 'view';
    }

    // Relationships
    public function collaborators()
    {
        return $this->belongsToMany(User::class, 'template_collaborators')
            ->withPivot('permission_level')
            ->withTimestamps();
    }
}
