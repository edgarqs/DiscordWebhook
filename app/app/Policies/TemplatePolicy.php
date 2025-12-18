<?php

namespace App\Policies;

use App\Models\Template;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TemplatePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Any authenticated user can view templates
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Template $template): bool
    {
        // User can view if they own the template
        if ($template->user_id === $user->id) {
            return true;
        }

        // User can view if they are a collaborator
        if ($template->isSharedWith($user)) {
            return true;
        }

        // User can view if template is shared via webhook and they are a webhook collaborator
        if ($template->is_shared && $template->webhook_id) {
            return $template->webhook->collaborators()
                ->where('user_id', $user->id)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create templates
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Template $template): bool
    {
        // Owner can always update
        if ($template->user_id === $user->id) {
            return true;
        }

        // Collaborators with edit permission can update
        return $template->getCollaboratorPermission($user) === 'edit';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Template $template): bool
    {
        // Only the owner can delete the template
        return $template->user_id === $user->id;
    }

    /**
     * Determine whether the user can duplicate the model.
     */
    public function duplicate(User $user, Template $template): bool
    {
        // Anyone who can view the template can duplicate it
        return $this->view($user, $template);
    }

    /**
     * Determine whether the user can manage collaborators.
     */
    public function manageCollaborators(User $user, Template $template): bool
    {
        // Only the owner can manage collaborators
        return $template->user_id === $user->id;
    }
}
