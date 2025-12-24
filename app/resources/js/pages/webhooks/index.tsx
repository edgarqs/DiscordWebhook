import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PlusIcon, Webhook, Trash2, Edit, ExternalLink, Send, Users, Crown, LogOut, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    filters?: {
        ownership?: string;
    };
}

export default function WebhooksIndex({ webhooks, filters }: Props) {
    const [search, setSearch] = useState('');
    const [ownership, setOwnership] = useState(filters?.ownership || 'all');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [webhookToDelete, setWebhookToDelete] = useState<number | null>(null);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [webhookToLeave, setWebhookToLeave] = useState<number | null>(null);

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

    const handleLeaveClick = (id: number) => {
        setWebhookToLeave(id);
        setLeaveDialogOpen(true);
    };

    const handleConfirmLeave = () => {
        if (webhookToLeave) {
            router.post(`/webhooks/${webhookToLeave}/leave`, {}, {
                onSuccess: () => {
                    setWebhookToLeave(null);
                    setLeaveDialogOpen(false);
                },
            });
        }
    };

    const handleOwnershipChange = (value: string) => {
        setOwnership(value);
    };

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    // Filter webhooks based on ownership and search
    const filteredWebhooks = webhooks.filter(webhook => {
        // Ownership filter
        if (ownership === 'owned' && !webhook.is_owner) return false;
        if (ownership === 'shared' && webhook.is_owner) return false;

        // Search filter
        if (search && !webhook.name.toLowerCase().includes(search.toLowerCase())) return false;

        return true;
    });

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

                {/* Show filters only if there are webhooks */}
                {webhooks.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search webhooks..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select value={ownership} onValueChange={handleOwnershipChange}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="All Webhooks" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Webhooks</SelectItem>
                                        <SelectItem value="owned">My Webhooks</SelectItem>
                                        <SelectItem value="shared">Shared With Me</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                ) : filteredWebhooks.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Search className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No webhooks found</h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                No webhooks match your current filters. Try adjusting your search or filters.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredWebhooks.map((webhook) => (
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
                                                {webhook.description && (
                                                    <CardDescription className="line-clamp-1">
                                                        {webhook.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                        {webhook.is_owner ? (
                                            <Badge variant="default" className="gap-1">
                                                <Crown className="h-3 w-3" />
                                                Owner
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                {webhook.permission_level === 'edit' ? 'Editor' : 'Viewer'}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {webhook.tags && webhook.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {webhook.tags.map((tag: string, index: number) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>{webhook.message_history_count} messages sent</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/webhooks/${webhook.id}/send`} className="flex-1">
                                            <Button variant="default" size="lg" className="w-full gap-2">
                                                <Send className="h-4 w-4" />
                                                Send Message
                                            </Button>
                                        </Link>
                                        <Link href={`/webhooks/${webhook.id}`}>
                                            <Button variant="outline" size="lg">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="flex gap-2">
                                        {(webhook.is_owner || webhook.permission_level === 'edit') && (
                                            <Link href={`/webhooks/${webhook.id}/edit`}>
                                                <Button variant="outline" size="lg">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        )}
                                        {webhook.is_owner ? (
                                            <>
                                                <Link href={`/webhooks/${webhook.id}/collaborators`}>
                                                    <Button variant="outline" size="lg">
                                                        <Users className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="lg"
                                                    onClick={() => handleDeleteClick(webhook.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                onClick={() => handleLeaveClick(webhook.id)}
                                                className="gap-2"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Leave
                                            </Button>
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

                {/* Leave Confirmation Dialog */}
                <ConfirmDialog
                    open={leaveDialogOpen}
                    onOpenChange={setLeaveDialogOpen}
                    onConfirm={handleConfirmLeave}
                    title="Leave Webhook"
                    description="Are you sure you want to leave this webhook? You will lose access to it immediately."
                    confirmText="Leave"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </AppLayout>
    );
}
