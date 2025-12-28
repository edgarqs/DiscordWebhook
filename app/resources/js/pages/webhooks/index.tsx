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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
            setDeleteDialogOpen(false);
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

        // Search filter (name + tags)
        if (search) {
            const searchLower = search.toLowerCase();
            const nameMatch = webhook.name.toLowerCase().includes(searchLower);
            const tagMatch = webhook.tags?.some(tag => tag.toLowerCase().includes(searchLower));

            if (!nameMatch && !tagMatch) return false;
        }

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
                            <Link key={webhook.id} href={`/webhooks/${webhook.id}`}>
                                <Card className="group hover:shadow-lg transition-all duration-200 flex flex-col cursor-pointer">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                {webhook.avatar_url ? (
                                                    <img
                                                        src={webhook.avatar_url}
                                                        alt={webhook.name}
                                                        className="h-8 w-8 rounded-full shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                                                        <Webhook className="h-4 w-4 text-white" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/webhooks/${webhook.id}`}>
                                                        <CardTitle className="text-sm truncate leading-tight hover:text-primary transition-colors cursor-pointer">
                                                            {webhook.name}
                                                        </CardTitle>
                                                    </Link>
                                                    {!webhook.is_owner && webhook.owner && (
                                                        <p className="text-[10px] text-muted-foreground leading-tight">
                                                            by {webhook.owner.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {webhook.is_owner ? (
                                                <Badge variant="default" className="gap-0.5 shrink-0 text-[10px] h-5 px-1.5">
                                                    <Crown className="h-2.5 w-2.5" />
                                                    Owner
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="shrink-0 text-[10px] h-5 px-1.5">
                                                    {webhook.permission_level === 'edit' ? 'Editor' : 'Viewer'}
                                                </Badge>
                                            )}
                                        </div>
                                        {webhook.description && (
                                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
                                                {webhook.description}
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="flex flex-col flex-1 pt-0">
                                        <div className="space-y-2 flex-1">
                                            {webhook.tags && webhook.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {webhook.tags.map((tag: string, index: number) => (
                                                        <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground border-t pt-2">
                                                <Send className="h-3 w-3" />
                                                <span>{webhook.message_history_count} messages</span>
                                            </div>
                                        </div>

                                        {/* Actions - Always at bottom */}
                                        <TooltipProvider delayDuration={300}>
                                            <div className="flex gap-1.5 mt-2">
                                                <Link href={`/webhooks/${webhook.id}/send`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="default" size="sm" className="w-full h-8 gap-1.5">
                                                        <Send className="h-3.5 w-3.5" />
                                                        <span className="text-xs">Send</span>
                                                    </Button>
                                                </Link>

                                                {(webhook.is_owner || webhook.permission_level === 'editor' || webhook.permission_level === 'admin') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link href={`/webhooks/${webhook.id}/edit`} onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                                    <Edit className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit Webhook</TooltipContent>
                                                    </Tooltip>
                                                )}

                                                {(webhook.is_owner || webhook.permission_level === 'admin') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link href={`/webhooks/${webhook.id}/collaborators`} onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                                    <Users className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Share Webhook</TooltipContent>
                                                    </Tooltip>
                                                )}

                                                {webhook.is_owner ? (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    handleDeleteClick(webhook.id);
                                                                }}
                                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Delete Webhook</TooltipContent>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    handleLeaveClick(webhook.id);
                                                                }}
                                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <LogOut className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Leave Webhook</TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TooltipProvider>
                                    </CardContent>
                                </Card>
                            </Link>
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
