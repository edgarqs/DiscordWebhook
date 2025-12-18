<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\WebhookCollaborator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvitationController extends Controller
{
    /**
     * Display pending invitations for the current user.
     */
    public function index()
    {
        $invitations = Invitation::where('invitee_email', auth()->user()->email)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->with(['webhook:id,name,description', 'inviter:id,name'])
            ->latest()
            ->get();

        return Inertia::render('invitations/index', [
            'invitations' => $invitations,
        ]);
    }

    /**
     * Show invitation details.
     */
    public function show($token)
    {
        $invitation = Invitation::where('token', $token)
            ->with(['webhook:id,name,description,user_id', 'inviter:id,name'])
            ->firstOrFail();

        // Check if invitation is for current user
        if ($invitation->invitee_email !== auth()->user()->email) {
            abort(403, 'This invitation is not for you.');
        }

        // Check if invitation is still valid
        if ($invitation->status !== 'pending') {
            return redirect()->route('invitations.index')
                ->with('error', 'This invitation has already been ' . $invitation->status . '.');
        }

        if ($invitation->isExpired()) {
            return redirect()->route('invitations.index')
                ->with('error', 'This invitation has expired.');
        }

        return Inertia::render('invitations/show', [
            'invitation' => $invitation,
        ]);
    }

    /**
     * Accept an invitation.
     */
    public function accept($token)
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();

        // Check if invitation is for current user
        if ($invitation->invitee_email !== auth()->user()->email) {
            abort(403, 'This invitation is not for you.');
        }

        // Check if invitation is still valid
        if ($invitation->status !== 'pending') {
            return back()->with('error', 'This invitation has already been ' . $invitation->status . '.');
        }

        if ($invitation->isExpired()) {
            return back()->with('error', 'This invitation has expired.');
        }

        // Check if user is already a collaborator
        $existingCollaborator = WebhookCollaborator::where('webhook_id', $invitation->webhook_id)
            ->where('user_id', auth()->id())
            ->first();

        if ($existingCollaborator) {
            $invitation->update(['status' => 'accepted']);
            return redirect()->route('webhooks.index')
                ->with('info', 'You are already a collaborator on this webhook.');
        }

        // Create collaborator
        WebhookCollaborator::create([
            'webhook_id' => $invitation->webhook_id,
            'user_id' => auth()->id(),
            'permission_level' => $invitation->permission_level,
            'invited_by' => $invitation->inviter_id,
            'invited_at' => now(),
            'accepted_at' => now(),
        ]);

        // Update invitation status
        $invitation->update(['status' => 'accepted']);

        return redirect()->route('webhooks.index')
            ->with('success', 'Invitation accepted! You can now access the webhook.');
    }

    /**
     * Decline an invitation.
     */
    public function decline($token)
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();

        // Check if invitation is for current user
        if ($invitation->invitee_email !== auth()->user()->email) {
            abort(403, 'This invitation is not for you.');
        }

        // Check if invitation is still valid
        if ($invitation->status !== 'pending') {
            return back()->with('error', 'This invitation has already been ' . $invitation->status . '.');
        }

        // Update invitation status
        $invitation->update(['status' => 'declined']);

        return redirect()->route('invitations.index')
            ->with('success', 'Invitation declined.');
    }

    /**
     * Cancel a sent invitation.
     */
    public function cancel(Invitation $invitation)
    {
        // Ensure webhook relationship is loaded
        if (!$invitation->relationLoaded('webhook')) {
            $invitation->load('webhook');
        }
        
        // Check if webhook exists
        if (!$invitation->webhook) {
            abort(404, 'Webhook not found.');
        }
        
        // Only the inviter or webhook owner can cancel
        if ($invitation->inviter_id !== auth()->id() && $invitation->webhook->user_id !== auth()->id()) {
            abort(403, 'You are not authorized to cancel this invitation.');
        }

        if ($invitation->status !== 'pending') {
            return back()->with('error', 'This invitation has already been ' . $invitation->status . '.');
        }

        $invitation->update(['status' => 'cancelled']);

        return back()->with('success', 'Invitation cancelled.');
    }
}
