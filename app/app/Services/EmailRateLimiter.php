<?php

namespace App\Services;

use App\Models\EmailLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Request;

class EmailRateLimiter
{
    // Cooldown period in seconds (60 seconds = 1 minute)
    private const COOLDOWN_SECONDS = 60;
    
    // Maximum emails per hour
    private const MAX_EMAILS_PER_HOUR = 3;

    /**
     * Check if the user/email can send an email
     * 
     * @param string $email
     * @param string $type
     * @param int|null $userId
     * @return array ['allowed' => bool, 'message' => string, 'wait_seconds' => int|null]
     */
    public function canSendEmail(string $email, string $type, ?int $userId = null): array
    {
        // Check cooldown period
        $cooldownCheck = $this->checkCooldown($email, $userId);
        if (!$cooldownCheck['allowed']) {
            return $cooldownCheck;
        }

        // Check hourly limit
        $hourlyCheck = $this->checkHourlyLimit($email, $userId);
        if (!$hourlyCheck['allowed']) {
            return $hourlyCheck;
        }

        return [
            'allowed' => true,
            'message' => 'Email can be sent',
            'wait_seconds' => null,
        ];
    }

    /**
     * Log an email send
     * 
     * @param string $email
     * @param string $type
     * @param int|null $userId
     * @return EmailLog
     */
    public function logEmail(string $email, string $type, ?int $userId = null): EmailLog
    {
        return EmailLog::create([
            'user_id' => $userId,
            'email' => $email,
            'type' => $type,
            'sent_at' => now(),
            'ip_address' => Request::ip(),
        ]);
    }

    /**
     * Check if cooldown period has passed
     * 
     * @param string $email
     * @param int|null $userId
     * @return array
     */
    private function checkCooldown(string $email, ?int $userId): array
    {
        $query = EmailLog::where('email', $email)
            ->where('sent_at', '>=', Carbon::now()->subSeconds(self::COOLDOWN_SECONDS));

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $lastEmail = $query->orderBy('sent_at', 'desc')->first();

        if ($lastEmail) {
            $waitSeconds = self::COOLDOWN_SECONDS - Carbon::now()->diffInSeconds($lastEmail->sent_at);
            
            return [
                'allowed' => false,
                'message' => "Please wait {$waitSeconds} seconds before requesting another email.",
                'wait_seconds' => $waitSeconds,
            ];
        }

        return ['allowed' => true];
    }

    /**
     * Check if hourly limit has been reached
     * 
     * @param string $email
     * @param int|null $userId
     * @return array
     */
    private function checkHourlyLimit(string $email, ?int $userId): array
    {
        $query = EmailLog::where('email', $email)
            ->where('sent_at', '>=', Carbon::now()->subHour());

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $emailCount = $query->count();

        if ($emailCount >= self::MAX_EMAILS_PER_HOUR) {
            // Find when the oldest email in the last hour was sent
            $oldestEmail = $query->orderBy('sent_at', 'asc')->first();
            $minutesUntilReset = 60 - Carbon::now()->diffInMinutes($oldestEmail->sent_at);
            
            return [
                'allowed' => false,
                'message' => "You've reached the maximum number of emails ({self::MAX_EMAILS_PER_HOUR} per hour). Please try again in {$minutesUntilReset} minutes.",
                'wait_seconds' => $minutesUntilReset * 60,
            ];
        }

        return ['allowed' => true];
    }

    /**
     * Clean up old email logs (older than 7 days)
     * This can be called from a scheduled task
     * 
     * @return int Number of deleted records
     */
    public function cleanupOldLogs(): int
    {
        return EmailLog::where('sent_at', '<', Carbon::now()->subDays(7))->delete();
    }
}
