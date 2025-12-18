import { FormEventHandler, useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Upload, X, Save, ChevronDown, ChevronUp, Plus, Trash2, Webhook as WebhookIcon } from 'lucide-react';
import { Webhook, type BreadcrumbItem } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toast } from '@/components/ui/toast';

interface Template {
    id: number;
    name: string;
    category: string;
    content: {
        content?: string;
        embeds?: any[];
    };
}

interface SendProps {
    webhooks: Webhook[];
    templates: Template[];
}

export default function QuickSend({ webhooks, templates }: SendProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Quick Send',
            href: '/send',
        },
    ];

    const page = usePage<any>();
    const [mode, setMode] = useState<'existing' | 'temporary'>('existing');
    const [selectedWebhookId, setSelectedWebhookId] = useState<number | null>(
        webhooks.length > 0 ? webhooks[0].id : null
    );
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        webhook_id: number | null;
        temporary_webhook_url: string;
        temporary_name: string;
        temporary_avatar: string;
        content: string;
        embeds: any[];
        files: File[];
    }>({
        webhook_id: webhooks.length > 0 ? webhooks[0].id : null,
        temporary_webhook_url: '',
        temporary_name: '',
        temporary_avatar: '',
        content: '',
        embeds: [],
        files: [],
    });

    const [activeTab, setActiveTab] = useState<'content' | 'embeds' | 'files'>('content');
    const [collapsedEmbeds, setCollapsedEmbeds] = useState<Set<number>>(new Set());

    // Show success/error messages
    useEffect(() => {
        if (page.props.flash?.success) {
            setNotification({ message: page.props.flash.success, type: 'success' });
            // Reset form after successful send
            reset('content', 'embeds', 'files');
            setData('embeds', []);
            setData('files', []);
        } else if (page.props.flash?.error) {
            setNotification({ message: page.props.flash.error, type: 'error' });
        }
    }, [page.props.flash?.success, page.props.flash?.error]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setData('files', [...data.files, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setData('files', data.files.filter((_, i) => i !== index));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // @ts-ignore - Type instantiation depth issue with Inertia.js
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
                url: '',
                color: 5814783,
                timestamp: '',
                footer: {
                    text: '',
                    icon_url: '',
                },
                thumbnail: {
                    url: '',
                },
                image: {
                    url: '',
                },
                author: {
                    name: '',
                    url: '',
                    icon_url: '',
                },
                fields: [],
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

    const addEmbedField = (embedIndex: number) => {
        const newEmbeds = [...data.embeds];
        if (!newEmbeds[embedIndex].fields) {
            newEmbeds[embedIndex].fields = [];
        }
        newEmbeds[embedIndex].fields.push({
            name: '',
            value: '',
            inline: false,
        });
        setData('embeds', newEmbeds);
    };

    const updateEmbedField = (embedIndex: number, fieldIndex: number, field: string, value: any) => {
        const newEmbeds = [...data.embeds];
        newEmbeds[embedIndex].fields[fieldIndex] = {
            ...newEmbeds[embedIndex].fields[fieldIndex],
            [field]: value,
        };
        setData('embeds', newEmbeds);
    };

    const removeEmbedField = (embedIndex: number, fieldIndex: number) => {
        const newEmbeds = [...data.embeds];
        newEmbeds[embedIndex].fields.splice(fieldIndex, 1);
        setData('embeds', newEmbeds);
    };

    const toggleEmbedCollapse = (index: number) => {
        const newCollapsed = new Set(collapsedEmbeds);
        if (newCollapsed.has(index)) {
            newCollapsed.delete(index);
        } else {
            newCollapsed.add(index);
        }
        setCollapsedEmbeds(newCollapsed);
    };

    const loadTemplate = (templateId: string) => {
        if (templateId === 'none') return;

        const template = templates.find(t => t.id.toString() === templateId);
        if (!template) return;

        setData({
            ...data,
            content: template.content.content || '',
            embeds: template.content.embeds || [],
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
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
                                {/* Template Actions */}
                                {templates && templates.length > 0 && (
                                    <div className="flex gap-2 pb-4 border-b">
                                        <div className="flex-1">
                                            <Select onValueChange={loadTemplate}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Load Template..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Select a template</SelectItem>
                                                    {templates.map((template) => (
                                                        <SelectItem key={template.id} value={template.id.toString()}>
                                                            {template.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Link href="/templates/create">
                                            <Button type="button" variant="outline" className="gap-2">
                                                <Save className="h-4 w-4" />
                                                Save as Template
                                            </Button>
                                        </Link>
                                    </div>
                                )}

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
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('files')}
                                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'files'
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        Files ({data.files.length})
                                    </button>
                                </div>

                                {/* Content Tab */}
                                {activeTab === 'content' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="content">Message Content</Label>
                                            <Textarea
                                                id="content"
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
                                    </div>
                                )}

                                {/* Files Tab */}
                                {activeTab === 'files' && (
                                    <div className="space-y-4">
                                        {/* File Upload */}
                                        <div className="space-y-2">
                                            <Label>Upload Files</Label>
                                            <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="cursor-pointer flex flex-col items-center"
                                                >
                                                    <div className="text-center">
                                                        <Upload className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                                                        <p className="text-sm text-muted-foreground">
                                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Images, videos (max 10MB each, up to 10 files)
                                                        </p>
                                                    </div>
                                                    <input
                                                        id="file-upload"
                                                        type="file"
                                                        className="hidden"
                                                        multiple
                                                        accept="image/*,video/*"
                                                        onChange={handleFileChange}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* File List */}
                                        {data.files.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Attached Files</Label>
                                                <div className="space-y-2">
                                                    {data.files.map((file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                                                        >
                                                            {file.type.startsWith('image/') && (
                                                                <img
                                                                    src={URL.createObjectURL(file)}
                                                                    alt={file.name}
                                                                    className="w-16 h-16 object-cover rounded"
                                                                />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">
                                                                    {file.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeFile(index)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleEmbedCollapse(index)}
                                                                >
                                                                    {collapsedEmbeds.has(index) ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronUp className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                                <h4 className="font-medium">Embed {index + 1}</h4>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeEmbed(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        {!collapsedEmbeds.has(index) && (
                                                            <>

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

                                                                <div>
                                                                    <Label>URL (Optional)</Label>
                                                                    <Input
                                                                        value={embed.url || ''}
                                                                        onChange={(e) => updateEmbed(index, 'url', e.target.value)}
                                                                        placeholder="https://example.com"
                                                                    />
                                                                </div>

                                                                {/* Author */}
                                                                <div className="space-y-2 pt-2 border-t">
                                                                    <Label className="text-sm font-semibold">Author (Optional)</Label>
                                                                    <div className="space-y-2 pl-3">
                                                                        <div>
                                                                            <Label className="text-xs">Name</Label>
                                                                            <Input
                                                                                value={embed.author?.name || ''}
                                                                                onChange={(e) => updateEmbed(index, 'author', { ...embed.author, name: e.target.value })}
                                                                                placeholder="Author name"
                                                                                maxLength={256}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs">URL</Label>
                                                                            <Input
                                                                                value={embed.author?.url || ''}
                                                                                onChange={(e) => updateEmbed(index, 'author', { ...embed.author, url: e.target.value })}
                                                                                placeholder="https://example.com"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs">Icon URL</Label>
                                                                            <Input
                                                                                value={embed.author?.icon_url || ''}
                                                                                onChange={(e) => updateEmbed(index, 'author', { ...embed.author, icon_url: e.target.value })}
                                                                                placeholder="https://example.com/icon.png"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Footer */}
                                                                <div className="space-y-2 pt-2 border-t">
                                                                    <Label className="text-sm font-semibold">Footer (Optional)</Label>
                                                                    <div className="space-y-2 pl-3">
                                                                        <div>
                                                                            <Label className="text-xs">Text</Label>
                                                                            <Input
                                                                                value={embed.footer?.text || ''}
                                                                                onChange={(e) => updateEmbed(index, 'footer', { ...embed.footer, text: e.target.value })}
                                                                                placeholder="Footer text"
                                                                                maxLength={2048}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs">Icon URL</Label>
                                                                            <Input
                                                                                value={embed.footer?.icon_url || ''}
                                                                                onChange={(e) => updateEmbed(index, 'footer', { ...embed.footer, icon_url: e.target.value })}
                                                                                placeholder="https://example.com/icon.png"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Images */}
                                                                <div className="space-y-2 pt-2 border-t">
                                                                    <Label className="text-sm font-semibold">Images (Optional)</Label>
                                                                    <div className="space-y-2 pl-3">
                                                                        <div>
                                                                            <Label className="text-xs">Thumbnail URL</Label>
                                                                            <Input
                                                                                value={embed.thumbnail?.url || ''}
                                                                                onChange={(e) => updateEmbed(index, 'thumbnail', { url: e.target.value })}
                                                                                placeholder="https://example.com/thumb.png"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs">Image URL</Label>
                                                                            <Input
                                                                                value={embed.image?.url || ''}
                                                                                onChange={(e) => updateEmbed(index, 'image', { url: e.target.value })}
                                                                                placeholder="https://example.com/image.png"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Timestamp */}
                                                                <div className="pt-2 border-t">
                                                                    <Label>Timestamp (Optional)</Label>
                                                                    <Input
                                                                        type="datetime-local"
                                                                        value={embed.timestamp || ''}
                                                                        onChange={(e) => updateEmbed(index, 'timestamp', e.target.value)}
                                                                    />
                                                                </div>

                                                                {/* Fields */}
                                                                <div className="space-y-2 pt-2 border-t">
                                                                    <div className="flex items-center justify-between">
                                                                        <Label className="text-sm font-semibold">Fields (Optional)</Label>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => addEmbedField(index)}
                                                                        >
                                                                            <Plus className="h-4 w-4 mr-1" />
                                                                            Add Field
                                                                        </Button>
                                                                    </div>
                                                                    {embed.fields && embed.fields.length > 0 && (
                                                                        <div className="space-y-3 pl-3">
                                                                            {embed.fields.map((field: any, fieldIndex: number) => (
                                                                                <div key={fieldIndex} className="space-y-2 p-3 border rounded">
                                                                                    <div className="flex justify-between items-center">
                                                                                        <Label className="text-xs">Field {fieldIndex + 1}</Label>
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            onClick={() => removeEmbedField(index, fieldIndex)}
                                                                                        >
                                                                                            <Trash2 className="h-3 w-3" />
                                                                                        </Button>
                                                                                    </div>
                                                                                    <div>
                                                                                        <Label className="text-xs">Name</Label>
                                                                                        <Input
                                                                                            value={field.name || ''}
                                                                                            onChange={(e) => updateEmbedField(index, fieldIndex, 'name', e.target.value)}
                                                                                            placeholder="Field name"
                                                                                            maxLength={256}
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <Label className="text-xs">Value</Label>
                                                                                        <Textarea
                                                                                            value={field.value || ''}
                                                                                            onChange={(e) => updateEmbedField(index, fieldIndex, 'value', e.target.value)}
                                                                                            placeholder="Field value"
                                                                                            rows={2}
                                                                                            maxLength={1024}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            id={`inline-${index}-${fieldIndex}`}
                                                                                            checked={field.inline || false}
                                                                                            onChange={(e) => updateEmbedField(index, fieldIndex, 'inline', e.target.checked)}
                                                                                            className="rounded"
                                                                                        />
                                                                                        <Label htmlFor={`inline-${index}-${fieldIndex}`} className="text-xs cursor-pointer">
                                                                                            Inline (display in columns)
                                                                                        </Label>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
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
                                            className="border-l-4 bg-[#2f3136] rounded p-3 space-y-2 max-w-lg"
                                            style={{
                                                borderColor: `#${embed.color?.toString(16).padStart(6, '0') || '5865f2'}`,
                                            }}
                                        >
                                            <div className="flex justify-between gap-2">
                                                <div className="flex-1 space-y-2">
                                                    {/* Author */}
                                                    {embed.author?.name && (
                                                        <div className="flex items-center gap-2">
                                                            {embed.author.icon_url && (
                                                                <img
                                                                    src={embed.author.icon_url}
                                                                    alt="Author"
                                                                    className="w-6 h-6 rounded-full"
                                                                />
                                                            )}
                                                            <span className="text-white text-sm font-medium">
                                                                {embed.author.url ? (
                                                                    <a href={embed.author.url} className="hover:underline" target="_blank" rel="noopener noreferrer">
                                                                        {embed.author.name}
                                                                    </a>
                                                                ) : (
                                                                    embed.author.name
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Title */}
                                                    {embed.title && (
                                                        <p className="text-white font-semibold">
                                                            {embed.url ? (
                                                                <a href={embed.url} className="hover:underline text-[#00aff4]" target="_blank" rel="noopener noreferrer">
                                                                    {embed.title}
                                                                </a>
                                                            ) : (
                                                                embed.title
                                                            )}
                                                        </p>
                                                    )}

                                                    {/* Description */}
                                                    {embed.description && (
                                                        <p className="text-[#dcddde] text-sm whitespace-pre-wrap">
                                                            {embed.description}
                                                        </p>
                                                    )}

                                                    {/* Fields */}
                                                    {embed.fields && embed.fields.length > 0 && (
                                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                                            {embed.fields.map((field: any, fieldIndex: number) => (
                                                                <div
                                                                    key={fieldIndex}
                                                                    className={field.inline ? 'col-span-1' : 'col-span-3'}
                                                                >
                                                                    <p className="text-white text-sm font-semibold mb-1">
                                                                        {field.name}
                                                                    </p>
                                                                    <p className="text-[#dcddde] text-sm whitespace-pre-wrap">
                                                                        {field.value}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Image */}
                                                    {embed.image?.url && (
                                                        <img
                                                            src={embed.image.url}
                                                            alt="Embed"
                                                            className="max-w-full rounded mt-2"
                                                        />
                                                    )}

                                                    {/* Footer */}
                                                    {(embed.footer?.text || embed.timestamp) && (
                                                        <div className="flex items-center gap-2 text-[#b9bbbe] text-xs pt-2">
                                                            {embed.footer?.icon_url && (
                                                                <img
                                                                    src={embed.footer.icon_url}
                                                                    alt="Footer"
                                                                    className="w-5 h-5 rounded-full"
                                                                />
                                                            )}
                                                            <span>
                                                                {embed.footer?.text}
                                                                {embed.footer?.text && embed.timestamp && ' • '}
                                                                {embed.timestamp && new Date(embed.timestamp).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Thumbnail */}
                                                {embed.thumbnail?.url && (
                                                    <img
                                                        src={embed.thumbnail.url}
                                                        alt="Thumbnail"
                                                        className="w-20 h-20 rounded object-cover flex-shrink-0"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* File Attachments */}
                                    {data.files.length > 0 && (
                                        <div className="space-y-2 mt-2">
                                            {data.files.map((file, index) => (
                                                <div key={index}>
                                                    {file.type.startsWith('image/') ? (
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={file.name}
                                                            className="max-w-full max-h-96 rounded object-contain"
                                                        />
                                                    ) : (
                                                        <div className="bg-[#2f3136] rounded p-3 flex items-center gap-2">
                                                            <div className="text-[#dcddde] text-sm">
                                                                📎 {file.name}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!data.content && data.embeds.length === 0 && data.files.length === 0 && (
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
