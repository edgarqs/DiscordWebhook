import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Webhook, RefreshCw } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface WebhookData {
    id: number;
    name: string;
    webhook_url: string;
    avatar_url?: string;
    description?: string;
    tags?: string[];
}

interface Props {
    webhook: WebhookData;
}

export default function WebhooksEdit({ webhook }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Webhooks',
            href: '/webhooks',
        },
        {
            title: 'Edit',
            href: `/webhooks/${webhook.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: webhook.name,
        webhook_url: webhook.webhook_url,
        avatar_url: webhook.avatar_url || '',
        description: webhook.description || '',
        tags: webhook.tags || [],
    });

    const [isWebhookUrlFocused, setIsWebhookUrlFocused] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/webhooks/${webhook.id}`);
    };

    const handleTagsChange = (value: string) => {
        const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
        setData('tags', tags);
    };

    const fetchFromDiscord = async () => {
        if (!data.webhook_url) {
            setFetchError('Please enter a webhook URL first');
            return;
        }

        setFetching(true);
        setFetchError(null);

        try {
            const response = await axios.post('/webhooks/validate', {
                webhook_url: data.webhook_url
            });

            if (response.data.success) {
                // Update name and avatar from Discord
                if (response.data.data.name) {
                    setData('name', response.data.data.name);
                }
                if (response.data.data.avatar_url) {
                    setData('avatar_url', response.data.data.avatar_url);
                }
                setFetchError(null);
            } else {
                setFetchError(response.data.message || 'Failed to validate webhook');
            }
        } catch (error: any) {
            console.error('Validation error:', error);
            const message = error.response?.data?.message || error.message || 'Failed to validate webhook';
            setFetchError(message);
        } finally {
            setFetching(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${webhook.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/webhooks/${webhook.id}`}>
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
                                    <div className="flex gap-2">
                                        <Input
                                            id="webhook_url"
                                            type="url"
                                            value={data.webhook_url}
                                            onChange={(e) => setData('webhook_url', e.target.value)}
                                            onFocus={() => setIsWebhookUrlFocused(true)}
                                            onBlur={() => setIsWebhookUrlFocused(false)}
                                            placeholder="https://discord.com/api/webhooks/..."
                                            className={errors.webhook_url ? 'border-destructive' : ''}
                                            style={{
                                                filter: isWebhookUrlFocused ? 'none' : 'blur(4px)',
                                                transition: 'filter 0.2s ease-in-out',
                                            }}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={fetchFromDiscord}
                                            disabled={fetching || !data.webhook_url}
                                            className="gap-2 whitespace-nowrap"
                                        >
                                            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
                                            {fetching ? 'Fetching...' : 'Fetch from Discord'}
                                        </Button>
                                    </div>
                                    {errors.webhook_url && (
                                        <p className="text-sm text-destructive">{errors.webhook_url}</p>
                                    )}
                                    {fetchError && (
                                        <p className="text-sm text-destructive">{fetchError}</p>
                                    )}
                                    {!isWebhookUrlFocused && (
                                        <p className="text-xs text-muted-foreground">
                                            🔒 Webhook URL is blurred for security. Click to reveal.
                                        </p>
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
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <Button type="submit" disabled={processing} size="lg" className="flex-1">
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Link href={`/webhooks/${webhook.id}`}>
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
