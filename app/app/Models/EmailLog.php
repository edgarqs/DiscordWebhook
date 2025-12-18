<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailLog extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'type',
        'sent_at',
        'ip_address',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    /**
     * Get the user that owns the email log
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
