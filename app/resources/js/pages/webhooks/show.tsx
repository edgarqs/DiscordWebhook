import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Send,
    Edit,
    Users,
    Trash2,
    LogOut,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Activity,
    Calendar,
    ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { router } from '@inertiajs/react';

interface Webhook {
    id: number;
    name: string;
    avatar_url?: string;
    description?: string;
    webhook_url: string;
    tags?: string[];
    is_owner: boolean;
    permission_level: 'owner' | 'edit' | 'view';
    created_at: string;
    message_history: MessageHistory[];
}

interface MessageHistory {
    id: number;
    message_content: any;
    status: 'success' | 'failed';
    sent_at: string;
    response?: any;
}

interface Stats {
    total: number;
    success: number;
    error: number;
    recent: number;
}

interface Props {
    webhook: Webhook;
    stats: Stats;
}

export default function ShowWebhook({ webhook, stats }: Props) {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [leaveDialog, setLeaveDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Webhooks',
            href: '/webhooks',
        },
        {
            title: webhook.name,
            href: `/webhooks/${webhook.id}`,
        },
    ];

    const handleDelete = () => {
        router.delete(`/webhooks/${webhook.id}`, {
            onSuccess: () => {
                setDeleteDialog(false);
            },
        });
    };

    const handleLeave = () => {
        router.post(`/webhooks/${webhook.id}/leave`, {}, {
            onSuccess: () => {
                setLeaveDialog(false);
            },
        });
    };

    const successRate = stats.total > 0
        ? ((stats.success / stats.total) * 100).toFixed(1)
        : '0';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={webhook.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {webhook.avatar_url ? (
                            <img
                                src={webhook.avatar_url}
                                alt={webhook.name}
                                className="h-16 w-16 rounded-full"
                            />
                        ) : (
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <MessageSquare className="h-8 w-8 text-white" />
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold tracking-tight">{webhook.name}</h1>
                                {webhook.is_owner ? (
                                    <Badge variant="default">Owner</Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        {webhook.permission_level === 'edit' ? 'Editor' : 'Viewer'}
                                    </Badge>
                                )}
                            </div>
                            {webhook.description && (
                                <p className="text-muted-foreground mt-1">{webhook.description}</p>
                            )}
                            {webhook.tags && webhook.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                    {webhook.tags.map((tag, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <Link href={`/webhooks/${webhook.id}/send`}>
                            <Button className="gap-2">
                                <Send className="h-4 w-4" />
                                Send Message
                            </Button>
                        </Link>
                        {(webhook.is_owner || webhook.permission_level === 'edit') && (
                            <Link href={`/webhooks/${webhook.id}/edit`}>
                                <Button variant="outline" className="gap-2">
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {webhook.is_owner && (
                            <>
                                <Link href={`/webhooks/${webhook.id}/collaborators`}>
                                    <Button variant="outline" className="gap-2">
                                        <Users className="h-4 w-4" />
                                        Share
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="gap-2 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteDialog(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </>
                        )}
                        {!webhook.is_owner && (
                            <Button
                                variant="outline"
                                className="gap-2 text-destructive hover:text-destructive"
                                onClick={() => setLeaveDialog(true)}
                            >
                                <LogOut className="h-4 w-4" />
                                Leave
                            </Button>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Messages
                            </CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                All time
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-500/20 bg-green-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Successful
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {successRate}% success rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-red-500/20 bg-red-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Failed
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Errors encountered
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-500/20 bg-blue-500/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Recent Activity
                            </CardTitle>
                            <Activity className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.recent}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Last 7 days
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Messages */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Messages</CardTitle>
                                <CardDescription>
                                    Last 10 messages sent through this webhook
                                </CardDescription>
                            </div>
                            <Link href={`/webhooks/${webhook.id}/history`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                    View All
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {webhook.message_history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground mb-4">
                                    No messages sent yet
                                </p>
                                <Link href={`/webhooks/${webhook.id}/send`}>
                                    <Button className="gap-2">
                                        <Send className="h-4 w-4" />
                                        Send First Message
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {webhook.message_history.map((message) => (
                                    <div
                                        key={message.id}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {message.status === 'success' ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">
                                                    {message.message_content?.content || 'Embed message'}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(message.sent_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant={message.status === 'success' ? 'default' : 'destructive'}>
                                            {message.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                onConfirm={handleDelete}
                title="Delete Webhook"
                description="Are you sure you want to delete this webhook? This action cannot be undone and all message history will be lost."
                confirmText="Delete"
                variant="destructive"
            />

            {/* Leave Confirmation Dialog */}
            <ConfirmDialog
                open={leaveDialog}
                onOpenChange={setLeaveDialog}
                onConfirm={handleLeave}
                title="Leave Webhook"
                description="Are you sure you want to leave this webhook? You will lose access to it."
                confirmText="Leave"
                variant="destructive"
            />
        </AppLayout>
    );
}
