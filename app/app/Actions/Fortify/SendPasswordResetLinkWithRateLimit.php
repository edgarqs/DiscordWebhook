<?php

namespace App\Actions\Fortify;

use App\Services\EmailRateLimiter;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\PasswordResetLinkRequestedResponse;

class SendPasswordResetLinkWithRateLimit
{
    protected EmailRateLimiter $rateLimiter;

    public function __construct(EmailRateLimiter $rateLimiter)
    {
        $this->rateLimiter = $rateLimiter;
    }

    public function __invoke(array $credentials): PasswordResetLinkRequestedResponse
    {
        $email = $credentials['email'];
        
        // Check rate limit
        $rateLimitCheck = $this->rateLimiter->canSendEmail($email, 'password_reset');
        
        if (!$rateLimitCheck['allowed']) {
            throw ValidationException::withMessages([
                'email' => [$rateLimitCheck['message']],
            ]);
        }

        // Send password reset link
        $status = Password::sendResetLink($credentials);

        if ($status == Password::RESET_LINK_SENT) {
            // Log the email send
            $this->rateLimiter->logEmail($email, 'password_reset');
            
            return app(PasswordResetLinkRequestedResponse::class, ['status' => $status]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}
