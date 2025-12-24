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
    Users,
    LogOut,
    Zap
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
        ownership?: string;
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
    const [ownership, setOwnership] = useState(filters.ownership || 'all');
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
    const [leaveDialog, setLeaveDialog] = useState(false);
    const [templateToLeave, setTemplateToLeave] = useState<number | null>(null);

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
    };

    const handleOwnershipChange = (value: string) => {
        setOwnership(value);
    };

    // Filter templates in frontend
    const filteredTemplates = templates.data.filter(template => {
        // Ownership filter
        if (ownership === 'owned' && !template.is_owner) return false;
        if (ownership === 'shared' && template.is_owner) return false;

        // Category filter
        if (category !== 'all' && template.category !== category) return false;

        // Search filter
        if (search && !template.name.toLowerCase().includes(search.toLowerCase())) return false;

        return true;
    });

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

    const handleLeaveClick = (templateId: number) => {
        setTemplateToLeave(templateId);
        setLeaveDialog(true);
    };

    const handleConfirmLeave = () => {
        if (templateToLeave) {
            router.post(`/templates/${templateToLeave}/leave`, {}, {
                onSuccess: () => {
                    setTemplateToLeave(null);
                    setLeaveDialog(false);
                },
            });
        }
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
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search templates..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={category} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="announcements">📢 Announcements</SelectItem>
                                    <SelectItem value="notifications">🔔 Notifications</SelectItem>
                                    <SelectItem value="alerts">⚠️ Alerts</SelectItem>
                                    <SelectItem value="updates">📰 Updates</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={ownership} onValueChange={handleOwnershipChange}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Templates" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Templates</SelectItem>
                                    <SelectItem value="owned">My Templates</SelectItem>
                                    <SelectItem value="shared">Shared With Me</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Templates Grid */}
                {filteredTemplates.length === 0 ? (
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
                        {filteredTemplates.map((template) => (
                            <Link key={template.id} href={`/templates/${template.id}`}>
                                <Card className="hover:shadow-lg transition-shadow flex flex-col cursor-pointer">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div className="shrink-0">
                                                    {getCategoryIcon(template.category)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-sm truncate leading-tight">{template.name}</CardTitle>
                                                    <Badge
                                                        variant="outline"
                                                        className={`${categoryColors[template.category]} text-[10px] h-4 px-1.5 mt-0.5`}
                                                    >
                                                        {template.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {template.is_owner ? (
                                                <Badge variant="default" className="gap-0.5 shrink-0 text-[10px] h-5 px-1.5">
                                                    <Crown className="h-2.5 w-2.5" />
                                                    Owner
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="shrink-0 text-[10px] h-5 px-1.5">
                                                    {template.permission_level === 'edit' ? 'Editor' : 'Viewer'}
                                                </Badge>
                                            )}
                                        </div>
                                        {template.description && (
                                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
                                                {template.description}
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="flex flex-col flex-1 pt-0 pb-3">
                                        <div className="flex-1"></div>
                                        <TooltipProvider delayDuration={300}>
                                            <div className="flex gap-1.5">
                                                {(template.is_owner || template.permission_level === 'edit') ? (
                                                    <Link href={`/templates/${template.id}/edit`} className="flex-1">
                                                        <Button variant="default" size="sm" className="w-full h-8 gap-1.5">
                                                            <Edit className="h-3.5 w-3.5" />
                                                            <span className="text-xs">Edit</span>
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Link href={`/send?template=${template.id}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="default" size="sm" className="w-full h-8 gap-1.5">
                                                            <FileText className="h-3.5 w-3.5" />
                                                            <span className="text-xs">Use</span>
                                                        </Button>
                                                    </Link>
                                                )}

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => { e.stopPropagation(); handleDuplicate(template.id); }}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Copy className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Duplicate Template</TooltipContent>
                                                </Tooltip>

                                                {template.is_owner && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link href={`/templates/${template.id}/collaborators`} onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                                    <Users className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Share Template</TooltipContent>
                                                    </Tooltip>
                                                )}

                                                {template.is_owner ? (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(template.id); }}
                                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Delete Template</TooltipContent>
                                                    </Tooltip>
                                                ) : template.permission_level && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => { e.stopPropagation(); handleLeaveClick(template.id); }}
                                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <LogOut className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Leave Template</TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TooltipProvider>
                                    </CardContent>
                                </Card>
                            </Link>
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

                {/* Leave Confirmation Dialog */}
                <ConfirmDialog
                    open={leaveDialog}
                    onOpenChange={setLeaveDialog}
                    onConfirm={handleConfirmLeave}
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
