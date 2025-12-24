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
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ArrowLeft, Save, Trash2, UserPlus, LogOut } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { VariableHelper } from '@/components/variable-helper';

interface Webhook {
    id: number;
    name: string;
}

interface Template {
    id: number;
    name: string;
    description: string | null;
    category: string;
    content: {
        content?: string;
        embeds?: any[];
    };
    webhook_id: number | null;
    is_shared: boolean;
    is_owner: boolean;
}

interface Props {
    template: Template;
}

export default function EditTemplate({ template }: Props) {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [leaveDialog, setLeaveDialog] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'embeds'>('content');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Templates',
            href: '/templates',
        },
        {
            title: template.name,
            href: `/templates/${template.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: template.name,
        description: template.description || '',
        category: template.category,
        customCategory: '',
        content: {
            content: template.content.content || '',
            embeds: template.content.embeds || [],
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare data with custom category if needed
        const formData = {
            name: data.name,
            description: data.description,
            category: data.category === 'custom' && data.customCategory ? data.customCategory : data.category,
            content: data.content,
        };

        router.put(`/templates/${template.id}`, formData, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        router.delete(`/templates/${template.id}`);
        setDeleteDialog(false);
    };

    const handleLeave = () => {
        router.post(`/templates/${template.id}/leave`, {}, {
            onSuccess: () => {
                setLeaveDialog(false);
            },
        });
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
            <Head title={`Edit ${template.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
                        <p className="text-muted-foreground mt-1">
                            Update your template
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <VariableHelper />
                        {template.is_owner && (
                            <Link href={`/templates/${template.id}/collaborators`}>
                                <Button variant="outline" className="gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Manage Collaborators
                                </Button>
                            </Link>
                        )}
                        {template.is_owner ? (
                            <Button
                                variant="outline"
                                className="gap-2 text-destructive hover:text-destructive"
                                onClick={() => setDeleteDialog(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="gap-2 text-destructive hover:text-destructive"
                                onClick={() => setLeaveDialog(true)}
                            >
                                <LogOut className="h-4 w-4" />
                                Leave Template
                            </Button>
                        )}
                        <Link href="/templates">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                    </div>
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
                            Update Template
                        </Button>
                    </div>
                </form>

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialog}
                    onOpenChange={setDeleteDialog}
                    onConfirm={handleDelete}
                    title="Delete Template"
                    description="Are you sure you want to delete this template? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                />

                {/* Leave Confirmation Dialog */}
                <ConfirmDialog
                    open={leaveDialog}
                    onOpenChange={setLeaveDialog}
                    onConfirm={handleLeave}
                    title="Leave Template"
                    description="Are you sure you want to leave this template? You will lose access to it immediately."
                    confirmText="Leave"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </AppLayout>
    );
}
