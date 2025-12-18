import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Webhook, MessageHistory as MessageHistoryType, type BreadcrumbItem } from '@/types';

interface HistoryProps {
    webhook: Webhook;
    messages: {
        data: MessageHistoryType[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function WebhookHistory({ webhook, messages }: HistoryProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Webhooks',
            href: '/webhooks',
        },
        {
            title: webhook.name,
            href: `/webhooks/${webhook.id}/edit`,
        },
        {
            title: 'History',
            href: `/webhooks/${webhook.id}/history`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Message History - ${webhook.name}`} />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/webhooks/${webhook.id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Message History</h1>
                            <p className="text-muted-foreground">
                                {webhook.name} - {messages.total} messages sent
                            </p>
                        </div>
                    </div>

                    <Link href={`/webhooks/${webhook.id}/send`}>
                        <Button>
                            Send New Message
                        </Button>
                    </Link>
                </div>

                {/* Messages List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sent Messages</CardTitle>
                        <CardDescription>
                            View all messages sent through this webhook
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {messages.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="text-lg">No messages sent yet</p>
                                <p className="text-sm mt-2">
                                    Send your first message to get started
                                </p>
                                <Link href={`/webhooks/${webhook.id}/send`}>
                                    <Button className="mt-4">
                                        Send Message
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.data.map((message) => (
                                    <Card key={message.id} className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                {/* Status and Date */}
                                                <div className="flex items-center gap-3">
                                                    {message.status === 'success' ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-destructive" />
                                                    )}
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(message.sent_at).toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        by {message.user?.name || 'Unknown'}
                                                    </span>
                                                </div>

                                                {/* Message Content Preview */}
                                                <div className="pl-8">
                                                    {message.message_content.content && (
                                                        <p className="text-sm line-clamp-2">
                                                            {message.message_content.content}
                                                        </p>
                                                    )}
                                                    {message.message_content.embeds && message.message_content.embeds.length > 0 && (
                                                        <div className="mt-2 space-y-1">
                                                            {message.message_content.embeds.map((embed: any, index: number) => (
                                                                <div
                                                                    key={index}
                                                                    className="text-sm border-l-2 pl-2"
                                                                    style={{ borderColor: `#${embed.color?.toString(16).padStart(6, '0') || '5865f2'}` }}
                                                                >
                                                                    {embed.title && (
                                                                        <p className="font-medium">{embed.title}</p>
                                                                    )}
                                                                    {embed.description && (
                                                                        <p className="text-muted-foreground line-clamp-1">
                                                                            {embed.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {!message.message_content.content && (!message.message_content.embeds || message.message_content.embeds.length === 0) && (
                                                        <p className="text-sm text-muted-foreground italic">
                                                            Empty message
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Error Message */}
                                                {message.status === 'failed' && message.response && (
                                                    <div className="pl-8 mt-2">
                                                        <p className="text-sm text-destructive">
                                                            Error: {JSON.stringify(message.response)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}

                                {/* Pagination */}
                                {messages.last_page > 1 && (
                                    <div className="flex justify-center gap-2 pt-4">
                                        {Array.from({ length: messages.last_page }, (_, i) => i + 1).map((page) => (
                                            <Link
                                                key={page}
                                                href={`/webhooks/${webhook.id}/history?page=${page}`}
                                            >
                                                <Button
                                                    variant={page === messages.current_page ? 'default' : 'outline'}
                                                    size="sm"
                                                >
                                                    {page}
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
