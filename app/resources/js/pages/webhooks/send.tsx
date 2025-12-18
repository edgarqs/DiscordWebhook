import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Upload, X, Save, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Webhook, BreadcrumbItem } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Webhooks',
        href: '/webhooks',
    },
    {
        title: 'Send',
        href: '/send',
    },
];

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
    webhook: Webhook;
    templates: Template[];
}

export default function WebhookSend({ webhook, templates }: SendProps) {
    const { data, setData, post, processing, errors } = useForm({
        content: '',
        embeds: [] as any[],
        files: [] as File[],
    });

    const [activeTab, setActiveTab] = useState<'content' | 'embeds' | 'files'>('content');
    const [collapsedEmbeds, setCollapsedEmbeds] = useState<Set<number>>(new Set());

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/webhooks/${webhook.id}/send`, {
            forceFormData: true,
        });
    };

    const addEmbed = () => {
        setData('embeds', [
            ...data.embeds,
            {
                title: '',
                description: '',
                url: '',
                color: 5814783, // Discord blurple
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setData('files', [...data.files, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = data.files.filter((_, i) => i !== index);
        setData('files', newFiles);
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
            <Head title={`Send Message - ${webhook.name}`} />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/webhooks/${webhook.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Send Message</h1>
                        <p className="text-muted-foreground">
                            Send a message to <span className="font-medium">{webhook.name}</span>
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid lg:grid-cols-2 gap-6">
                    {/* Editor Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Message Editor</CardTitle>
                            <CardDescription>
                                Compose your Discord message
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Template Actions */}
                            {templates.length > 0 && (
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
                                            rows={10}
                                            maxLength={2000}
                                            className="resize-none"
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {data.content.length}/2000 characters
                                        </p>
                                        {errors.content && (
                                            <p className="text-sm text-destructive mt-1">{errors.content}</p>
                                        )}
                                    </div>
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
                                                                    onChange={(e) => updateEmbed(index, 'title', e.target.value)}
                                                                    placeholder="Embed title"
                                                                    maxLength={256}
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label>Description</Label>
                                                                <Textarea
                                                                    value={embed.description || ''}
                                                                    onChange={(e) => updateEmbed(index, 'description', e.target.value)}
                                                                    placeholder="Embed description"
                                                                    rows={4}
                                                                    maxLength={4096}
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label>Color (Hex)</Label>
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

                            {/* Files Tab */}
                            {activeTab === 'files' && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="file-upload">Upload Files</Label>
                                        <div className="mt-2">
                                            <label
                                                htmlFor="file-upload"
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
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

                            {/* Error Message */}
                            {(errors as any).message && (
                                <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                                    {(errors as any).message}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <Link href={`/webhooks/${webhook.id}`} className="flex-1">
                                    <Button type="button" variant="outline" className="w-full" size="lg">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing || (!data.content && data.embeds.length === 0)}
                                    className="flex-1"
                                    size="lg"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    {processing ? 'Sending...' : 'Send Message'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Preview</CardTitle>
                            <CardDescription>
                                How your message will appear in Discord
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-[#36393f] rounded-lg p-4 space-y-2">
                                {/* Webhook Info */}
                                <div className="flex items-center gap-3 mb-4">
                                    {webhook.avatar_url ? (
                                        <img
                                            src={webhook.avatar_url}
                                            alt={webhook.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-bold">
                                            {webhook.name[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-white font-medium">{webhook.name}</p>
                                        <p className="text-[#b9bbbe] text-xs">BOT</p>
                                    </div>
                                </div>

                                {/* Message Content */}
                                {data.content && (
                                    <p className="text-[#dcddde] whitespace-pre-wrap break-words">
                                        {data.content}
                                    </p>
                                )}

                                {/* Embeds */}
                                {data.embeds.map((embed, index) => (
                                    <div
                                        key={index}
                                        className="border-l-4 bg-[#2f3136] rounded p-3 space-y-2 max-w-lg"
                                        style={{ borderColor: `#${embed.color?.toString(16).padStart(6, '0') || '5865f2'}` }}
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
                </form>
            </div>
        </AppLayout >
    );
}
