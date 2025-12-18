<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DiscordWebhookService
{
    /**
     * Validate and fetch webhook information from Discord API
     *
     * @param string $webhookUrl
     * @return array|null Returns webhook data or null if invalid
     */
    public function validateWebhook(string $webhookUrl): ?array
    {
        try {
            // Extract webhook ID and token from URL
            // Format: https://discord.com/api/webhooks/{webhook_id}/{webhook_token}
            // Also supports: https://discordapp.com/api/webhooks/{webhook_id}/{webhook_token}
            if (!preg_match('#https://(discord|discordapp)\.com/api/webhooks/(\d+)/([a-zA-Z0-9_-]+)#', $webhookUrl, $matches)) {
                return null;
            }

            $webhookId = $matches[2];
            $webhookToken = $matches[3];

            // Make GET request to Discord API
            // Disable SSL verification for development (Windows certificate issues)
            $response = Http::withoutVerifying()
                ->timeout(10)
                ->get("https://discord.com/api/webhooks/{$webhookId}/{$webhookToken}");

            if (!$response->successful()) {
                Log::warning('Discord webhook validation failed', [
                    'url' => $webhookUrl,
                    'status' => $response->status(),
                ]);
                return null;
            }

            $data = $response->json();

            // Return formatted webhook data
            return [
                'id' => $data['id'] ?? null,
                'name' => $data['name'] ?? null,
                'avatar' => $data['avatar'] ?? null,
                'avatar_url' => $this->getAvatarUrl($data['id'] ?? null, $data['avatar'] ?? null),
                'channel_id' => $data['channel_id'] ?? null,
                'guild_id' => $data['guild_id'] ?? null,
                'token' => $data['token'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Discord webhook validation error', [
                'url' => $webhookUrl,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get the full avatar URL for a webhook
     *
     * @param string|null $webhookId
     * @param string|null $avatarHash
     * @return string|null
     */
    private function getAvatarUrl(?string $webhookId, ?string $avatarHash): ?string
    {
        if (!$webhookId || !$avatarHash) {
            return null;
        }

        // Use webhook avatars endpoint, not user avatars
        return "https://cdn.discordapp.com/avatars/{$webhookId}/{$avatarHash}.png";
    }
}
