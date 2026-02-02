<?php

namespace App\Http\Controllers;

use App\Models\ScheduledMessage;
use App\Models\User;
use App\Models\Webhook;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AdminScheduledMessageController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $query = ScheduledMessage::with(['user', 'webhook', 'template', 'files']);

        // Filter by user
        if ($request->filled('user_id') && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('schedule_type', $request->type);
        }

        // Filter by webhook
        if ($request->filled('webhook_id') && $request->webhook_id !== 'all') {
            $query->where('webhook_id', $request->webhook_id);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('next_send_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('next_send_at', '<=', $request->date_to);
        }

        $messages = $query->latest()->paginate(20)->withQueryString();

        // Get statistics
        $stats = [
            'active' => ScheduledMessage::where('status', 'pending')->count(),
            'paused' => ScheduledMessage::where('status', 'paused')->count(),
            'completed' => ScheduledMessage::where('status', 'completed')->count(),
            'failed' => ScheduledMessage::where('status', 'failed')->count(),
        ];

        // Get all users for filter dropdown
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        // Get all webhooks for filter dropdown
        $webhooks = Webhook::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('admin/scheduled-messages/index', [
            'messages' => $messages,
            'stats' => $stats,
            'users' => $users,
            'webhooks' => $webhooks,
            'filters' => [
                'user_id' => $request->user_id ?? 'all',
                'status' => $request->status ?? 'all',
                'type' => $request->type ?? 'all',
                'webhook_id' => $request->webhook_id ?? 'all',
                'date_from' => $request->date_from ?? '',
                'date_to' => $request->date_to ?? '',
            ],
        ]);
    }

    public function show(ScheduledMessage $scheduled)
    {
        $scheduled->load(['user', 'webhook', 'template', 'files']);

        return Inertia::render('admin/scheduled-messages/show', [
            'message' => $scheduled,
        ]);
    }

    public function pause(ScheduledMessage $scheduled)
    {
        if ($scheduled->schedule_type === 'recurring' && $scheduled->status === 'pending') {
            $scheduled->update(['status' => 'paused']);
            return back()->with('success', 'Message paused successfully!');
        }

        return back()->withErrors(['error' => 'Cannot pause this message']);
    }

    public function resume(ScheduledMessage $scheduled)
    {
        if ($scheduled->status === 'paused') {
            $nextSendTime = $scheduled->calculateNextSendTime();
            $scheduled->update([
                'status' => 'pending',
                'next_send_at' => $nextSendTime,
            ]);
            return back()->with('success', 'Message resumed successfully!');
        }

        return back()->withErrors(['error' => 'Cannot resume this message']);
    }

    public function destroy(ScheduledMessage $scheduled)
    {
        // Delete files associated with the message
        foreach ($scheduled->files as $file) {
            $file->delete();
        }

        $scheduled->delete();

        return redirect()->route('admin.scheduled.index')
            ->with('success', 'Scheduled message deleted successfully!');
    }
}
