<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'pendingInvitationsCount' => $request->user() 
                    ? \App\Models\Invitation::where('invitee_email', $request->user()->email)
                        ->where('status', 'pending')
                        ->where('expires_at', '>', now())
                        ->count()
                    : 0,
            ],
            'settings' => [
                'registration_enabled' => \App\Models\Setting::isRegistrationEnabled(),
                'password_reset_enabled' => \App\Models\Setting::isPasswordResetEnabled(),
                'ai_provider' => \App\Models\Setting::get('ai_provider', 'openai'),
                'openai_api_key' => $request->user()?->isAdmin() ? \App\Models\Setting::get('openai_api_key', '') : null,
                'gemini_api_key' => $request->user()?->isAdmin() ? \App\Models\Setting::get('gemini_api_key', '') : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
