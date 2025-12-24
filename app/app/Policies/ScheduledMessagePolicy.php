<?php

namespace App\Policies;

use App\Models\ScheduledMessage;
use App\Models\User;

class ScheduledMessagePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ScheduledMessage $scheduledMessage): bool
    {
        return $user->id === $scheduledMessage->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ScheduledMessage $scheduledMessage): bool
    {
        return $user->id === $scheduledMessage->user_id;
    }

    public function delete(User $user, ScheduledMessage $scheduledMessage): bool
    {
        return $user->id === $scheduledMessage->user_id;
    }
}
