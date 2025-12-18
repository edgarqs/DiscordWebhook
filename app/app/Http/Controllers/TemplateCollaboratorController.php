<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class TemplateCollaboratorController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display template collaborators
     */
    public function index(Template $template)
    {
        $this->authorize('manageCollaborators', $template);

        $collaborators = $template->collaborators()
            ->select('users.id', 'users.name', 'users.email')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'permission_level' => $user->pivot->permission_level,
                    'created_at' => $user->pivot->created_at,
                ];
            });

        $template->is_owner = $template->isOwnedBy();

        return Inertia::render('templates/collaborators', [
            'template' => $template,
            'collaborators' => $collaborators,
        ]);
    }

    /**
     * Add a collaborator to the template
     */
    public function store(Request $request, Template $template)
    {
        $this->authorize('manageCollaborators', $template);

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'permission_level' => 'required|in:view,edit',
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Prevent adding owner as collaborator
        if ($user->id === $template->user_id) {
            return back()->withErrors(['email' => 'Cannot add template owner as collaborator.']);
        }

        // Check if already a collaborator
        if ($template->isSharedWith($user)) {
            return back()->withErrors(['email' => 'User is already a collaborator.']);
        }

        $template->collaborators()->attach($user->id, [
            'permission_level' => $validated['permission_level'],
        ]);

        return back()->with('success', 'Collaborator added successfully!');
    }

    /**
     * Update collaborator permission
     */
    public function update(Request $request, Template $template, User $user)
    {
        $this->authorize('manageCollaborators', $template);

        $validated = $request->validate([
            'permission_level' => 'required|in:view,edit',
        ]);

        $template->collaborators()->updateExistingPivot($user->id, [
            'permission_level' => $validated['permission_level'],
        ]);

        return back()->with('success', 'Permission updated successfully!');
    }

    /**
     * Remove a collaborator from the template
     */
    public function destroy(Template $template, User $user)
    {
        $this->authorize('manageCollaborators', $template);

        $template->collaborators()->detach($user->id);

        return back()->with('success', 'Collaborator removed successfully!');
    }

    /**
     * Leave a template (remove yourself as collaborator)
     */
    public function leave(Template $template)
    {
        $user = auth()->user();

        // Check if user is a collaborator
        if (!$template->isSharedWith($user)) {
            return back()->withErrors(['error' => 'You are not a collaborator of this template.']);
        }

        // Prevent owner from leaving
        if ($template->isOwnedBy($user->id)) {
            return back()->withErrors(['error' => 'Template owner cannot leave.']);
        }

        $template->collaborators()->detach($user->id);

        return redirect()->route('templates.index')
            ->with('success', 'You have left the template successfully!');
    }
}
