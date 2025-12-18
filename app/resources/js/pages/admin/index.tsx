import { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Users, Shield, Webhook as WebhookIcon, MessageSquare, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface AdminProps {
    stats: {
        totalUsers: number;
        adminUsers: number;
        totalWebhooks: number;
        totalMessages: number;
    };
    recentUsers: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: string;
    }>;
}

export default function AdminIndex({ stats, recentUsers }: AdminProps) {
    const { settings } = usePage<any>().props;

    const { data, setData, post, processing } = useForm({
        registration_enabled: settings.registration_enabled,
        password_reset_enabled: settings.password_reset_enabled,
    });

    const [deleteDTO, setDeleteDTO] = useState<{ open: boolean; user: AdminProps['recentUsers'][0] | null }>({
        open: false,
        user: null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings');
    };

    const confirmDelete = () => {
        if (deleteDTO.user) {
            router.delete(`/admin/users/${deleteDTO.user.id}`, {
                onFinish: () => setDeleteDTO({ open: false, user: null }),
            });
        }
    };

    const openDeleteDialog = (user: AdminProps['recentUsers'][0]) => {
        setDeleteDTO({ open: true, user });
    };

    return (
        <AppLayout>
            <Head title="Admin Panel" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Admin Panel</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage users and monitor system activity
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.adminUsers} admin{stats.adminUsers !== 1 ? 's' : ''}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Admin Users
                            </CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.adminUsers}</div>
                            <p className="text-xs text-muted-foreground">
                                System administrators
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Webhooks
                            </CardTitle>
                            <WebhookIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalWebhooks}</div>
                            <p className="text-xs text-muted-foreground">
                                Across all users
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Messages Sent
                            </CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalMessages}</div>
                            <p className="text-xs text-muted-foreground">
                                Total messages
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {  /* Recent Users */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                        <CardDescription>
                            Latest registered users in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {user.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {user.role === 'admin' ? (
                                            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-100">
                                                <Shield className="mr-1 h-3 w-3" />
                                                Admin
                                            </span>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteDialog(user)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Settings Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <SettingsIcon className="h-5 w-5" />
                            System Settings
                        </CardTitle>
                        <CardDescription>
                            Configure registration and password reset features
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="registration" className="text-base">
                                        User Registration
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow new users to create accounts
                                    </p>
                                </div>
                                <Switch
                                    id="registration"
                                    checked={data.registration_enabled}
                                    onCheckedChange={(checked) => setData('registration_enabled', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="password-reset" className="text-base">
                                        Password Reset
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow users to reset their passwords
                                    </p>
                                </div>
                                <Switch
                                    id="password-reset"
                                    checked={data.password_reset_enabled}
                                    onCheckedChange={(checked) => setData('password_reset_enabled', checked)}
                                />
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDTO.open}
                onOpenChange={(open) => setDeleteDTO((prev) => ({ ...prev, open }))}
                onConfirm={confirmDelete}
                title="Delete User"
                description={`Are you sure you want to delete ${deleteDTO.user?.name}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </AppLayout>
    );
}
