import { FormEventHandler, useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Webhook as WebhookIcon } from 'lucide-react';
import { Webhook } from '@/types';
import { Toast } from '@/components/ui/toast';

interface SendProps {
    webhooks: Webhook[];
}

export default function QuickSend({ webhooks }: SendProps) {
    const page = usePage<any>();
    const [mode, setMode] = useState<'existing' | 'temporary'>('existing');
    const [selectedWebhookId, setSelectedWebhookId] = useState<number | null>(
        webhooks.length > 0 ? webhooks[0].id : null
    );
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        webhook_id: webhooks.length > 0 ? webhooks[0].id : null,
        temporary_webhook_url: '',
        temporary_name: '',
        temporary_avatar: '',
        content: '',
        embeds: [] as any[],
    });

    const [activeTab, setActiveTab] = useState<'content' | 'embeds'>('content');

    // Show success/error messages
    useEffect(() => {
        if (page.props.flash?.success) {
            setNotification({ message: page.props.flash.success, type: 'success' });
            // Reset form after successful send
            reset('content', 'embeds');
            setData('embeds', []);
        } else if (page.props.flash?.error) {
            setNotification({ message: page.props.flash.error, type: 'error' });
        }
    }, [page.props.flash]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (mode === 'existing' && selectedWebhookId) {
            post(`/webhooks/${selectedWebhookId}/send`);
        } else if (mode === 'temporary' && data.temporary_webhook_url) {
            post('/send/temporary');
        }
    };

    const addEmbed = () => {
        setData('embeds', [
            ...data.embeds,
            {
                title: '',
                description: '',
                color: 5814783,
            },
        ]);
    };

    const removeEmbed = (index: number) => {
        const newEmbeds = data.embeds.filter((_, i) => i !== index);
        setData('embeds', newEmbeds);
    };

    const updateEmbed = (index: number, field: string, value: any) => {
        const newEmbeds = [...data.embeds];
        newEmbeds[index] = { ...newEmbeds[index], [field]: value };
        setData('embeds', newEmbeds);
    };

    return (
        <AppLayout>
            <Head title="Quick Send Message" />

            {/* Toast Notification */}
            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Quick Send</h1>
                    <p className="text-muted-foreground">
                        Send a message quickly using an existing webhook or a temporary one
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Webhook Selection - Full Width */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Webhook</CardTitle>
                            <CardDescription>
                                Choose an existing webhook or use a temporary URL
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={mode === 'existing' ? 'default' : 'outline'}
                                    onClick={() => setMode('existing')}
                                    className="flex-1"
                                >
                                    Use Existing Webhook
                                </Button>
                                <Button
                                    type="button"
                                    variant={mode === 'temporary' ? 'default' : 'outline'}
                                    onClick={() => setMode('temporary')}
                                    className="flex-1"
                                >
                                    Temporary URL
                                </Button>
                            </div>

                            {mode === 'existing' ? (
                                <div className="space-y-2">
                                    {webhooks.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No webhooks available</p>
                                            <Link href="/webhooks/create">
                                                <Button className="mt-4" type="button">
                                                    Create Webhook
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div>
                                            <Label htmlFor="webhook_select">Select Webhook</Label>
                                            <select
                                                id="webhook_select"
                                                value={selectedWebhookId || ''}
                                                onChange={(e) => {
                                                    const id = parseInt(e.target.value);
                                                    setSelectedWebhookId(id);
                                                    setData('webhook_id', id);
                                                }}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
                                                {webhooks.map((webhook) => (
                                                    <option key={webhook.id} value={webhook.id}>
                                                        {webhook.name}
                                                    </option>
                                                ))}
                                            </select>

                                            {selectedWebhookId && (
                                                <div className="mt-3 p-3 border rounded-lg bg-muted/50">
                                                    <div className="flex items-center gap-3">
                                                        {webhooks.find((w) => w.id === selectedWebhookId)?.avatar_url ? (
                                                            <img
                                                                src={webhooks.find((w) => w.id === selectedWebhookId)!.avatar_url}
                                                                alt="Webhook"
                                                                className="w-10 h-10 rounded-full"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                                <WebhookIcon className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="font-medium">
                                                                {webhooks.find((w) => w.id === selectedWebhookId)?.name}
                                                            </p>
                                                            {webhooks.find((w) => w.id === selectedWebhookId)?.description && (
                                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                                    {webhooks.find((w) => w.id === selectedWebhookId)?.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="temporary_webhook_url">Webhook URL</Label>
                                        <Input
                                            id="temporary_webhook_url"
                                            type="url"
                                            value={data.temporary_webhook_url}
                                            onChange={(e) => setData('temporary_webhook_url', e.target.value)}
                                            placeholder="https://discord.com/api/webhooks/..."
                                        />
                                        {errors.temporary_webhook_url && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.temporary_webhook_url}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="temporary_name">Custom Name (Optional)</Label>
                                        <Input
                                            id="temporary_name"
                                            type="text"
                                            value={data.temporary_name}
                                            onChange={(e) => setData('temporary_name', e.target.value)}
                                            placeholder="My Custom Webhook"
                                            maxLength={80}
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Override the webhook's default name
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="temporary_avatar">Custom Avatar URL (Optional)</Label>
                                        <Input
                                            id="temporary_avatar"
                                            type="url"
                                            value={data.temporary_avatar}
                                            onChange={(e) => setData('temporary_avatar', e.target.value)}
                                            placeholder="https://example.com/avatar.png"
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Override the webhook's default avatar
                                        </p>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        💡 This webhook won't be saved to your account
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Message Editor and Preview - Side by Side */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Message Editor */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Message Content</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Tabs */}
                                <div className="flex gap-2 border-b">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('content')}
                                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'content'
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        Content
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('embeds')}
                                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'embeds'
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        Embeds ({data.embeds.length})
                                    </button>
                                </div>

                                {/* Content Tab */}
                                {activeTab === 'content' && (
                                    <div>
                                        <Textarea
                                            value={data.content}
                                            onChange={(e) => setData('content', e.target.value)}
                                            placeholder="Enter your message here..."
                                            rows={8}
                                            maxLength={2000}
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {data.content.length}/2000 characters
                                        </p>
                                    </div>
                                )}

                                {/* Embeds Tab */}
                                {activeTab === 'embeds' && (
                                    <div className="space-y-4">
                                        {data.embeds.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>No embeds added yet</p>
                                                <Button
                                                    type="button"
                                                    onClick={addEmbed}
                                                    variant="outline"
                                                    className="mt-4"
                                                >
                                                    Add Embed
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                {data.embeds.map((embed, index) => (
                                                    <Card key={index} className="p-4 space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-medium">Embed {index + 1}</h4>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeEmbed(index)}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>

                                                        <div>
                                                            <Label>Title</Label>
                                                            <Input
                                                                value={embed.title || ''}
                                                                onChange={(e) =>
                                                                    updateEmbed(index, 'title', e.target.value)
                                                                }
                                                                placeholder="Embed title"
                                                                maxLength={256}
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label>Description</Label>
                                                            <Textarea
                                                                value={embed.description || ''}
                                                                onChange={(e) =>
                                                                    updateEmbed(index, 'description', e.target.value)
                                                                }
                                                                placeholder="Embed description"
                                                                rows={3}
                                                                maxLength={4096}
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label>Color</Label>
                                                            <Input
                                                                type="color"
                                                                value={`#${embed.color?.toString(16).padStart(6, '0') || '5865f2'}`}
                                                                onChange={(e) => {
                                                                    const hex = e.target.value.replace('#', '');
                                                                    updateEmbed(index, 'color', parseInt(hex, 16));
                                                                }}
                                                            />
                                                        </div>
                                                    </Card>
                                                ))}

                                                {data.embeds.length < 10 && (
                                                    <Button
                                                        type="button"
                                                        onClick={addEmbed}
                                                        variant="outline"
                                                        className="w-full"
                                                    >
                                                        Add Another Embed
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        (!data.content && data.embeds.length === 0) ||
                                        (mode === 'existing' && !selectedWebhookId) ||
                                        (mode === 'temporary' && !data.temporary_webhook_url)
                                    }
                                    className="w-full"
                                    size="lg"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    {processing ? 'Sending...' : 'Send Message'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Preview Section */}
                        <Card className="lg:sticky lg:top-6 h-fit">
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                                <CardDescription>How your message will appear</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-[#36393f] rounded-lg p-4 space-y-2">
                                    {/* Webhook Info */}
                                    <div className="flex items-center gap-3 mb-4">
                                        {mode === 'existing' && selectedWebhookId ? (
                                            <>
                                                {webhooks.find((w) => w.id === selectedWebhookId)?.avatar_url ? (
                                                    <img
                                                        src={webhooks.find((w) => w.id === selectedWebhookId)!.avatar_url}
                                                        alt="Webhook"
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-bold">
                                                        {webhooks.find((w) => w.id === selectedWebhookId)?.name[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {webhooks.find((w) => w.id === selectedWebhookId)?.name}
                                                    </p>
                                                    <p className="text-[#b9bbbe] text-xs">BOT</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {data.temporary_avatar ? (
                                                    <img
                                                        src={data.temporary_avatar}
                                                        alt="Webhook"
                                                        className="w-10 h-10 rounded-full"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-bold ${data.temporary_avatar ? 'hidden' : ''}`}>
                                                    {data.temporary_name ? data.temporary_name[0].toUpperCase() : 'W'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {data.temporary_name || 'Webhook'}
                                                    </p>
                                                    <p className="text-[#b9bbbe] text-xs">BOT</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Message Content */}
                                    {data.content && (
                                        <p className="text-[#dcddde] whitespace-pre-wrap break-words">{data.content}</p>
                                    )}

                                    {/* Embeds */}
                                    {data.embeds.map((embed, index) => (
                                        <div
                                            key={index}
                                            className="border-l-4 bg-[#2f3136] rounded p-3 space-y-2"
                                            style={{
                                                borderColor: `#${embed.color?.toString(16).padStart(6, '0') || '5865f2'}`,
                                            }}
                                        >
                                            {embed.title && <p className="text-white font-semibold">{embed.title}</p>}
                                            {embed.description && (
                                                <p className="text-[#dcddde] text-sm whitespace-pre-wrap">
                                                    {embed.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}

                                    {!data.content && data.embeds.length === 0 && (
                                        <p className="text-[#72767d] text-center py-8">
                                            Your message preview will appear here
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
