import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Edit,
    Users,
    Trash2,
    LogOut,
    Copy,
    Rocket,
    Calendar,
    User
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';

interface Template {
    id: number;
    name: string;
    description?: string;
    category: string;
    content: {
        content?: string;
        embeds?: any[];
    };
    is_owner: boolean;
    permission_level: 'owner' | 'edit' | 'view';
    created_at: string;
    user: {
        id: number;
        name: string;
    };
}

interface Props {
    template: Template;
}

export default function ShowTemplate({ template }: Props) {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [leaveDialog, setLeaveDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Templates',
            href: '/templates',
        },
        {
            title: template.name,
            href: `/templates/${template.id}`,
        },
    ];

    const handleDelete = () => {
        router.delete(`/templates/${template.id}`, {
            onSuccess: () => {
                setDeleteDialog(false);
            },
        });
    };

    const handleLeave = () => {
        router.post(`/templates/${template.id}/leave`, {}, {
            onSuccess: () => {
                setLeaveDialog(false);
            },
        });
    };

    const handleDuplicate = () => {
        router.post(`/templates/${template.id}/duplicate`);
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, any> = {
            announcements: '📢',
            notifications: '🔔',
            alerts: '⚠️',
            reports: '📊',
            custom: '✨',
        };
        return icons[category] || '📝';
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            announcements: 'bg-blue-500',
            notifications: 'bg-green-500',
            alerts: 'bg-red-500',
            reports: 'bg-purple-500',
            custom: 'bg-gray-500',
        };
        return colors[category] || 'bg-gray-500';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={template.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-3xl">
                            {getCategoryIcon(template.category)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
                                {template.is_owner ? (
                                    <Badge variant="default">Owner</Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        {template.permission_level === 'edit' ? 'Editor' : 'Viewer'}
                                    </Badge>
                                )}
                            </div>
                            {template.description && (
                                <p className="text-muted-foreground mt-1">{template.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                                <Badge variant="outline" className="gap-1">
                                    {getCategoryIcon(template.category)}
                                    {template.category}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <User className="h-3.5 w-3.5" />
                                    {template.user.name}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(template.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <Link href={`/send?template=${template.id}`}>
                            <Button className="gap-2">
                                <Rocket className="h-4 w-4" />
                                Use Template
                            </Button>
                        </Link>
                        {(template.is_owner || template.permission_level === 'edit') && (
                            <Link href={`/templates/${template.id}/edit`}>
                                <Button variant="outline" className="gap-2">
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        <Button variant="outline" className="gap-2" onClick={handleDuplicate}>
                            <Copy className="h-4 w-4" />
                            Duplicate
                        </Button>
                        {template.is_owner && (
                            <>
                                <Link href={`/templates/${template.id}/collaborators`}>
                                    <Button variant="outline" className="gap-2">
                                        <Users className="h-4 w-4" />
                                        Share
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="gap-2 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteDialog(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </>
                        )}
                        {!template.is_owner && (
                            <Button
                                variant="outline"
                                className="gap-2 text-destructive hover:text-destructive"
                                onClick={() => setLeaveDialog(true)}
                            >
                                <LogOut className="h-4 w-4" />
                                Leave
                            </Button>
                        )}
                    </div>
                </div>

                {/* Message Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Message Preview</CardTitle>
                        <CardDescription>
                            This is how your message will look in Discord
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-[#36393f] rounded-lg p-4 text-white font-['Whitney','Helvetica_Neue','Helvetica','Arial',sans-serif]">
                            {/* Message Content */}
                            {template.content.content && (
                                <div className="mb-2 text-sm leading-relaxed whitespace-pre-wrap">
                                    {template.content.content}
                                </div>
                            )}

                            {/* Embeds */}
                            {template.content.embeds && template.content.embeds.length > 0 && (
                                <div className="space-y-2">
                                    {template.content.embeds.map((embed: any, index: number) => (
                                        <div
                                            key={index}
                                            className="border-l-4 bg-[#2f3136] rounded p-3"
                                            style={{
                                                borderLeftColor: embed.color
                                                    ? `#${embed.color.toString(16).padStart(6, '0')}`
                                                    : '#5865F2'
                                            }}
                                        >
                                            {/* Author */}
                                            {embed.author && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    {embed.author.icon_url && (
                                                        <img
                                                            src={embed.author.icon_url}
                                                            alt=""
                                                            className="w-6 h-6 rounded-full"
                                                        />
                                                    )}
                                                    <span className="text-sm font-semibold">
                                                        {embed.author.name}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Title */}
                                            {embed.title && (
                                                <div className="font-semibold text-base mb-1">
                                                    {embed.title}
                                                </div>
                                            )}

                                            {/* Description */}
                                            {embed.description && (
                                                <div className="text-sm text-gray-300 mb-2 whitespace-pre-wrap">
                                                    {embed.description}
                                                </div>
                                            )}

                                            {/* Fields */}
                                            {embed.fields && embed.fields.length > 0 && (
                                                <div className="grid gap-2 mt-2" style={{
                                                    gridTemplateColumns: embed.fields.some((f: any) => f.inline)
                                                        ? 'repeat(auto-fit, minmax(150px, 1fr))'
                                                        : '1fr'
                                                }}>
                                                    {embed.fields.map((field: any, fieldIndex: number) => (
                                                        <div key={fieldIndex} className={field.inline ? '' : 'col-span-full'}>
                                                            <div className="font-semibold text-sm mb-1">
                                                                {field.name}
                                                            </div>
                                                            <div className="text-sm text-gray-300">
                                                                {field.value}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Image */}
                                            {embed.image?.url && (
                                                <img
                                                    src={embed.image.url}
                                                    alt=""
                                                    className="mt-3 rounded max-w-full"
                                                    style={{ maxHeight: '300px' }}
                                                />
                                            )}

                                            {/* Thumbnail */}
                                            {embed.thumbnail?.url && (
                                                <img
                                                    src={embed.thumbnail.url}
                                                    alt=""
                                                    className="float-right ml-3 rounded"
                                                    style={{ maxWidth: '80px', maxHeight: '80px' }}
                                                />
                                            )}

                                            {/* Footer */}
                                            {embed.footer && (
                                                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                                                    {embed.footer.icon_url && (
                                                        <img
                                                            src={embed.footer.icon_url}
                                                            alt=""
                                                            className="w-5 h-5 rounded-full"
                                                        />
                                                    )}
                                                    <span>{embed.footer.text}</span>
                                                    {embed.timestamp && (
                                                        <>
                                                            <span>•</span>
                                                            <span>
                                                                {new Date(embed.timestamp).toLocaleString()}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!template.content.content && (!template.content.embeds || template.content.embeds.length === 0) && (
                                <div className="text-center text-gray-400 py-8">
                                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No content to preview</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                onConfirm={handleDelete}
                title="Delete Template"
                description="Are you sure you want to delete this template? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
            />

            {/* Leave Confirmation Dialog */}
            <ConfirmDialog
                open={leaveDialog}
                onOpenChange={setLeaveDialog}
                onConfirm={handleLeave}
                title="Leave Template"
                description="Are you sure you want to leave this template? You will lose access to it."
                confirmText="Leave"
                variant="destructive"
            />
        </AppLayout>
    );
}
