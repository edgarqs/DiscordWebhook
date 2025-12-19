<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Webhook;
use Illuminate\Auth\Access\Response;

class WebhookPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Webhook $webhook): bool
    {
        // Owner can always view
        if ($user->id === $webhook->user_id) {
            return true;
        }

        // Check if user is a collaborator
        return $webhook->collaborators()
            ->where('user_id', $user->id)
            ->whereNotNull('accepted_at')
            ->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Webhook $webhook): bool
    {
        // Owner can always update
        if ($user->id === $webhook->user_id) {
            return true;
        }

        // Check if user is a collaborator with admin or editor permission
        $collaborator = $webhook->collaborators()
            ->where('user_id', $user->id)
            ->whereNotNull('accepted_at')
            ->first();

        return $collaborator && in_array($collaborator->permission_level, ['admin', 'editor']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Webhook $webhook): bool
    {
        // Owner can always delete
        if ($user->id === $webhook->user_id) {
            return true;
        }

        // Check if user is a collaborator with admin permission
        $collaborator = $webhook->collaborators()
            ->where('user_id', $user->id)
            ->whereNotNull('accepted_at')
            ->first();

        return $collaborator && $collaborator->permission_level === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Webhook $webhook): bool
    {
        return $user->id === $webhook->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Webhook $webhook): bool
    {
        return $user->id === $webhook->user_id;
    }

    /**
     * Determine if the user can manage collaborators.
     */
    public function manageCollaborators(User $user, Webhook $webhook): bool
    {
        // Owner can always manage collaborators
        if ($user->id === $webhook->user_id) {
            return true;
        }

        // Check if user is a collaborator with admin permission
        $collaborator = $webhook->collaborators()
            ->where('user_id', $user->id)
            ->whereNotNull('accepted_at')
            ->first();

        return $collaborator && $collaborator->permission_level === 'admin';
    }

    /**
     * Determine if the user can send messages via the webhook.
     */
    public function send(User $user, Webhook $webhook): bool
    {
        // Owner can always send
        if ($user->id === $webhook->user_id) {
            return true;
        }

        // Any accepted collaborator can send (including viewers)
        return $webhook->collaborators()
            ->where('user_id', $user->id)
            ->whereNotNull('accepted_at')
            ->exists();
    }
}
