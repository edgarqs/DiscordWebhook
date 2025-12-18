import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PlusIcon, Webhook, Trash2, Edit, ExternalLink, Send, Users, Crown } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Webhooks',
        href: '/webhooks',
    },
];

interface WebhookData {
    id: number;
    name: string;
    webhook_url: string;
    avatar_url?: string;
    description?: string;
    tags?: string[];
    message_history_count: number;
    created_at: string;
    is_owner?: boolean;
    permission_level?: string;
    owner?: {
        id: number;
        name: string;
        email: string;
    };
}

interface Props {
    webhooks: WebhookData[];
}

export default function WebhooksIndex({ webhooks }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [webhookToDelete, setWebhookToDelete] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setWebhookToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (webhookToDelete) {
            setDeletingId(webhookToDelete);
            router.delete(`/webhooks/${webhookToDelete}`, {
                onFinish: () => {
                    setDeletingId(null);
                    setWebhookToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Webhooks" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your Discord webhooks
                        </p>
                    </div>
                    <Link href="/webhooks/create">
                        <Button size="lg" className="gap-2">
                            <PlusIcon className="h-5 w-5" />
                            Create Webhook
                        </Button>
                    </Link>
                </div>

                {/* Webhooks Grid */}
                {webhooks.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Webhook className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No webhooks yet</h3>
                            <p className="text-muted-foreground mb-6 text-center max-w-md">
                                Get started by creating your first Discord webhook to send messages
                            </p>
                            <Link href="/webhooks/create">
                                <Button size="lg" className="gap-2">
                                    <PlusIcon className="h-5 w-5" />
                                    Create Your First Webhook
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {webhooks.map((webhook) => (
                            <Card key={webhook.id} className="group hover:shadow-lg transition-all duration-200">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {webhook.avatar_url ? (
                                                <img
                                                    src={webhook.avatar_url}
                                                    alt={webhook.name}
                                                    className="h-12 w-12 rounded-full"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <Webhook className="h-6 w-6 text-white" />
                                                </div>
                                            )}
                                            <div>
                                                <CardTitle className="text-lg">{webhook.name}</CardTitle>
                                                {!webhook.is_owner && webhook.owner && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Owner: {webhook.owner.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {webhook.is_owner ? (
                                                <Badge variant="default" className="gap-1">
                                                    <Crown className="h-3 w-3" />
                                                    Owner
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {webhook.permission_level}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {webhook.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {webhook.description}
                                        </p>
                                    )}

                                    {webhook.tags && webhook.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {webhook.tags.map((tag, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                                        <div className="flex items-center gap-1">
                                            <ExternalLink className="h-4 w-4" />
                                            <span>{webhook.message_history_count || 0} messages</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        {(webhook.is_owner || ['admin', 'editor'].includes(webhook.permission_level || '')) && (
                                            <Link href={`/webhooks/${webhook.id}/send`} className="flex-1">
                                                <Button className="w-full gap-2" size="lg">
                                                    <Send className="h-4 w-4" />
                                                    Send Message
                                                </Button>
                                            </Link>
                                        )}
                                        {(webhook.is_owner || ['admin', 'editor'].includes(webhook.permission_level || '')) && (
                                            <Link href={`/webhooks/${webhook.id}/edit`}>
                                                <Button variant="outline" size="lg">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        )}
                                        {(webhook.is_owner || webhook.permission_level === 'admin') && (
                                            <>
                                                <Link href={`/webhooks/${webhook.id}/collaborators`}>
                                                    <Button variant="outline" size="lg">
                                                        <Users className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    onClick={() => handleDeleteClick(webhook.id)}
                                                    disabled={deletingId === webhook.id}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={handleConfirmDelete}
                    title="Delete Webhook"
                    description="Are you sure you want to delete this webhook? This action cannot be undone and all associated data will be permanently removed."
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </AppLayout>
    );
}
