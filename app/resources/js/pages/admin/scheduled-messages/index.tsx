import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Calendar,
    Clock,
    Pause,
    Play,
    Trash2,
    Eye,
    Repeat,
    MessageSquare,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Users
} from 'lucide-react';

interface ScheduledMessage {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    webhook: {
        id: number;
        name: string;
        avatar_url?: string;
    };
    template?: {
        id: number;
        name: string;
    };
    message_content: {
        content?: string;
        embeds?: any[];
    };
    schedule_type: 'once' | 'recurring';
    scheduled_at?: string;
    next_send_at?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
    send_count: number;
    max_sends?: number;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Webhook {
    id: number;
    name: string;
}

interface Props {
    messages: {
        data: ScheduledMessage[];
        links: any;
        meta: any;
    };
    stats: {
        active: number;
        paused: number;
        completed: number;
        failed: number;
    };
    users: User[];
    webhooks: Webhook[];
    filters: {
        user_id: string;
        status: string;
        type: string;
        webhook_id: string;
        date_from: string;
        date_to: string;
    };
}

const STATUS_COLORS = {
    pending: 'bg-blue-500 text-white',
    processing: 'bg-yellow-500 text-white',
    completed: 'bg-green-500 text-white',
    failed: 'bg-red-500 text-white',
    paused: 'bg-gray-500 text-white',
};

export default function AdminScheduledMessages({ messages, stats, users, webhooks, filters }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);

        router.get('/admin/scheduled-messages', newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDeleteClick = (id: number) => {
        setMessageToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (messageToDelete) {
            router.delete(`/admin/scheduled-messages/${messageToDelete}`, {
                onFinish: () => {
                    setMessageToDelete(null);
                },
            });
        }
    };

    const handlePause = (id: number) => {
        router.post(`/admin/scheduled-messages/${id}/pause`);
    };

    const handleResume = (id: number) => {
        router.post(`/admin/scheduled-messages/${id}/resume`);
    };

    return (
        <AppLayout>
            <Head title="Admin - Scheduled Messages" />

            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Scheduled Messages Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        View and manage all scheduled messages from all users
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                            <p className="text-xs text-muted-foreground">Pending messages</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paused</CardTitle>
                            <AlertCircle className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.paused}</div>
                            <p className="text-xs text-muted-foreground">Paused messages</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completed}</div>
                            <p className="text-xs text-muted-foreground">Completed messages</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Failed</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.failed}</div>
                            <p className="text-xs text-muted-foreground">Failed messages</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter scheduled messages by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* User Filter */}
                            <div className="space-y-2">
                                <Label>User</Label>
                                <Select
                                    value={localFilters.user_id}
                                    onValueChange={(value) => handleFilterChange('user_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All users" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All users</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={localFilters.status}
                                    onValueChange={(value) => handleFilterChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paused">Paused</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Type Filter */}
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={localFilters.type}
                                    onValueChange={(value) => handleFilterChange('type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        <SelectItem value="once">One-time</SelectItem>
                                        <SelectItem value="recurring">Recurring</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Webhook Filter */}
                            <div className="space-y-2">
                                <Label>Webhook</Label>
                                <Select
                                    value={localFilters.webhook_id}
                                    onValueChange={(value) => handleFilterChange('webhook_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All webhooks" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All webhooks</SelectItem>
                                        {webhooks.map((webhook) => (
                                            <SelectItem key={webhook.id} value={webhook.id.toString()}>
                                                {webhook.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date From */}
                            <div className="space-y-2">
                                <Label>From Date</Label>
                                <Input
                                    type="date"
                                    value={localFilters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                />
                            </div>

                            {/* Date To */}
                            <div className="space-y-2">
                                <Label>To Date</Label>
                                <Input
                                    type="date"
                                    value={localFilters.date_to}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Messages List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Scheduled Messages ({messages?.meta?.total ?? messages?.data?.length ?? 0})</CardTitle>
                        <CardDescription>All scheduled messages across all users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(messages?.data?.length ?? 0) === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium">No scheduled messages found</p>
                                <p className="text-muted-foreground">
                                    Try adjusting your filters
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {messages?.data?.map((message) => (
                                    <div
                                        key={message.id}
                                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        {/* Avatar */}
                                        {message.webhook.avatar_url ? (
                                            <img
                                                src={message.webhook.avatar_url}
                                                alt={message.webhook.name}
                                                className="h-12 w-12 rounded-full flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0" />
                                        )}

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold">{message.webhook.name}</h3>
                                                <Badge className={`${STATUS_COLORS[message.status]} text-xs`}>
                                                    {message.status}
                                                </Badge>
                                                {message.schedule_type === 'recurring' && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <Repeat className="h-3 w-3 mr-1" />
                                                        Recurring
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Users className="h-3 w-3" />
                                                <span className="font-medium">{message.user.name}</span>
                                                <span>({message.user.email})</span>
                                            </div>

                                            {message.message_content.content && (
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {message.message_content.content}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {message.next_send_at ? (
                                                        <span>Next: {new Date(message.next_send_at).toLocaleString()}</span>
                                                    ) : (
                                                        <span>Completed</span>
                                                    )}
                                                </div>
                                                <span>•</span>
                                                <span>Sent {message.send_count} time{message.send_count !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {message.status === 'pending' && message.schedule_type === 'recurring' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handlePause(message.id)}
                                                    title="Pause"
                                                >
                                                    <Pause className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {message.status === 'paused' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleResume(message.id)}
                                                    title="Resume"
                                                >
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteClick(message.id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                title="Delete Scheduled Message"
                description="Are you sure you want to delete this scheduled message? This action cannot be undone and will affect another user's scheduled message."
                confirmText="Delete"
                variant="destructive"
            />
        </AppLayout>
    );
}
