<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
