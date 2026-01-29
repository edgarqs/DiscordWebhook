import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Webhook, User } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useState } from 'react';

interface WebhookData {
    id: number;
    name: string;
    description: string | null;
    user_id: number;
}

interface Inviter {
    id: number;
    name: string;
}

interface Invitation {
    id: number;
    token: string;
    webhook: WebhookData;
    inviter: Inviter;
    permission_level: 'admin' | 'editor' | 'viewer';
    expires_at: string;
    created_at: string;
}

interface Props {
    invitation: Invitation;
}

export default function ShowInvitation({ invitation }: Props) {
    const [declineDialogOpen, setDeclineDialogOpen] = useState(false);

    const handleAccept = () => {
        router.post(`/invitations/${invitation.token}/accept`);
    };

    const handleDeclineClick = () => {
        setDeclineDialogOpen(true);
    };

    const handleDeclineConfirm = () => {
        router.post(`/invitations/${invitation.token}/decline`, {}, {
            onFinish: () => {
                setDeclineDialogOpen(false);
            },
        });
    };

    const getPermissionBadge = (level: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
            admin: 'default',
            editor: 'secondary',
            viewer: 'outline',
        };
        return (
            <Badge variant={variants[level] || 'outline'} className="text-base px-3 py-1">
                {level.charAt(0).toUpperCase() + level.slice(1)}
            </Badge>
        );
    };

    const getPermissionDescription = (level: string) => {
        const descriptions: Record<string, string[]> = {
            admin: [
                'Manage collaborators and invitations',
                'Edit webhook settings',
                'Send messages via webhook',
                'Delete webhook',
            ],
            editor: [
                'Edit webhook settings',
                'Send messages via webhook',
                'View message history',
            ],
            viewer: [
                'View webhook details',
                'View message history',
                'Read-only access',
            ],
        };
        return descriptions[level] || [];
    };

    return (
        <AppLayout>
            <Head title="Webhook Invitation" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <Card className="border-2">
                        <CardHeader className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <Webhook className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">
                                            Webhook Invitation
                                        </CardTitle>
                                        <CardDescription className="text-base mt-1">
                                            You've been invited to collaborate
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Webhook Info */}
                            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        {invitation.webhook.name}
                                    </h3>
                                    {invitation.webhook.description && (
                                        <p className="text-muted-foreground">
                                            {invitation.webhook.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>
                                        Invited by <strong>{invitation.inviter.name}</strong>
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        Expires on{' '}
                                        {new Date(invitation.expires_at).toLocaleDateString(
                                            'en-US',
                                            {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            }
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Permission Level */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">Your Permission Level</h4>
                                    {getPermissionBadge(invitation.permission_level)}
                                </div>

                                <div className="bg-muted/30 rounded-lg p-4">
                                    <p className="text-sm font-medium mb-3">
                                        As a{' '}
                                        <span className="capitalize">
                                            {invitation.permission_level}
                                        </span>
                                        , you will be able to:
                                    </p>
                                    <ul className="space-y-2">
                                        {getPermissionDescription(
                                            invitation.permission_level
                                        ).map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-2 text-sm"
                                            >
                                                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button onClick={handleAccept} size="lg" className="flex-1">
                                    <Check className="h-5 w-5 mr-2" />
                                    Accept Invitation
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleDeclineClick}
                                    size="lg"
                                    className="flex-1"
                                >
                                    <X className="h-5 w-5 mr-2" />
                                    Decline
                                </Button>
                            </div>

                            <p className="text-xs text-center text-muted-foreground pt-2">
                                By accepting this invitation, you agree to collaborate on this
                                webhook with the specified permissions.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Decline Confirmation Dialog */}
            <ConfirmDialog
                open={declineDialogOpen}
                onOpenChange={setDeclineDialogOpen}
                onConfirm={handleDeclineConfirm}
                title="Decline Invitation"
                description="Are you sure you want to decline this invitation? You won't be able to access this webhook unless you're invited again."
                confirmText="Decline"
                cancelText="Cancel"
                variant="destructive"
            />
        </AppLayout>
    );
}
