import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Calendar, Clock, Pause, Play, Trash2, Edit, Plus, Repeat } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface ScheduledMessage {
    id: number;
    webhook: {
        id: number;
        name: string;
        avatar_url?: string;
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

interface Props {
    messages: {
        data: ScheduledMessage[];
        links: any;
        meta: any;
    };
    filters: {
        status: string;
        type: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Scheduled Messages',
        href: '/scheduled',
    },
];

const STATUS_COLORS = {
    pending: 'bg-blue-500',
    processing: 'bg-yellow-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    paused: 'bg-gray-500',
};

export default function ScheduledIndex({ messages, filters }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setMessageToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (messageToDelete) {
            router.delete(`/scheduled/${messageToDelete}`, {
                onFinish: () => {
                    setMessageToDelete(null);
                },
            });
        }
    };

    const handlePause = (id: number) => {
        router.post(`/scheduled/${id}/pause`);
    };

    const handleResume = (id: number) => {
        router.post(`/scheduled/${id}/resume`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Scheduled Messages" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Scheduled Messages</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your scheduled and recurring messages
                        </p>
                    </div>
                    <Link href="/scheduled/create">
                        <Button size="lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Schedule Message
                        </Button>
                    </Link>
                </div>

                {/* Messages List */}
                {messages.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No scheduled messages</p>
                        <p className="text-muted-foreground mb-4">
                            Create your first scheduled message to get started
                        </p>
                        <Link href="/scheduled/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Schedule Message
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {messages.data.map((message) => (
                            <div
                                key={message.id}
                                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
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
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold truncate">{message.webhook.name}</h3>
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

                                    {message.message_content.content && (
                                        <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                                            {message.message_content.content}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                                        >
                                            <Pause className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {message.status === 'paused' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleResume(message.id)}
                                        >
                                            <Play className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {message.send_count === 0 && (
                                        <Link href={`/scheduled/${message.id}/edit`}>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteClick(message.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                title="Delete Scheduled Message"
                description="Are you sure you want to delete this scheduled message? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
            />
        </AppLayout>
    );
}
