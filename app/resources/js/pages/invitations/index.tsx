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
import { Mail, Check, X, Clock } from 'lucide-react';

interface Webhook {
    id: number;
    name: string;
    description: string | null;
}

interface Inviter {
    id: number;
    name: string;
}

interface Invitation {
    id: number;
    token: string;
    webhook: Webhook;
    inviter: Inviter;
    permission_level: 'admin' | 'editor' | 'viewer';
    expires_at: string;
    created_at: string;
}

interface Props {
    invitations: Invitation[];
}

export default function Invitations({ invitations }: Props) {
    const handleAccept = (token: string) => {
        router.post(`/invitations/${token}/accept`);
    };

    const handleDecline = (token: string) => {
        if (confirm('Are you sure you want to decline this invitation?')) {
            router.post(`/invitations/${token}/decline`);
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

    const getPermissionDescription = (level: string) => {
        const descriptions: Record<string, string> = {
            admin: 'Full access - manage collaborators, edit, and send messages',
            editor: 'Can edit webhook settings and send messages',
            viewer: 'Can only view webhook and message history',
        };
        return descriptions[level] || '';
    };

    return (
        <AppLayout>
            <Head title="Webhook Invitations" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Webhook Invitations
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            You have been invited to collaborate on the following webhooks
                        </p>
                    </div>

                    {invitations.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <Mail className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        No pending invitations
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        You don't have any pending webhook invitations at the moment.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {invitations.map((invitation) => (
                                <Card key={invitation.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle>{invitation.webhook.name}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {invitation.webhook.description ||
                                                        'No description provided'}
                                                </CardDescription>
                                            </div>
                                            {getPermissionBadge(invitation.permission_level)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        Invited by
                                                    </p>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {invitation.inviter.name}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        Permission Level
                                                    </p>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {getPermissionDescription(
                                                            invitation.permission_level
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    Expires on{' '}
                                                    {new Date(
                                                        invitation.expires_at
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <Button
                                                    onClick={() => handleAccept(invitation.token)}
                                                    className="flex-1"
                                                >
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Accept Invitation
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleDecline(invitation.token)}
                                                    className="flex-1"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Decline
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
