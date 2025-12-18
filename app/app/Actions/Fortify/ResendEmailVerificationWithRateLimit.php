<?php

namespace App\Actions\Fortify;

use App\Services\EmailRateLimiter;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ResendEmailVerificationWithRateLimit
{
    protected EmailRateLimiter $rateLimiter;

    public function __construct(EmailRateLimiter $rateLimiter)
    {
        $this->rateLimiter = $rateLimiter;
    }

    public function __invoke(): void
    {
        $user = Auth::user();

        if (!$user instanceof MustVerifyEmail) {
            return;
        }

        if ($user->hasVerifiedEmail()) {
            return;
        }

        // Check rate limit
        $rateLimitCheck = $this->rateLimiter->canSendEmail(
            $user->email,
            'email_verification',
            $user->id
        );

        if (!$rateLimitCheck['allowed']) {
            throw ValidationException::withMessages([
                'email' => [$rateLimitCheck['message']],
            ]);
        }

        // Send verification email
        $user->sendEmailVerificationNotification();

        // Log the email send
        $this->rateLimiter->logEmail($user->email, 'email_verification', $user->id);
    }
}
