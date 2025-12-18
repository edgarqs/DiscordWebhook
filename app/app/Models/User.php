<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is a regular user
     */
    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    // Webhook relationships
    public function webhooks()
    {
        return $this->hasMany(\App\Models\Webhook::class);
    }

    public function collaboratedWebhooks()
    {
        return $this->belongsToMany(\App\Models\Webhook::class, 'webhook_collaborators')
            ->withPivot('permission_level', 'invited_at', 'accepted_at')
            ->withTimestamps();
    }

    public function sentMessages()
    {
        return $this->hasMany(\App\Models\MessageHistory::class);
    }

    public function templates()
    {
        return $this->hasMany(\App\Models\Template::class);
    }

    public function collaboratedTemplates()
    {
        return $this->belongsToMany(\App\Models\Template::class, 'template_collaborators')
            ->withPivot('permission_level')
            ->withTimestamps();
    }
}
