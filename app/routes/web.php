<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        $totalWebhooks = $user->webhooks()->count();
        $activeWebhooks = $user->webhooks()->where('is_active', true)->count();
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
});

require __DIR__.'/settings.php';
