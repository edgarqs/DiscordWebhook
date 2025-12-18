import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
    FileText,
    Plus,
    Search,
    Edit,
    Trash2,
    Copy,
    Megaphone,
    Bell,
    AlertTriangle,
    Newspaper,
    Tag,
    Crown,
    Users
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Templates',
        href: '/templates',
    },
];

interface Template {
    id: number;
    name: string;
    description: string | null;
    category: string;
    content: {
        content?: string;
        embeds?: any[];
    };
    webhook?: {
        id: number;
        name: string;
    };
    is_shared: boolean;
    is_owner: boolean;
    permission_level: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    templates: {
        data: Template[];
        links: any;
        meta: any;
    };
    filters: {
        category?: string;
        search?: string;
    };
}

const categoryIcons: Record<string, any> = {
    announcements: Megaphone,
    notifications: Bell,
    alerts: AlertTriangle,
    updates: Newspaper,
    custom: Tag,
};

const categoryColors: Record<string, string> = {
    announcements: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    notifications: 'bg-green-500/10 text-green-500 border-green-500/20',
    alerts: 'bg-red-500/10 text-red-500 border-red-500/20',
    updates: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    custom: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function TemplatesIndex({ templates, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/templates', { search: value, category: category !== 'all' ? category : undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        router.get('/templates', {
            search: search || undefined,
            category: value !== 'all' ? value : undefined
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDeleteClick = (templateId: number) => {
        setTemplateToDelete(templateId);
        setDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (templateToDelete) {
            router.delete(`/templates/${templateToDelete}`, {
                preserveScroll: true,
                only: ['templates'],
                onSuccess: () => {
                    setTemplateToDelete(null);
                    setDeleteDialog(false);
                },
            });
        }
    };

    const handleDuplicate = (templateId: number) => {
        router.post(`/templates/${templateId}/duplicate`, {}, {
            preserveScroll: true,
        });
    };

    const getCategoryIcon = (category: string) => {
        const Icon = categoryIcons[category] || Tag;
        return <Icon className="h-4 w-4" />;
    };

    const getEmbedPreviewColor = (template: Template): string => {
        if (template.content.embeds && template.content.embeds.length > 0) {
            const firstEmbed = template.content.embeds[0];
            if (firstEmbed.color) {
                return `#${firstEmbed.color.toString(16).padStart(6, '0')}`;
            }
        }
        return '#5865F2'; // Discord blurple default
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Templates" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your reusable message templates
                        </p>
                    </div>
                    <Link href="/templates/create">
                        <Button size="lg" className="gap-2">
                            <Plus className="h-5 w-5" />
                            New Template
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search templates..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={category} onValueChange={handleCategoryChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="announcements">📢 Announcements</SelectItem>
                                        <SelectItem value="notifications">🔔 Notifications</SelectItem>
                                        <SelectItem value="alerts">⚠️ Alerts</SelectItem>
                                        <SelectItem value="updates">📰 Updates</SelectItem>
                                        <SelectItem value="custom">🏷️ Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Templates Grid */}
                {templates.data.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                No templates yet
                            </h3>
                            <p className="text-muted-foreground text-center max-w-md mb-4">
                                Create your first template to save time when sending similar messages.
                            </p>
                            <Link href="/templates/create">
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Template
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {templates.data.map((template) => (
                            <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {getCategoryIcon(template.category)}
                                            <Badge
                                                variant="outline"
                                                className={categoryColors[template.category]}
                                            >
                                                {template.category}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {template.is_owner ? (
                                                <Badge variant="default" className="gap-1">
                                                    <Crown className="h-3 w-3" />
                                                    Owner
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {template.permission_level === 'edit' ? 'Can Edit' : 'View Only'}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <CardTitle className="line-clamp-1">{template.name}</CardTitle>
                                    {template.description && (
                                        <CardDescription className="line-clamp-2">
                                            {template.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Preview */}
                                    <div
                                        className="h-2 rounded-full"
                                        style={{ backgroundColor: getEmbedPreviewColor(template) }}
                                    />

                                    {template.webhook && (
                                        <div className="text-sm text-muted-foreground">
                                            Webhook: <span className="font-medium">{template.webhook.name}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {(template.is_owner || template.permission_level === 'edit') ? (
                                            <Link href={`/templates/${template.id}/edit`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full gap-2">
                                                    <Edit className="h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href="/send" className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Use Template
                                                </Button>
                                            </Link>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDuplicate(template.id)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        {template.is_owner && (
                                            <>
                                                <Link href={`/templates/${template.id}/collaborators`}>
                                                    <Button variant="outline" size="sm">
                                                        <Users className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(template.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialog}
                    onOpenChange={setDeleteDialog}
                    onConfirm={handleConfirmDelete}
                    title="Delete Template"
                    description="Are you sure you want to delete this template? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </AppLayout>
    );
}
