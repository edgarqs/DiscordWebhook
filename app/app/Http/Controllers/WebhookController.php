<?php

namespace App\Http\Controllers;

use App\Models\Webhook;
use App\Models\MessageHistory;
use App\Services\DiscordWebhookService;
use App\Services\DiscordMessageService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WebhookController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $user = auth()->user();
        
        // Webhooks propios
        $ownedWebhooks = $user->webhooks()
            ->with('messageHistory')
            ->withCount('messageHistory')
            ->latest()
            ->get()
            ->map(function ($webhook) {
                $webhook->is_owner = true;
                $webhook->permission_level = 'owner';
                return $webhook;
            });
        
        // Webhooks compartidos (como colaborador)
        $sharedWebhooks = $user->collaboratedWebhooks()
            ->with(['messageHistory', 'owner:id,name,email'])
            ->withCount('messageHistory')
            ->latest()
            ->get()
            ->map(function ($webhook) {
                $webhook->is_owner = false;
                $webhook->permission_level = $webhook->pivot->permission_level;
                return $webhook;
            });
        
        $webhooks = $ownedWebhooks->merge($sharedWebhooks);

        return Inertia::render('webhooks/index', [
            'webhooks' => $webhooks,
        ]);
    }


    public function create()
    {
        return Inertia::render('webhooks/create');
    }

    public function store(Request $request, DiscordWebhookService $discordService)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'webhook_url' => 'required|url|starts_with:https://discord.com/api/webhooks/',
            'avatar_url' => 'nullable|url',
            'description' => 'nullable|string|max:1000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        // Validate webhook with Discord API
        $discordData = $discordService->validateWebhook($validated['webhook_url']);
        
        if (!$discordData) {
            return back()->withErrors([
                'webhook_url' => 'Invalid Discord webhook URL or webhook no longer exists.'
            ])->withInput();
        }

        // Auto-fill name and avatar if not provided
        if (empty($validated['name'])) {
            $validated['name'] = $discordData['name'] ?? 'Unnamed Webhook';
        }
        
        if (empty($validated['avatar_url']) && !empty($discordData['avatar_url'])) {
            $validated['avatar_url'] = $discordData['avatar_url'];
        }

        // Add Discord metadata
        $validated['guild_id'] = $discordData['guild_id'];
        $validated['channel_id'] = $discordData['channel_id'];

        // Create the webhook
        $webhook = auth()->user()->webhooks()->create($validated);

        return redirect()->route('webhooks.index')
            ->with('success', 'Webhook created successfully!');
    }

    public function show(Webhook $webhook)
    {
        $this->authorize('view', $webhook);

        $webhook->load(['messageHistory' => function ($query) {
            $query->latest()->limit(10);
        }]);

        $webhook->permission_level = $webhook->getUserPermissionLevel();
        $webhook->is_owner = $webhook->isOwnedBy();

        return Inertia::render('webhooks/show', [
            'webhook' => $webhook,
        ]);
    }

    public function edit(Webhook $webhook)
    {
        $this->authorize('update', $webhook);

        $webhook->permission_level = $webhook->getUserPermissionLevel();
        $webhook->is_owner = $webhook->isOwnedBy();

        return Inertia::render('webhooks/edit', [
            'webhook' => $webhook,
        ]);
    }

    public function update(Request $request, Webhook $webhook, DiscordWebhookService $discordService)
    {
        $this->authorize('update', $webhook);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'webhook_url' => 'required|url|starts_with:https://discord.com/api/webhooks/',
            'avatar_url' => 'nullable|url',
            'description' => 'nullable|string|max:1000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        // If webhook URL changed, validate with Discord API
        if ($validated['webhook_url'] !== $webhook->webhook_url) {
            $discordData = $discordService->validateWebhook($validated['webhook_url']);
            
            if (!$discordData) {
                return back()->withErrors([
                    'webhook_url' => 'Invalid Discord webhook URL or webhook no longer exists.'
                ])->withInput();
            }

            // Auto-fill name and avatar if not provided
            if (empty($validated['name'])) {
                $validated['name'] = $discordData['name'] ?? 'Unnamed Webhook';
            }
            
            if (empty($validated['avatar_url']) && !empty($discordData['avatar_url'])) {
                $validated['avatar_url'] = $discordData['avatar_url'];
            }

            // Update Discord metadata
            $validated['guild_id'] = $discordData['guild_id'];
            $validated['channel_id'] = $discordData['channel_id'];
        }

        $webhook->update($validated);

        return redirect()->route('webhooks.index')
            ->with('success', 'Webhook updated successfully!');
    }

    public function destroy(Webhook $webhook)
    {
        $this->authorize('delete', $webhook);

        $webhook->delete();

        return redirect()->route('webhooks.index')
            ->with('success', 'Webhook deleted successfully!');
    }

    /**
     * Show the message send form
     */
    public function sendForm(Webhook $webhook)
    {
        $this->authorize('send', $webhook);

        $webhook->permission_level = $webhook->getUserPermissionLevel();
        $webhook->is_owner = $webhook->isOwnedBy();

        return Inertia::render('webhooks/send', [
            'webhook' => $webhook,
        ]);
    }

    /**
     * Send a message via webhook
     */
    public function send(Request $request, Webhook $webhook, DiscordMessageService $messageService)
    {
        $this->authorize('send', $webhook);

        $validated = $request->validate([
            'content' => 'nullable|string|max:2000',
            'embeds' => 'nullable|array|max:10',
            'embeds.*.title' => 'nullable|string|max:256',
            'embeds.*.description' => 'nullable|string|max:4096',
            'embeds.*.color' => 'nullable|integer',
            'embeds.*.url' => 'nullable|url',
            'embeds.*.timestamp' => 'nullable|date',
            'embeds.*.footer' => 'nullable|array',
            'embeds.*.footer.text' => 'nullable|string|max:2048',
            'embeds.*.footer.icon_url' => 'nullable|url',
            'embeds.*.image' => 'nullable|array',
            'embeds.*.image.url' => 'nullable|url',
            'embeds.*.thumbnail' => 'nullable|array',
            'embeds.*.thumbnail.url' => 'nullable|url',
            'embeds.*.author' => 'nullable|array',
            'embeds.*.author.name' => 'nullable|string|max:256',
            'embeds.*.author.url' => 'nullable|url',
            'embeds.*.author.icon_url' => 'nullable|url',
            'embeds.*.fields' => 'nullable|array|max:25',
            'embeds.*.fields.*.name' => 'required|string|max:256',
            'embeds.*.fields.*.value' => 'required|string|max:1024',
            'embeds.*.fields.*.inline' => 'nullable|boolean',
            'files' => 'nullable|array|max:10',
            'files.*' => 'file|mimes:jpg,jpeg,png,gif,webp,mp4,mov,avi|max:10240', // 10MB max
        ]);

        // Build message payload for Discord API
        $messageData = [
            'content' => $validated['content'] ?? null,
            'embeds' => $validated['embeds'] ?? [],
        ];

        // Handle file attachments
        $filePaths = [];
        if ($request->hasFile('files')) {
            $tempDir = storage_path('app' . DIRECTORY_SEPARATOR . 'temp');
            
            // Ensure temp directory exists
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }
            
            foreach ($request->file('files') as $index => $file) {
                try {
                    // Generate unique filename
                    $filename = uniqid() . '_' . $file->getClientOriginalName();
                    $destination = $tempDir . DIRECTORY_SEPARATOR . $filename;
                    
                    // Move uploaded file
                    $file->move($tempDir, $filename);
                    
                    if (file_exists($destination)) {
                        $filePaths[] = $destination;
                    }
                } catch (\Exception $e) {
                    \Log::error('File upload error', [
                        'error' => $e->getMessage(),
                        'file' => $file->getClientOriginalName()
                    ]);
                }
            }
        }

        // Send message to Discord
        $result = $messageService->sendMessage($webhook->webhook_url, $messageData, $filePaths);

        // Clean up temporary files
        foreach ($filePaths as $filePath) {
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        if ($result['success']) {
            // Log message in history
            $webhook->messageHistory()->create([
                'user_id' => auth()->id(),
                'message_content' => $messageData,
                'sent_at' => now(),
                'status' => 'success',
                'response' => $result['response'] ?? null,
            ]);

            return redirect()->route('dashboard')
                ->with('success', '✅ Message sent successfully to Discord!');
        }

        // Store failed message in history
        $webhook->messageHistory()->create([
            'user_id' => auth()->id(),
            'message_content' => $messageData,
            'sent_at' => now(),
            'status' => 'failed',
            'response' => $result['response'] ?? null,
        ]);

        return back()
            ->with('error', '❌ Failed to send message: ' . $result['error'])
            ->withInput();
    }

    /**
     * Show message history for webhook
     */
    public function history(Webhook $webhook)
    {
        $this->authorize('view', $webhook);

        $messages = $webhook->messageHistory()
            ->with('user:id,name')
            ->latest('sent_at')
            ->paginate(20);

        return Inertia::render('webhooks/history', [
            'webhook' => $webhook,
            'messages' => $messages,
        ]);
    }

    /**
     * Show quick send page
     */
    public function quickSend()
    {
        $webhooks = auth()->user()->webhooks()->get();

        return Inertia::render('send', [
            'webhooks' => $webhooks,
        ]);
    }

    /**
     * Send message using temporary webhook URL
     */
    public function sendTemporary(Request $request, DiscordMessageService $messageService)
    {
        $validated = $request->validate([
            'temporary_webhook_url' => 'required|url|starts_with:https://discord.com/api/webhooks/',
            'temporary_name' => 'nullable|string|max:80',
            'temporary_avatar' => 'nullable|url',
            'content' => 'nullable|string|max:2000',
            'embeds' => 'nullable|array|max:10',
            'embeds.*.title' => 'nullable|string|max:256',
            'embeds.*.description' => 'nullable|string|max:4096',
            'embeds.*.color' => 'nullable|integer',
        ]);

        // Build message payload
        $messageData = [
            'content' => $validated['content'] ?? null,
            'embeds' => $validated['embeds'] ?? [],
        ];

        // Add custom name if provided
        if (!empty($validated['temporary_name'])) {
            $messageData['username'] = $validated['temporary_name'];
        }

        // Add custom avatar if provided
        if (!empty($validated['temporary_avatar'])) {
            $messageData['avatar_url'] = $validated['temporary_avatar'];
        }

        // Send message to Discord using temporary webhook
        $result = $messageService->sendMessage($validated['temporary_webhook_url'], $messageData);

        if ($result['success']) {
            return redirect()->route('dashboard')
                ->with('success', '✅ Message sent successfully using temporary webhook!');
        }

        return back()
            ->with('error', '❌ Failed to send message: ' . $result['error'])
            ->withInput();
    }

    /**
     * Validate webhook URL with Discord API
     */
    public function validateWebhook(Request $request, DiscordWebhookService $discordService)
    {
        $request->validate([
            'webhook_url' => 'required|url|starts_with:https://discord.com/api/webhooks/',
        ]);

        $discordData = $discordService->validateWebhook($request->webhook_url);

        if (!$discordData) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Discord webhook URL or webhook no longer exists.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'name' => $discordData['name'],
                'avatar_url' => $discordData['avatar_url'],
                'guild_id' => $discordData['guild_id'],
                'channel_id' => $discordData['channel_id'],
            ],
        ]);
    }
}
