import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Trash2, UserPlus, Mail, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';

const getBreadcrumbs = (webhookId: number, webhookName: string): BreadcrumbItem[] => [
    {
        title: 'Webhooks',
        href: '/webhooks',
    },
    {
        title: webhookName,
        href: `/webhooks/${webhookId}`,
    },
    {
        title: 'Collaborators',
        href: `/webhooks/${webhookId}/collaborators`,
    },
];

interface User {
    id: number;
    name: string;
    email: string;
}

interface Collaborator {
    id: number;
    user: User;
    permission_level: 'admin' | 'editor' | 'viewer';
    invited_at: string;
    accepted_at: string | null;
}

interface Invitation {
    id: number;
    invitee_email: string;
    permission_level: 'admin' | 'editor' | 'viewer';
    status: string;
    expires_at: string;
    created_at: string;
}

interface Webhook {
    id: number;
    name: string;
    description: string | null;
    owner: User;
}

interface Props {
    webhook: Webhook;
    collaborators: Collaborator[];
    pendingInvitations: Invitation[];
}

export default function Collaborators({
    webhook,
    collaborators,
    pendingInvitations,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        permission_level: 'viewer' as 'admin' | 'editor' | 'viewer',
    });

    const [cancelInvitationDialog, setCancelInvitationDialog] = useState(false);
    const [invitationToCancel, setInvitationToCancel] = useState<number | null>(null);

    const [removeCollaboratorDialog, setRemoveCollaboratorDialog] = useState(false);
    const [collaboratorToRemove, setCollaboratorToRemove] = useState<number | null>(null);

    const breadcrumbs = getBreadcrumbs(webhook.id, webhook.name);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/webhooks/${webhook.id}/collaborators`, {
            onSuccess: () => reset(),
        });
    };

    const handleUpdatePermission = (collaboratorId: number, newLevel: string) => {
        router.patch(
            `/webhooks/${webhook.id}/collaborators/${collaboratorId}`,
            { permission_level: newLevel },
            { preserveScroll: true }
        );
    };

    const handleRemoveCollaboratorClick = (collaboratorId: number) => {
        setCollaboratorToRemove(collaboratorId);
        setRemoveCollaboratorDialog(true);
    };

    const handleConfirmRemoveCollaborator = () => {
        if (collaboratorToRemove) {
            router.delete(
                `/webhooks/${webhook.id}/collaborators/${collaboratorToRemove}`,
                {
                    preserveScroll: true,
                    onFinish: () => {
                        setCollaboratorToRemove(null);
                        setRemoveCollaboratorDialog(false);
                    }
                }
            );
        }
    };

    const handleCancelInvitationClick = (invitationId: number) => {
        setInvitationToCancel(invitationId);
        setCancelInvitationDialog(true);
    };

    const handleConfirmCancelInvitation = () => {
        if (invitationToCancel) {
            router.delete(`/invitations/${invitationToCancel}`, {
                preserveScroll: true,
                onFinish: () => {
                    setInvitationToCancel(null);
                    setCancelInvitationDialog(false);
                }
            });
        }
    };

    const getPermissionBadge = (level: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
            admin: 'default',
            editor: 'secondary',
            viewer: 'outline',
        };
        return (
            <Badge variant={variants[level] || 'outline'}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Collaborators - ${webhook.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manage Collaborators</h1>
                        <p className="text-muted-foreground mt-1">
                            Webhook: <span className="font-medium">{webhook.name}</span>
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Owner: <span className="font-medium">{webhook.owner.name}</span>
                        </p>
                    </div>
                    <Link href={`/webhooks/${webhook.id}`}>
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Webhook
                        </Button>
                    </Link>
                </div>

                {/* Invite New Collaborator */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Invite Collaborator
                        </CardTitle>
                        <CardDescription>
                            Invite users by email to collaborate on this webhook
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="user@example.com"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="permission_level">Permission Level</Label>
                                    <Select
                                        value={data.permission_level}
                                        onValueChange={(value: any) =>
                                            setData('permission_level', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="viewer">
                                                Viewer - Can only view
                                            </SelectItem>
                                            <SelectItem value="editor">
                                                Editor - Can edit and send messages
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                Admin - Full access except delete
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button type="submit" disabled={processing}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Invitation
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Pending Invitations
                            </CardTitle>
                            <CardDescription>
                                Invitations waiting for acceptance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Permission</TableHead>
                                        <TableHead>Sent</TableHead>
                                        <TableHead>Expires</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingInvitations.map((invitation) => (
                                        <TableRow key={invitation.id}>
                                            <TableCell className="font-medium">
                                                {invitation.invitee_email}
                                            </TableCell>
                                            <TableCell>
                                                {getPermissionBadge(invitation.permission_level)}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    invitation.created_at
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    invitation.expires_at
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleCancelInvitationClick(invitation.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Current Collaborators */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Current Collaborators
                        </CardTitle>
                        <CardDescription>
                            Users with access to this webhook
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {collaborators.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <UserPlus className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground mb-4">
                                    No collaborators yet. Invite someone to get started!
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Permission</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {collaborators.map((collaborator) => (
                                        <TableRow key={collaborator.id}>
                                            <TableCell className="font-medium">
                                                {collaborator.user.name}
                                            </TableCell>
                                            <TableCell>{collaborator.user.email}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={collaborator.permission_level}
                                                    onValueChange={(value) =>
                                                        handleUpdatePermission(
                                                            collaborator.id,
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="viewer">
                                                            Viewer
                                                        </SelectItem>
                                                        <SelectItem value="editor">
                                                            Editor
                                                        </SelectItem>
                                                        <SelectItem value="admin">
                                                            Admin
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                {collaborator.accepted_at
                                                    ? new Date(
                                                        collaborator.accepted_at
                                                    ).toLocaleDateString()
                                                    : 'Pending'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleRemoveCollaboratorClick(
                                                            collaborator.id
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Cancel Invitation Dialog */}
                <ConfirmDialog
                    open={cancelInvitationDialog}
                    onOpenChange={setCancelInvitationDialog}
                    onConfirm={handleConfirmCancelInvitation}
                    title="Cancel Invitation"
                    description="Are you sure you want to cancel this invitation? The recipient will no longer be able to accept it."
                    confirmText="Cancel Invitation"
                    cancelText="Keep Invitation"
                    variant="destructive"
                />

                {/* Remove Collaborator Dialog */}
                <ConfirmDialog
                    open={removeCollaboratorDialog}
                    onOpenChange={setRemoveCollaboratorDialog}
                    onConfirm={handleConfirmRemoveCollaborator}
                    title="Remove Collaborator"
                    description="Are you sure you want to remove this collaborator? They will lose access to this webhook immediately."
                    confirmText="Remove"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </AppLayout>
    );
}
