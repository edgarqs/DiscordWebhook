<?php

namespace App\Http\Controllers;

use App\Models\Webhook;
use App\Models\WebhookCollaborator;
use App\Models\User;
use App\Models\Invitation;
use App\Notifications\WebhookInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class CollaboratorController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display collaborators for a webhook.
     */
    public function index(Webhook $webhook)
    {
        $this->authorize('manageCollaborators', $webhook);

        $collaborators = $webhook->collaborators()
            ->with('user:id,name,email')
            ->get();

        $pendingInvitations = $webhook->invitations()
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->get();

        return Inertia::render('webhooks/collaborators', [
            'webhook' => $webhook->load('owner:id,name,email'),
            'collaborators' => $collaborators,
            'pendingInvitations' => $pendingInvitations,
        ]);
    }

    /**
     * Invite a new collaborator.
     */
    public function store(Request $request, Webhook $webhook)
    {
        $this->authorize('manageCollaborators', $webhook);

        $validated = $request->validate([
            'email' => 'required|email',
            'permission_level' => 'required|in:admin,editor,viewer',
        ]);

        // Check if user exists
        $invitee = User::where('email', $validated['email'])->first();

        if (!$invitee) {
            return back()->withErrors([
                'email' => 'No user found with this email address.',
            ]);
        }

        // Check if user is the owner
        if ($invitee->id === $webhook->user_id) {
            return back()->withErrors([
                'email' => 'You cannot invite yourself as a collaborator.',
            ]);
        }

        // Check if already a collaborator
        $existingCollaborator = $webhook->collaborators()
            ->where('user_id', $invitee->id)
            ->first();

        if ($existingCollaborator) {
            return back()->withErrors([
                'email' => 'This user is already a collaborator.',
            ]);
        }

        // Check if there's a pending invitation
        $existingInvitation = $webhook->invitations()
            ->where('invitee_email', $validated['email'])
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if ($existingInvitation) {
            return back()->withErrors([
                'email' => 'There is already a pending invitation for this user.',
            ]);
        }

        // Create invitation
        $invitation = $webhook->invitations()->create([
            'inviter_id' => auth()->id(),
            'invitee_email' => $validated['email'],
            'permission_level' => $validated['permission_level'],
            'token' => Str::random(32),
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        // Send email notification
        $invitee->notify(new WebhookInvitationNotification($invitation));

        return back()->with('success', 'Invitation sent successfully!');
    }

    /**
     * Update collaborator permission level.
     */
    public function update(Request $request, Webhook $webhook, WebhookCollaborator $collaborator)
    {
        $this->authorize('manageCollaborators', $webhook);

        // Ensure the collaborator belongs to this webhook
        if ($collaborator->webhook_id !== $webhook->id) {
            abort(404);
        }

        $validated = $request->validate([
            'permission_level' => 'required|in:admin,editor,viewer',
        ]);

        $collaborator->update($validated);

        return back()->with('success', 'Permission level updated successfully!');
    }


    /**
     * Remove a collaborator.
     */
    public function destroy(Webhook $webhook, WebhookCollaborator $collaborator)
    {
        $this->authorize('manageCollaborators', $webhook);

        // Ensure the collaborator belongs to this webhook
        if ($collaborator->webhook_id !== $webhook->id) {
            abort(404);
        }

        $collaborator->delete();

        return back()->with('success', 'Collaborator removed successfully!');
    }

    /**
     * Leave a webhook (remove yourself as collaborator)
     */
    public function leave(Webhook $webhook)
    {
        $user = auth()->user();

        // Check if user is a collaborator
        $collaborator = $webhook->collaborators()
            ->where('user_id', $user->id)
            ->first();

        if (!$collaborator) {
            return back()->withErrors(['error' => 'You are not a collaborator of this webhook.']);
        }

        // Prevent owner from leaving
        if ($webhook->user_id === $user->id) {
            return back()->withErrors(['error' => 'Webhook owner cannot leave.']);
        }

        $collaborator->delete();

        return redirect()->route('webhooks.index')
            ->with('success', 'You have left the webhook successfully!');
    }
}
