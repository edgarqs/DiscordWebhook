<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        $totalWebhooks = $user->webhooks()->count();
        $activeWebhooks = $totalWebhooks; // All webhooks are active
        $totalMessages = \App\Models\MessageHistory::whereIn('webhook_id', $user->webhooks()->pluck('id'))->count();
        $recentWebhooks = $user->webhooks()->latest()->limit(5)->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalWebhooks' => $totalWebhooks,
                'activeWebhooks' => $activeWebhooks,
                'totalMessages' => $totalMessages,
            ],
            'recentWebhooks' => $recentWebhooks,
        ]);
    })->name('dashboard');

    // Webhook routes
    Route::post('webhooks/validate', [\App\Http\Controllers\WebhookController::class, 'validateWebhook'])->name('webhooks.validate');
    Route::get('webhooks/{webhook}/send', [\App\Http\Controllers\WebhookController::class, 'sendForm'])->name('webhooks.send');
    Route::post('webhooks/{webhook}/send', [\App\Http\Controllers\WebhookController::class, 'send'])->name('webhooks.send.post');
    Route::get('webhooks/{webhook}/history', [\App\Http\Controllers\WebhookController::class, 'history'])->name('webhooks.history');
    Route::resource('webhooks', \App\Http\Controllers\WebhookController::class);
    
    // Quick send routes
    Route::get('send', [\App\Http\Controllers\WebhookController::class, 'quickSend'])->name('send');
    Route::post('send/temporary', [\App\Http\Controllers\WebhookController::class, 'sendTemporary'])->name('send.temporary');

    // Webhook collaborator routes
    Route::get('webhooks/{webhook}/collaborators', [\App\Http\Controllers\CollaboratorController::class, 'index'])
        ->name('webhooks.collaborators.index');
    Route::post('webhooks/{webhook}/collaborators', [\App\Http\Controllers\CollaboratorController::class, 'store'])
        ->name('webhooks.collaborators.store');
    Route::patch('webhooks/{webhook}/collaborators/{collaborator}', [\App\Http\Controllers\CollaboratorController::class, 'update'])
        ->name('webhooks.collaborators.update');
    Route::delete('webhooks/{webhook}/collaborators/{collaborator}', [\App\Http\Controllers\CollaboratorController::class, 'destroy'])
        ->name('webhooks.collaborators.destroy');
    
    // Leave webhook (for collaborators)
    Route::post('webhooks/{webhook}/leave', [\App\Http\Controllers\CollaboratorController::class, 'leave'])
        ->name('webhooks.leave');


    // Invitation routes
    Route::get('invitations', [\App\Http\Controllers\InvitationController::class, 'index'])
        ->name('invitations.index');
    Route::get('invitations/{token}', [\App\Http\Controllers\InvitationController::class, 'show'])
        ->name('invitations.show');
    Route::post('invitations/{token}/accept', [\App\Http\Controllers\InvitationController::class, 'accept'])
        ->name('invitations.accept');
    Route::post('invitations/{token}/decline', [\App\Http\Controllers\InvitationController::class, 'decline'])
        ->name('invitations.decline');
    Route::delete('invitations/{invitation}', [\App\Http\Controllers\InvitationController::class, 'cancel'])
        ->name('invitations.cancel');

    // Template routes
    Route::resource('templates', \App\Http\Controllers\TemplateController::class);
    Route::post('templates/{template}/duplicate', [\App\Http\Controllers\TemplateController::class, 'duplicate'])
        ->name('templates.duplicate');
    
    // Scheduled messages routes
    Route::post('scheduled/{scheduled}/pause', [\App\Http\Controllers\ScheduledMessageController::class, 'pause'])
        ->name('scheduled.pause');
    Route::post('scheduled/{scheduled}/resume', [\App\Http\Controllers\ScheduledMessageController::class, 'resume'])
        ->name('scheduled.resume');
    Route::resource('scheduled', \App\Http\Controllers\ScheduledMessageController::class);
    
    // Template collaborators
    Route::prefix('templates/{template}/collaborators')->group(function () {
        Route::get('/', [\App\Http\Controllers\TemplateCollaboratorController::class, 'index'])
            ->name('templates.collaborators.index');
        Route::post('/', [\App\Http\Controllers\TemplateCollaboratorController::class, 'store'])
            ->name('templates.collaborators.store');
        Route::put('/{user}', [\App\Http\Controllers\TemplateCollaboratorController::class, 'update'])
            ->name('templates.collaborators.update');
        Route::delete('/{user}', [\App\Http\Controllers\TemplateCollaboratorController::class, 'destroy'])
            ->name('templates.collaborators.destroy');
    });
    
    // Leave template (for collaborators)
    Route::post('templates/{template}/leave', [\App\Http\Controllers\TemplateCollaboratorController::class, 'leave'])
        ->name('templates.leave');

    // Admin routes
    Route::middleware(['admin', 'password.confirm'])->group(function () {
        Route::get('admin', function () {
            $totalUsers = \App\Models\User::count();
            $adminUsers = \App\Models\User::where('role', 'admin')->count();
            $totalWebhooks = \App\Models\Webhook::count();
            $totalMessages = \App\Models\MessageHistory::count();
            $recentUsers = \App\Models\User::latest()->limit(10)->get();

            return Inertia::render('admin/index', [
                'stats' => [
                    'totalUsers' => $totalUsers,
                    'adminUsers' => $adminUsers,
                    'totalWebhooks' => $totalWebhooks,
                    'totalMessages' => $totalMessages,
                ],
                'recentUsers' => $recentUsers,
            ]);
        })->name('admin');

        Route::post('admin/settings', function (\Illuminate\Http\Request $request) {
            $request->validate([
                'registration_enabled' => 'required|boolean',
                'password_reset_enabled' => 'required|boolean',
            ]);

            \App\Models\Setting::set('registration_enabled', $request->registration_enabled, 'boolean');
            \App\Models\Setting::set('password_reset_enabled', $request->password_reset_enabled, 'boolean');

            return redirect()->back()->with('success', 'Settings updated successfully.');
        })->name('admin.settings.update');

        Route::delete('admin/users/{user}', function (\App\Models\User $user) {
            if ($user->id === auth()->id()) {
                return redirect()->back()->with('error', 'You cannot delete your own account.');
            }

            if ($user->role === 'admin') {
                return redirect()->back()->with('error', 'You cannot delete another admin account.');
            }

            $user->delete();

            return redirect()->back()->with('success', 'User deleted successfully.');
        })->name('admin.users.destroy');
    });
});

require __DIR__.'/settings.php';
