import { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Users, Shield, Webhook as WebhookIcon, MessageSquare, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
        can_use_ai: boolean;
        created_at: string;
    }>;
    settings: {
        registration_enabled: boolean;
        password_reset_enabled: boolean;
        ai_provider: string;
        openai_api_key?: string;
        gemini_api_key?: string;
        ai_daily_limit: number;
    };
}

export default function AdminIndex({ stats, recentUsers, settings }: AdminProps) {

    const { data, setData, post, processing } = useForm({
        registration_enabled: settings.registration_enabled,
        password_reset_enabled: settings.password_reset_enabled,
        ai_provider: settings.ai_provider || 'openai',
        openai_api_key: settings.openai_api_key || '',
        gemini_api_key: settings.gemini_api_key || '',
        ai_daily_limit: settings.ai_daily_limit || 5,
    });

    const [deleteDTO, setDeleteDTO] = useState<{ open: boolean; user: any | null }>({
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

    const toggleAiAccess = (user: any) => {
        router.post(`/admin/users/${user.id}/toggle-ai`, {}, {
            preserveScroll: true,
        });
    };

    const openDeleteDialog = (user: any) => {
        setDeleteDTO({ open: true, user });
    };

    return (
        <AppLayout>
            <Head title="Admin Panel" />

            <div className="p-6 space-y-6">
                {/* Header and Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Admins</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.adminUsers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
                            <WebhookIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalWebhooks}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Messages</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalMessages}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Users */}
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
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium leading-none">
                                                {user.name}
                                            </p>
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-[10px] font-medium text-blue-800 dark:text-blue-100">
                                                    Admin
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${user.can_use_ai ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                        AI {user.can_use_ai ? 'On' : 'Off'}
                                                    </span>
                                                    <Switch
                                                        className="scale-[0.6] origin-left"
                                                        checked={user.can_use_ai}
                                                        onCheckedChange={() => toggleAiAccess(user)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {user.role !== 'admin' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteDialog(user)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 h-7 w-7 p-0"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <span className="text-[10px] text-muted-foreground">
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
                            Configure core features and AI parameters
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">General Settings</h3>
                                    <div className="space-y-4">
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
                                    </div>
                                </div>

                                <div className="space-y-6 border-l pl-8">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Configuration</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>AI Provider</Label>
                                            <Select
                                                value={data.ai_provider}
                                                onValueChange={(value) => setData('ai_provider', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select AI Provider" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="gemini">Google Gemini</SelectItem>
                                                    <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {data.ai_provider === 'openai' ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="openai_api_key">OpenAI API Key</Label>
                                                <Input
                                                    id="openai_api_key"
                                                    type="password"
                                                    value={data.openai_api_key}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('openai_api_key', e.target.value)}
                                                    placeholder="sk-..."
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Used for content generation via OpenAI
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Label htmlFor="gemini_api_key">Gemini API Key</Label>
                                                <Input
                                                    id="gemini_api_key"
                                                    type="password"
                                                    value={data.gemini_api_key}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('gemini_api_key', e.target.value)}
                                                    placeholder="AIza..."
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Used for content generation via Google Gemini
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-2 pt-4 border-t">
                                            <Label htmlFor="ai_daily_limit">Daily Usage Limit (Non-Admins)</Label>
                                            <Input
                                                id="ai_daily_limit"
                                                type="number"
                                                min="1"
                                                max="1000"
                                                value={data.ai_daily_limit}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('ai_daily_limit', parseInt(e.target.value) || 1)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Maximum number of AI generations per user per day.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button type="submit" disabled={processing} size="lg">
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </Button>
                            </div>
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
