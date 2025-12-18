<?php

namespace App\Listeners;

use App\Services\EmailRateLimiter;
use Illuminate\Auth\Events\PasswordResetLinkSent;
use Illuminate\Support\Facades\Log;

class LogPasswordResetEmail
{
    protected EmailRateLimiter $rateLimiter;

    public function __construct(EmailRateLimiter $rateLimiter)
    {
        $this->rateLimiter = $rateLimiter;
    }

    public function handle(PasswordResetLinkSent $event): void
    {
        // Log the password reset email
        $this->rateLimiter->logEmail(
            $event->user->email,
            'password_reset',
            $event->user->id
        );

        Log::info('Password reset email sent', [
            'email' => $event->user->email,
            'user_id' => $event->user->id,
        ]);
    }
}
