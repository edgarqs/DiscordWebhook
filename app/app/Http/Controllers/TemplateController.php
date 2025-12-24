<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\Webhook;
use App\Http\Requests\TemplateRequest;
use App\Services\VariableReplacerService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class TemplateController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of templates.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Template::class);

        $user = auth()->user();

        // Get owned templates
        $ownedTemplates = $user->templates()
            ->with('webhook:id,name')
            ->get()
            ->map(function ($template) {
                $template->is_owner = true;
                $template->permission_level = 'owner';
                return $template;
            });

        // Get shared templates (where user is a collaborator)
        $sharedTemplates = Template::whereHas('collaborators', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['webhook:id,name', 'collaborators' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->get()
            ->map(function ($template) {
                $template->is_owner = false;
                // Get the permission level from the pivot table
                $collaborator = $template->collaborators->first();
                $template->permission_level = $collaborator?->pivot->permission_level ?? 'view';
                // Remove the collaborators collection to avoid sending unnecessary data
                unset($template->collaborators);
                return $template;
            });

        // Merge owned and shared templates
        $allTemplates = $ownedTemplates->merge($sharedTemplates);

        // Sort by latest (created_at descending)
        $allTemplates = $allTemplates->sortByDesc('created_at')->values();

        return Inertia::render('templates/index', [
            'templates' => [
                'data' => $allTemplates,
            ],
            'filters' => [
                'category' => $request->category,
                'search' => $request->search,
                'ownership' => $request->ownership,
            ],
        ]);
    }

    /**
     * Show the form for creating a new template.
     */
    public function create()
    {
        $this->authorize('create', Template::class);

        return Inertia::render('templates/create');
    }

    /**
     * Store a newly created template.
     */
    public function store(TemplateRequest $request)
    {
        $this->authorize('create', Template::class);

        $template = auth()->user()->templates()->create([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'content' => $request->content,
        ]);

        return redirect()->route('templates.index')
            ->with('success', 'Template created successfully!');
    }

    /**
     * Display the specified template.
     */
    public function show(Template $template)
    {
        $this->authorize('view', $template);

        $template->load(['user:id,name', 'webhook:id,name']);

        return Inertia::render('templates/show', [
            'template' => $template,
        ]);
    }

    /**
     * Show the form for editing the specified template.
     */
    public function edit(Template $template)
    {
        $this->authorize('update', $template);

        $template->load('webhook:id,name');
        
        // Add ownership flag
        $template->is_owner = $template->isOwnedBy();
        

        return Inertia::render('templates/edit', [
            'template' => $template,
        ]);
    }

    /**
     * Update the specified template.
     */
    public function update(TemplateRequest $request, Template $template)
    {
        $this->authorize('update', $template);

        $template->update([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'content' => $request->content,
        ]);

        return redirect()->route('templates.index')
            ->with('success', 'Template updated successfully!');
    }

    /**
     * Remove the specified template.
     */
    public function destroy(Template $template)
    {
        $this->authorize('delete', $template);

        $template->delete();

        return redirect()->route('templates.index')
            ->with('success', 'Template deleted successfully!');
    }

    /**
     * Duplicate the specified template.
     */
    public function duplicate(Template $template)
    {
        $this->authorize('duplicate', $template);

        $newTemplate = auth()->user()->templates()->create([
            'name' => $template->name . ' (Copy)',
            'description' => $template->description,
            'category' => $template->category,
            'content' => $template->content,
            'webhook_id' => null, // Don't copy webhook association
            'is_shared' => false, // Don't share by default
        ]);

        return redirect()->route('templates.edit', $newTemplate)
            ->with('success', 'Template duplicated successfully!');
    }

    /**
     * Get template with variables replaced
     */
    public function getWithVariables(Template $template, Request $request)
    {
        $this->authorize('view', $template);

        $webhookId = $request->query('webhook_id');
        $webhook = $webhookId ? Webhook::find($webhookId) : null;

        $variableReplacer = new VariableReplacerService();
        
        // Replace variables in the template content
        $replacedPayload = $variableReplacer->replaceInPayload(
            $template->content,
            auth()->user(),
            $webhook
        );

        return response()->json([
            'payload' => $replacedPayload,
            'availableVariables' => $variableReplacer->getAvailableVariables(),
        ]);
    }
}
