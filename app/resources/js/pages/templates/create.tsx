import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Templates',
        href: '/templates',
    },
    {
        title: 'Create',
        href: '/templates/create',
    },
];

interface Webhook {
    id: number;
    name: string;
}

interface Props {
    webhooks: Webhook[];
}

export default function CreateTemplate({ webhooks }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        category: 'custom',
        customCategory: '',
        content: {
            content: '',
            embeds: [] as any[],
        },
        webhook_id: 'none',
        is_shared: false,
    });

    const [activeTab, setActiveTab] = useState<'content' | 'embeds'>('content');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare data with custom category if needed
        const formData = {
            name: data.name,
            description: data.description,
            category: data.category === 'custom' && data.customCategory ? data.customCategory : data.category,
            content: data.content,
            webhook_id: data.webhook_id,
            is_shared: data.is_shared,
        };

        router.post('/templates', formData);
    };

    const addEmbed = () => {
        setData('content', {
            ...data.content,
            embeds: [
                ...data.content.embeds,
                {
                    title: '',
                    description: '',
                    color: 5814783,
                    fields: [],
                },
            ],
        });
    };

    const removeEmbed = (index: number) => {
        const newEmbeds = data.content.embeds.filter((_, i) => i !== index);
        setData('content', { ...data.content, embeds: newEmbeds });
    };

    const updateEmbed = (index: number, field: string, value: any) => {
        const newEmbeds = [...data.content.embeds];
        newEmbeds[index] = { ...newEmbeds[index], [field]: value };
        setData('content', { ...data.content, embeds: newEmbeds });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Template" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Template</h1>
                        <p className="text-muted-foreground mt-1">
                            Save a reusable message template
                        </p>
                    </div>
                    <Link href="/templates">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Template Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Information</CardTitle>
                            <CardDescription>
                                Basic information about your template
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Template Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Weekly Update"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(value) => setData('category', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="announcements">📢 Announcements</SelectItem>
                                            <SelectItem value="notifications">🔔 Notifications</SelectItem>
                                            <SelectItem value="alerts">⚠️ Alerts</SelectItem>
                                            <SelectItem value="updates">📰 Updates</SelectItem>
                                            <SelectItem value="custom">✏️ Custom (write your own)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {data.category === 'custom' && (
                                        <Input
                                            id="customCategory"
                                            value={data.customCategory}
                                            onChange={(e) => setData('customCategory', e.target.value)}
                                            placeholder="Enter custom category name..."
                                            className="mt-2"
                                            required
                                        />
                                    )}
                                    {errors.category && (
                                        <p className="text-sm text-destructive">{errors.category}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Optional description of what this template is for..."
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="webhook_id">Associate with Webhook (Optional)</Label>
                                    <Select
                                        value={data.webhook_id}
                                        onValueChange={(value) => setData('webhook_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {webhooks.map((webhook) => (
                                                <SelectItem key={webhook.id} value={webhook.id.toString()}>
                                                    {webhook.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {data.webhook_id && data.webhook_id !== 'none' && (
                                    <div className="flex items-center space-x-2 pt-8">
                                        <Checkbox
                                            id="is_shared"
                                            checked={data.is_shared}
                                            onCheckedChange={(checked) => setData('is_shared', checked as boolean)}
                                        />
                                        <Label htmlFor="is_shared" className="cursor-pointer">
                                            Share with webhook collaborators
                                        </Label>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Editor */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Message Content</CardTitle>
                                <CardDescription>
                                    Compose your template message
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
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
                                        Embeds ({data.content.embeds.length})
                                    </button>
                                </div>

                                {/* Content Tab */}
                                {activeTab === 'content' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="content">Message Content</Label>
                                            <Textarea
                                                id="content"
                                                value={data.content.content}
                                                onChange={(e) =>
                                                    setData('content', { ...data.content, content: e.target.value })
                                                }
                                                placeholder="Enter your message here..."
                                                rows={10}
                                                maxLength={2000}
                                                className="resize-none"
                                            />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {data.content.content.length}/2000 characters
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Embeds Tab */}
                                {activeTab === 'embeds' && (
                                    <div className="space-y-4">
                                        {data.content.embeds.length === 0 ? (
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
                                                {data.content.embeds.map((embed: any, index: number) => (
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
                                                                rows={4}
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

                                                {data.content.embeds.length < 10 && (
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
                            </CardContent>
                        </Card>

                        {/* Preview */}
                        <Card className="lg:sticky lg:top-6 lg:self-start">
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                                <CardDescription>
                                    How your template will appear
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-[#36393f] rounded-lg p-4 space-y-2">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-bold">
                                            T
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Template Preview</p>
                                            <p className="text-[#b9bbbe] text-xs">BOT</p>
                                        </div>
                                    </div>

                                    {data.content.content && (
                                        <p className="text-[#dcddde] whitespace-pre-wrap break-words">
                                            {data.content.content}
                                        </p>
                                    )}

                                    {data.content.embeds.map((embed: any, index: number) => (
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

                                    {!data.content.content && data.content.embeds.length === 0 && (
                                        <p className="text-[#72767d] text-center py-8">
                                            Your template preview will appear here
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Link href="/templates">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="h-4 w-4" />
                            Save Template
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
