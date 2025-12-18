import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Webhook, MessageSquare, Activity, PlusIcon, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Toast } from '@/components/ui/toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Stats {
    totalWebhooks: number;
    activeWebhooks: number;
    totalMessages: number;
}

interface WebhookData {
    id: number;
    name: string;
    avatar_url?: string;
    created_at: string;
}

interface DashboardProps {
    stats: Stats;
    recentWebhooks: WebhookData[];
}

export default function Dashboard({ stats, recentWebhooks }: DashboardProps) {
    const page = usePage<any>();
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Show success/error messages
    useEffect(() => {
        if (page.props.flash?.success) {
            setNotification({ message: page.props.flash.success, type: 'success' });
        } else if (page.props.flash?.error) {
            setNotification({ message: page.props.flash.error, type: 'error' });
        }
    }, [page.props.flash?.success, page.props.flash?.error]);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {/* Toast Notification */}
            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground mt-1">
                            Welcome back! Here's an overview of your webhooks
                        </p>
                    </div>
                    <Link href="/webhooks/create">
                        <Button size="lg" className="gap-2">
                            <PlusIcon className="h-5 w-5" />
                            New Webhook
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Webhooks
                            </CardTitle>
                            <Webhook className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalWebhooks}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.activeWebhooks} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Webhooks
                            </CardTitle>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.activeWebhooks}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Ready to send messages
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Messages Sent
                            </CardTitle>
                            <MessageSquare className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalMessages}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                All time total
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Webhooks */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Webhooks</CardTitle>
                                <CardDescription>
                                    Your most recently created webhooks
                                </CardDescription>
                            </div>
                            <Link href="/webhooks">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    View All
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentWebhooks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Webhook className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground mb-4">
                                    No webhooks yet. Create your first one to get started!
                                </p>
                                <Link href="/webhooks/create">
                                    <Button className="gap-2">
                                        <PlusIcon className="h-4 w-4" />
                                        Create Webhook
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentWebhooks.map((webhook) => (
                                    <div
                                        key={webhook.id}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {webhook.avatar_url ? (
                                                <img
                                                    src={webhook.avatar_url}
                                                    alt={webhook.name}
                                                    className="h-10 w-10 rounded-full"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <Webhook className="h-5 w-5 text-white" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">{webhook.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Created {new Date(webhook.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Link href={`/webhooks/${webhook.id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    Manage
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Link href="/webhooks">
                        <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Webhook className="h-5 w-5" />
                                    Manage Webhooks
                                </CardTitle>
                                <CardDescription>
                                    View and manage all your Discord webhooks
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    View Webhooks
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/send">
                        <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 h-full bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-blue-500" />
                                    Quick Send
                                </CardTitle>
                                <CardDescription>
                                    Send a message quickly without navigating
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full gap-2">
                                    Send Message
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
