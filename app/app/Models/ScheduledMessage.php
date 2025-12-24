<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class ScheduledMessage extends Model
{
    protected $fillable = [
        'user_id',
        'webhook_id',
        'template_id',
        'message_content',
        'schedule_type',
        'scheduled_at',
        'recurrence_pattern',
        'timezone',
        'next_send_at',
        'send_count',
        'max_sends',
        'status',
        'error_message',
    ];

    protected $casts = [
        'message_content' => 'array',
        'recurrence_pattern' => 'array',
        'scheduled_at' => 'datetime',
        'next_send_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function webhook(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Webhook::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Template::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(ScheduledMessageFile::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeReadyToSend($query)
    {
        return $query->where('status', 'pending')
            ->where('next_send_at', '<=', now());
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'processing']);
    }

    // Helper Methods
    public function canSend(): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        if ($this->schedule_type === 'recurring' && $this->max_sends) {
            return $this->send_count < $this->max_sends;
        }

        return true;
    }

    public function calculateNextSendTime(): ?Carbon
    {
        if ($this->schedule_type === 'once') {
            return null;
        }

        $pattern = $this->recurrence_pattern;
        $timezone = $this->timezone ?? 'UTC';
        $now = Carbon::now($timezone);

        $time = $pattern['time'] ?? '12:00';
        [$hour, $minute] = explode(':', $time);

        switch ($pattern['frequency']) {
            case 'daily':
                $next = $now->copy()->setTime((int)$hour, (int)$minute, 0);
                if ($next <= $now) {
                    $next->addDay();
                }
                break;

            case 'weekly':
                $days = $pattern['days'] ?? [];
                if (empty($days)) {
                    return null;
                }

                $next = $now->copy()->setTime((int)$hour, (int)$minute, 0);
                $found = false;

                for ($i = 0; $i < 7; $i++) {
                    if (in_array($next->dayOfWeek, $days) && $next > $now) {
                        $found = true;
                        break;
                    }
                    $next->addDay();
                }

                if (!$found) {
                    return null;
                }
                break;

            case 'monthly':
                $day = $pattern['day'] ?? 1;
                $next = $now->copy()->setTime((int)$hour, (int)$minute, 0)->day($day);
                if ($next <= $now) {
                    $next->addMonth();
                }
                break;

            default:
                return null;
        }

        return $next->setTimezone('UTC');
    }

    public function markAsSent(): void
    {
        $this->increment('send_count');

        if ($this->schedule_type === 'once') {
            $this->update([
                'status' => 'completed',
                'next_send_at' => null,
            ]);
        } else {
            $nextSendTime = $this->calculateNextSendTime();

            if (!$nextSendTime || ($this->max_sends && $this->send_count >= $this->max_sends)) {
                $this->update([
                    'status' => 'completed',
                    'next_send_at' => null,
                ]);
            } else {
                $this->update([
                    'status' => 'pending',
                    'next_send_at' => $nextSendTime,
                ]);
            }
        }
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
        ]);
    }

    public function pause(): void
    {
        if ($this->schedule_type === 'recurring' && $this->status === 'pending') {
            $this->update(['status' => 'paused']);
        }
    }

    public function resume(): void
    {
        if ($this->status === 'paused') {
            $nextSendTime = $this->calculateNextSendTime();
            $this->update([
                'status' => 'pending',
                'next_send_at' => $nextSendTime,
            ]);
        }
    }
}
