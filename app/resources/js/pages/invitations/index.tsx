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
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invitations',
        href: '/invitations',
    },
];

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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Webhook Invitations" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Webhook Invitations</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        You have been invited to collaborate on the following webhooks
                    </p>
                </div>

                {invitations.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Mail className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                No pending invitations
                            </h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                You don't have any pending webhook invitations at the moment.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
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
                                                <p className="text-muted-foreground">
                                                    Invited by
                                                </p>
                                                <p className="font-medium">
                                                    {invitation.inviter.name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Permission Level
                                                </p>
                                                <p className="font-medium">
                                                    {getPermissionDescription(
                                                        invitation.permission_level
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                Expires on{' '}
                                                {new Date(
                                                    invitation.expires_at
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                            <Button
                                                onClick={() => handleAccept(invitation.token)}
                                                className="w-full sm:flex-1"
                                            >
                                                <Check className="h-4 w-4 mr-2" />
                                                Accept Invitation
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleDecline(invitation.token)}
                                                className="w-full sm:flex-1"
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
        </AppLayout>
    );
}
