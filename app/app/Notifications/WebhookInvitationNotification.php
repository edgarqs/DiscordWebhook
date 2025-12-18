<?php

namespace App\Notifications;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WebhookInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Invitation $invitation
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $dashboardUrl = url('/invitations');
        $webhookName = $this->invitation->webhook->name;
        $inviterName = $this->invitation->inviter->name;
        $permissionLevel = ucfirst($this->invitation->permission_level);

        return (new MailMessage)
            ->subject("New Webhook Collaboration Invitation")
            ->greeting("Hello!")
            ->line("{$inviterName} has invited you to collaborate on the webhook \"{$webhookName}\" as {$permissionLevel}.")
            ->line("You have a new invitation waiting for you in your dashboard.")
            ->action('View Your Invitations', $dashboardUrl)
            ->line('You can accept or decline this invitation from your dashboard.')
            ->line('If you did not expect this invitation, you can safely ignore this email.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'invitation_id' => $this->invitation->id,
            'webhook_id' => $this->invitation->webhook_id,
            'webhook_name' => $this->invitation->webhook->name,
            'inviter_name' => $this->invitation->inviter->name,
            'permission_level' => $this->invitation->permission_level,
        ];
    }

    /**
     * Get permission level description.
     */
    private function getPermissionDescription(string $level): string
    {
        return match($level) {
            'admin' => 'As an Admin, you can manage collaborators, edit the webhook, and send messages.',
            'editor' => 'As an Editor, you can edit the webhook and send messages.',
            'viewer' => 'As a Viewer, you can view the webhook and its message history.',
            default => '',
        };
    }
}
