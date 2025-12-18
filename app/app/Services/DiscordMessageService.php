<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DiscordMessageService
{
    /**
     * Send a message to Discord via webhook
     *
     * @param string $webhookUrl
     * @param array $messageData
     * @param array $files Optional array of file paths to attach
     * @return array ['success' => bool, 'response' => array|null, 'error' => string|null]
     */
    public function sendMessage(string $webhookUrl, array $messageData, array $files = []): array
    {
        try {
            // Validate message content before sending
            $validation = $this->validateMessageContent($messageData);
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'response' => null,
                    'error' => $validation['errors'][0] ?? 'Invalid message content',
                ];
            }

            // Format payload for Discord API
            $payload = $this->formatMessagePayload($messageData);

            // Send to Discord
            $http = Http::withoutVerifying()->timeout(10);

            // If files are present, use multipart/form-data
            if (!empty($files)) {
                $multipart = [
                    [
                        'name' => 'payload_json',
                        'contents' => json_encode($payload),
                    ]
                ];

                // Add files to multipart
                // Discord expects fields named 'file', 'file1', 'file2', etc.
                foreach ($files as $index => $file) {
                    if (file_exists($file)) {
                        $fieldName = $index === 0 ? 'file' : "file{$index}";
                        $multipart[] = [
                            'name' => $fieldName,
                            'contents' => fopen($file, 'r'),
                            'filename' => basename($file),
                        ];
                    }
                }

                $response = $http->asMultipart()->post($webhookUrl, $multipart);
            } else {
                // Regular JSON request
                $response = $http->post($webhookUrl, $payload);
            }

            if ($response->successful()) {
                return [
                    'success' => true,
                    'response' => $response->json(),
                    'error' => null,
                ];
            }

            // Handle Discord API errors
            $errorMessage = $this->parseDiscordError($response);
            
            Log::warning('Discord message send failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'response' => $response->json(),
                'error' => $errorMessage,
            ];

        } catch (\Exception $e) {
            Log::error('Discord message send exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'response' => null,
                'error' => 'Failed to send message: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Validate message content against Discord limits
     *
     * @param array $messageData
     * @return array ['valid' => bool, 'errors' => array]
     */
    public function validateMessageContent(array $messageData): array
    {
        $errors = [];

        // Content validation
        if (isset($messageData['content']) && strlen($messageData['content']) > 2000) {
            $errors[] = 'Message content cannot exceed 2000 characters';
        }

        // Embeds validation
        if (isset($messageData['embeds'])) {
            if (count($messageData['embeds']) > 10) {
                $errors[] = 'Cannot have more than 10 embeds';
            }

            foreach ($messageData['embeds'] as $index => $embed) {
                if (isset($embed['title']) && strlen($embed['title']) > 256) {
                    $errors[] = "Embed {$index}: Title cannot exceed 256 characters";
                }
                if (isset($embed['description']) && strlen($embed['description']) > 4096) {
                    $errors[] = "Embed {$index}: Description cannot exceed 4096 characters";
                }
                if (isset($embed['fields']) && count($embed['fields']) > 25) {
                    $errors[] = "Embed {$index}: Cannot have more than 25 fields";
                }
                if (isset($embed['footer']['text']) && strlen($embed['footer']['text']) > 2048) {
                    $errors[] = "Embed {$index}: Footer text cannot exceed 2048 characters";
                }
                if (isset($embed['author']['name']) && strlen($embed['author']['name']) > 256) {
                    $errors[] = "Embed {$index}: Author name cannot exceed 256 characters";
                }
            }
        }

        // Components (buttons) validation
        if (isset($messageData['components'])) {
            if (count($messageData['components']) > 5) {
                $errors[] = 'Cannot have more than 5 action rows';
            }

            foreach ($messageData['components'] as $rowIndex => $row) {
                if (isset($row['components']) && count($row['components']) > 5) {
                    $errors[] = "Row {$rowIndex}: Cannot have more than 5 buttons per row";
                }
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Format message data for Discord API
     *
     * @param array $messageData
     * @return array
     */
    private function formatMessagePayload(array $messageData): array
    {
        $payload = [];

        // Add content if present
        if (!empty($messageData['content'])) {
            $payload['content'] = $messageData['content'];
        }

        // Add embeds if present
        if (!empty($messageData['embeds'])) {
            $payload['embeds'] = $messageData['embeds'];
        }

        // Add username override if present
        if (!empty($messageData['username'])) {
            $payload['username'] = $messageData['username'];
        }

        // Add avatar URL override if present
        if (!empty($messageData['avatar_url'])) {
            $payload['avatar_url'] = $messageData['avatar_url'];
        }

        return $payload;
    }

    /**
     * Parse Discord API error response
     *
     * @param \Illuminate\Http\Client\Response $response
     * @return string
     */
    private function parseDiscordError($response): string
    {
        $status = $response->status();
        $body = $response->json();

        return match ($status) {
            400 => 'Invalid message format: ' . ($body['message'] ?? 'Bad request'),
            401 => 'Invalid webhook URL or unauthorized',
            404 => 'Webhook not found or has been deleted',
            429 => 'Rate limited. Please try again later',
            500, 502, 503 => 'Discord server error. Please try again later',
            default => 'Failed to send message (HTTP ' . $status . ')',
        };
    }
}
