<?php

namespace App\Http\Controllers;

use App\Models\ScheduledMessage;
use App\Models\Webhook;
use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ScheduledMessageController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = ScheduledMessage::with(['webhook', 'template', 'files'])
            ->where('user_id', $user->id);

        // Filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('schedule_type', $request->type);
        }

        $messages = $query->latest()->paginate(20);

        return Inertia::render('scheduled/index', [
            'messages' => $messages,
            'filters' => [
                'status' => $request->status ?? 'all',
                'type' => $request->type ?? 'all',
            ],
        ]);
    }

    public function create()
    {
        $user = auth()->user();

        $webhooks = Webhook::where('user_id', $user->id)
            ->orWhereHas('collaborators', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->select('id', 'name', 'avatar_url')
            ->get();

        $templates = Template::where('user_id', $user->id)
            ->orWhereHas('collaborators', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->select('id', 'name', 'category', 'content')
            ->get();

        return Inertia::render('scheduled/create', [
            'webhooks' => $webhooks,
            'templates' => $templates,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'webhook_id' => 'required|exists:webhooks,id',
            'template_id' => 'nullable|exists:templates,id',
            'message_content' => 'required|array',
            'message_content.content' => 'nullable|string|max:2000',
            'message_content.embeds' => 'nullable|array|max:10',
            'schedule_type' => 'required|in:once,recurring',
            'scheduled_at' => 'required_if:schedule_type,once|nullable|date',
            'recurrence_pattern' => 'required_if:schedule_type,recurring|nullable|array',
            'timezone' => 'required|string',
            'max_sends' => 'nullable|integer|min:1',
            'files.*' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,gif,webp,mp4,mov,avi',
        ]);

        // Convert scheduled_at to UTC
        $nextSendAt = null;
        if ($validated['schedule_type'] === 'once') {
            $nextSendAt = Carbon::parse($validated['scheduled_at'], $validated['timezone'])
                ->setTimezone('UTC');
        } else {
            // Calculate first send time for recurring
            $pattern = $validated['recurrence_pattern'];
            $timezone = $validated['timezone'];
            $now = Carbon::now($timezone);
            
            $time = $pattern['time'] ?? '12:00';
            [$hour, $minute] = explode(':', $time);
            
            $next = $now->copy()->setTime((int)$hour, (int)$minute, 0);
            if ($next <= $now) {
                $next->addDay();
            }
            
            $nextSendAt = $next->setTimezone('UTC');
        }

        $scheduledMessage = ScheduledMessage::create([
            'user_id' => auth()->id(),
            'webhook_id' => $validated['webhook_id'],
            'template_id' => $validated['template_id'],
            'message_content' => $validated['message_content'],
            'schedule_type' => $validated['schedule_type'],
            'scheduled_at' => $validated['schedule_type'] === 'once' ? $nextSendAt : null,
            'recurrence_pattern' => $validated['recurrence_pattern'] ?? null,
            'timezone' => $validated['timezone'],
            'next_send_at' => $nextSendAt,
            'max_sends' => $validated['max_sends'] ?? null,
            'status' => 'pending',
        ]);

        // Handle file uploads
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $filename = $file->getClientOriginalName();
                $path = $file->store("scheduled_messages/{$scheduledMessage->id}", 'local');
                
                $scheduledMessage->files()->create([
                    'filename' => $filename,
                    'stored_path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
            }
        }

        return redirect()->route('scheduled.index')
            ->with('success', 'Message scheduled successfully!');
    }

    public function edit(ScheduledMessage $scheduled)
    {
        $this->authorize('update', $scheduled);

        $user = auth()->user();

        $webhooks = Webhook::where('user_id', $user->id)
            ->orWhereHas('collaborators', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->select('id', 'name', 'avatar_url')
            ->get();

        $templates = Template::where('user_id', $user->id)
            ->orWhereHas('collaborators', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->select('id', 'name', 'category', 'content')
            ->get();

        $scheduled->load('files');

        return Inertia::render('scheduled/edit', [
            'scheduledMessage' => $scheduled,
            'webhooks' => $webhooks,
            'templates' => $templates,
        ]);
    }

    public function update(Request $request, ScheduledMessage $scheduled)
    {
        $this->authorize('update', $scheduled);

        // Only allow editing if not yet sent
        if ($scheduled->send_count > 0) {
            return back()->withErrors(['error' => 'Cannot edit a message that has already been sent']);
        }

        $validated = $request->validate([
            'webhook_id' => 'required|exists:webhooks,id',
            'template_id' => 'nullable|exists:templates,id',
            'message_content' => 'required|array',
            'schedule_type' => 'required|in:once,recurring',
            'scheduled_at' => 'required_if:schedule_type,once|nullable|date',
            'recurrence_pattern' => 'required_if:schedule_type,recurring|nullable|array',
            'timezone' => 'required|string',
            'max_sends' => 'nullable|integer|min:1',
            'files.*' => 'nullable|file|max:10240',
            'remove_files' => 'nullable|array',
        ]);

        // Calculate next_send_at
        $nextSendAt = null;
        if ($validated['schedule_type'] === 'once') {
            $nextSendAt = Carbon::parse($validated['scheduled_at'], $validated['timezone'])
                ->setTimezone('UTC');
        } else {
            $pattern = $validated['recurrence_pattern'];
            $timezone = $validated['timezone'];
            $now = Carbon::now($timezone);
            
            $time = $pattern['time'] ?? '12:00';
            [$hour, $minute] = explode(':', $time);
            
            $next = $now->copy()->setTime((int)$hour, (int)$minute, 0);
            if ($next <= $now) {
                $next->addDay();
            }
            
            $nextSendAt = $next->setTimezone('UTC');
        }

        $scheduled->update([
            'webhook_id' => $validated['webhook_id'],
            'template_id' => $validated['template_id'],
            'message_content' => $validated['message_content'],
            'schedule_type' => $validated['schedule_type'],
            'scheduled_at' => $validated['schedule_type'] === 'once' ? $nextSendAt : null,
            'recurrence_pattern' => $validated['recurrence_pattern'] ?? null,
            'timezone' => $validated['timezone'],
            'next_send_at' => $nextSendAt,
            'max_sends' => $validated['max_sends'] ?? null,
        ]);

        // Handle file removal
        if ($request->has('remove_files')) {
            foreach ($request->remove_files as $fileId) {
                $file = $scheduled->files()->find($fileId);
                if ($file) {
                    $file->delete();
                }
            }
        }

        // Handle new file uploads
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $filename = $file->getClientOriginalName();
                $path = $file->store("scheduled_messages/{$scheduled->id}", 'local');
                
                $scheduled->files()->create([
                    'filename' => $filename,
                    'stored_path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
            }
        }

        return redirect()->route('scheduled.index')
            ->with('success', 'Message updated successfully!');
    }

    public function destroy(ScheduledMessage $scheduled)
    {
        $this->authorize('delete', $scheduled);

        // Files will be automatically deleted by the observer
        $scheduled->delete();

        return redirect()->route('scheduled.index')
            ->with('success', 'Scheduled message deleted successfully!');
    }

    public function pause(ScheduledMessage $scheduled)
    {
        $this->authorize('update', $scheduled);

        $scheduled->pause();

        return back()->with('success', 'Message paused successfully!');
    }

    public function resume(ScheduledMessage $scheduled)
    {
        $this->authorize('update', $scheduled);

        $scheduled->resume();

        return back()->with('success', 'Message resumed successfully!');
    }
}
