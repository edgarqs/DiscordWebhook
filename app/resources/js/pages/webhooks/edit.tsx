import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Webhook } from 'lucide-react';

interface WebhookData {
    id: number;
    name: string;
    webhook_url: string;
    avatar_url?: string;
    description?: string;
    tags?: string[];
    is_active: boolean;
}

interface Props {
    webhook: WebhookData;
}

export default function WebhooksEdit({ webhook }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: webhook.name,
        webhook_url: webhook.webhook_url,
        avatar_url: webhook.avatar_url || '',
        description: webhook.description || '',
        tags: webhook.tags || [],
        is_active: webhook.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/webhooks/${webhook.id}`);
    };

    const handleTagsChange = (value: string) => {
        const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
        setData('tags', tags);
    };

    return (
        <AppLayout>
            <Head title={`Edit ${webhook.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/webhooks">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Webhook</h1>
                        <p className="text-muted-foreground mt-1">
                            Update your webhook settings
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
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
                                <CardTitle>Webhook Details</CardTitle>
                                <CardDescription>
                                    Update your Discord webhook settings
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Two Column Grid for All Fields */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Webhook Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="My Discord Webhook"
                                        className={errors.name ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                {/* Avatar URL */}
                                <div className="space-y-2">
                                    <Label htmlFor="avatar_url">Avatar URL (Optional)</Label>
                                    <Input
                                        id="avatar_url"
                                        type="url"
                                        value={data.avatar_url}
                                        onChange={(e) => setData('avatar_url', e.target.value)}
                                        placeholder="https://example.com/avatar.png"
                                        className={errors.avatar_url ? 'border-destructive' : ''}
                                    />
                                    {errors.avatar_url && (
                                        <p className="text-sm text-destructive">{errors.avatar_url}</p>
                                    )}
                                </div>

                                {/* Webhook URL - Spans both columns */}
                                <div className="space-y-2 lg:col-span-2">
                                    <Label htmlFor="webhook_url">Discord Webhook URL *</Label>
                                    <Input
                                        id="webhook_url"
                                        type="url"
                                        value={data.webhook_url}
                                        onChange={(e) => setData('webhook_url', e.target.value)}
                                        placeholder="https://discord.com/api/webhooks/..."
                                        className={errors.webhook_url ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.webhook_url && (
                                        <p className="text-sm text-destructive">{errors.webhook_url}</p>
                                    )}
                                </div>

                                {/* Description - Left Column */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Describe what this webhook is used for..."
                                        rows={4}
                                        className={errors.description ? 'border-destructive' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">{errors.description}</p>
                                    )}
                                </div>

                                {/* Tags - Right Column */}
                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags (Optional)</Label>
                                    <Input
                                        id="tags"
                                        type="text"
                                        defaultValue={data.tags.join(', ')}
                                        onChange={(e) => handleTagsChange(e.target.value)}
                                        placeholder="announcements, notifications, alerts"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Separate tags with commas
                                    </p>
                                </div>

                                {/* Active Status - Spans both columns */}
                                <div className="lg:col-span-2">
                                    <div className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active" className="text-base font-semibold">Active Status</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Enable or disable this webhook
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked: boolean) => setData('is_active', checked)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <Button type="submit" disabled={processing} size="lg" className="flex-1">
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Link href="/webhooks">
                                    <Button type="button" variant="outline" size="lg">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
