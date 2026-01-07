<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiUsage extends Model
{
    protected $fillable = ['user_id'];

    /**
     * Get the user that owns the AI usage.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
