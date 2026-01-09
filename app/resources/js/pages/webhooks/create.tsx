import { FormEventHandler, useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { startWebhookCreationTour, isTourCompleted } from '@/lib/driver-config';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Webhook, RefreshCw } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Webhooks',
        href: '/webhooks',
    },
    {
        title: 'Create',
        href: '/create',
    },
];

export default function WebhooksCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        webhook_url: '',
        avatar_url: '',
        description: '',
        tags: [] as string[],
    });

    const page = usePage<any>();
    const [fetching, setFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Auto-start tour for first-time users
    useEffect(() => {
        if (!isTourCompleted('webhook-creation')) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                // Check if user has webhooks from page props
                const hasWebhooks = page.props.auth?.user?.webhooks_count > 0;
                startWebhookCreationTour(hasWebhooks);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/webhooks');
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
                // Auto-fill name and avatar if empty
                if (!data.name && response.data.data.name) {
                    setData('name', response.data.data.name);
                }
                if (!data.avatar_url && response.data.data.avatar_url) {
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
            <Head title="Create Webhook" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/webhooks">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create Webhook</h1>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                            Add a new Discord webhook to your collection
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Webhook className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle>Webhook Details</CardTitle>
                                <CardDescription>
                                    Configure your Discord webhook settings
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Two Column Grid for All Fields */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Webhook Name *</Label>
                                    <Input
                                        id="name"
                                        data-driver="webhook-name"
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
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Input
                                            id="webhook_url"
                                            data-driver="webhook-url"
                                            type="url"
                                            value={data.webhook_url}
                                            onChange={(e) => setData('webhook_url', e.target.value)}
                                            placeholder="https://discord.com/api/webhooks/..."
                                            className={errors.webhook_url ? 'border-destructive' : ''}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            data-driver="fetch-button"
                                            variant="outline"
                                            onClick={fetchFromDiscord}
                                            disabled={fetching || !data.webhook_url}
                                            className="w-full gap-2 whitespace-nowrap sm:w-auto"
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
                                    <p className="text-sm text-muted-foreground">
                                        Get this from Discord: Server Settings → Integrations → Webhooks
                                    </p>
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
                                        onChange={(e) => handleTagsChange(e.target.value)}
                                        placeholder="announcements, notifications, alerts"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Separate tags with commas
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
                                <Button type="submit" data-driver="submit-button" disabled={processing} size="lg" className="flex-1">
                                    {processing ? 'Creating...' : 'Create Webhook'}
                                </Button>
                                <Link href="/webhooks" className="w-full sm:w-auto">
                                    <Button type="button" variant="outline" size="lg" className="w-full">
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
