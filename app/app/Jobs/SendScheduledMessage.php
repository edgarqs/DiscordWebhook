<?php

namespace App\Jobs;

use App\Models\ScheduledMessage;
use App\Services\DiscordMessageService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SendScheduledMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

    public function __construct(
        public ScheduledMessage $scheduledMessage
    ) {}

    public function handle(DiscordMessageService $messageService): void
    {
        if (!$this->scheduledMessage->canSend()) {
            Log::info('Scheduled message cannot be sent', [
                'id' => $this->scheduledMessage->id,
                'status' => $this->scheduledMessage->status,
            ]);
            return;
        }

        $this->scheduledMessage->update(['status' => 'processing']);

        try {
            $webhook = $this->scheduledMessage->webhook;
            
            if (!$webhook) {
                throw new \Exception('Webhook not found');
            }

            // Get message content
            $messageData = $this->scheduledMessage->message_content;

            // Clean up empty embeds
            if (isset($messageData['embeds']) && is_array($messageData['embeds'])) {
                $messageData['embeds'] = array_filter($messageData['embeds'], function($embed) {
                    return !empty($embed['title']) || 
                           !empty($embed['description']) || 
                           !empty($embed['url']) ||
                           !empty($embed['author']['name']) ||
                           !empty($embed['footer']['text']) ||
                           !empty($embed['image']['url']) ||
                           !empty($embed['thumbnail']['url']) ||
                           (!empty($embed['fields']) && count($embed['fields']) > 0);
                });
                
                $messageData['embeds'] = array_values($messageData['embeds']);
                
                if (empty($messageData['embeds'])) {
                    unset($messageData['embeds']);
                }
            }

            // Ensure at least content or embeds exist
            if (empty($messageData['content']) && empty($messageData['embeds'])) {
                throw new \Exception('Message has no content or embeds');
            }

            // Get file paths
            $filePaths = [];
            foreach ($this->scheduledMessage->files as $file) {
                if (Storage::exists($file->stored_path)) {
                    $filePaths[] = Storage::path($file->stored_path);
                }
            }

            // Send the message
            $result = $messageService->sendMessage(
                $webhook->webhook_url,
                $messageData,
                $filePaths
            );

            if ($result['success']) {
                $this->scheduledMessage->markAsSent();
                
                // Delete files after sending (for both one-time and recurring)
                // Files will be deleted after EVERY send
                foreach ($this->scheduledMessage->files as $file) {
                    $file->delete(); // This triggers the observer to delete the physical file
                }
                
                Log::info('Scheduled message sent successfully', [
                    'id' => $this->scheduledMessage->id,
                    'webhook_id' => $webhook->id,
                    'send_count' => $this->scheduledMessage->send_count,
                ]);
            } else {
                throw new \Exception($result['error'] ?? 'Unknown error');
            }
        } catch (\Exception $e) {
            Log::error('Failed to send scheduled message', [
                'id' => $this->scheduledMessage->id,
                'error' => $e->getMessage(),
            ]);

            $this->scheduledMessage->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Scheduled message job failed permanently', [
            'id' => $this->scheduledMessage->id,
            'error' => $exception->getMessage(),
        ]);

        $this->scheduledMessage->markAsFailed(
            'Job failed after ' . $this->tries . ' attempts: ' . $exception->getMessage()
        );
    }
}
