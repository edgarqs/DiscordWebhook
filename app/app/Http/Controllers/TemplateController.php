<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\Webhook;
use App\Http\Requests\TemplateRequest;
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

        // Own templates only (templates don't have collaborators)
        $query = $user->templates()->with('webhook:id,name');

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        // Get templates
        $templates = $query->latest()->get()->map(function ($template) {
            $template->is_owner = true;
            $template->permission_level = 'owner';
            return $template;
        });

        return Inertia::render('templates/index', [
            'templates' => [
                'data' => $templates,
            ],
            'filters' => [
                'category' => $request->category,
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new template.
     */
    public function create()
    {
        $this->authorize('create', Template::class);

        // Get user's webhooks for optional association
        $webhooks = auth()->user()->webhooks()->get(['id', 'name']);

        return Inertia::render('templates/create', [
            'webhooks' => $webhooks,
        ]);
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
            'webhook_id' => $request->webhook_id,
            'is_shared' => $request->boolean('is_shared', false),
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
        
        // Get user's webhooks for optional association
        $webhooks = auth()->user()->webhooks()->get(['id', 'name']);

        return Inertia::render('templates/edit', [
            'template' => $template,
            'webhooks' => $webhooks,
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
            'webhook_id' => $request->webhook_id,
            'is_shared' => $request->boolean('is_shared', false),
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
}
