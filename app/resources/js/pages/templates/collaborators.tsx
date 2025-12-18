import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Trash2, UserPlus, CheckCircle, ArrowLeft } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';

const getBreadcrumbs = (templateId: number, templateName: string): BreadcrumbItem[] => [
    {
        title: 'Templates',
        href: '/templates',
    },
    {
        title: templateName,
        href: `/templates/${templateId}/edit`,
    },
    {
        title: 'Collaborators',
        href: `/templates/${templateId}/collaborators`,
    },
];

interface Collaborator {
    id: number;
    name: string;
    email: string;
    permission_level: 'view' | 'edit';
    created_at: string;
}

interface Template {
    id: number;
    name: string;
    is_owner: boolean;
}

interface Props {
    template: Template;
    collaborators: Collaborator[];
}

export default function TemplateCollaborators({ template, collaborators }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        permission_level: 'view' as 'view' | 'edit',
    });

    const [removeCollaboratorDialog, setRemoveCollaboratorDialog] = useState(false);
    const [collaboratorToRemove, setCollaboratorToRemove] = useState<number | null>(null);

    const breadcrumbs = getBreadcrumbs(template.id, template.name);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/templates/${template.id}/collaborators`, {
            onSuccess: () => reset(),
            preserveScroll: true,
            only: ['collaborators'],
        });
    };

    const handleUpdatePermission = (collaboratorId: number, newLevel: string) => {
        router.put(
            `/templates/${template.id}/collaborators/${collaboratorId}`,
            { permission_level: newLevel },
            {
                preserveScroll: true,
                only: ['collaborators'],
            }
        );
    };

    const handleRemoveCollaboratorClick = (collaboratorId: number) => {
        setCollaboratorToRemove(collaboratorId);
        setRemoveCollaboratorDialog(true);
    };

    const handleConfirmRemoveCollaborator = () => {
        if (collaboratorToRemove) {
            router.delete(
                `/templates/${template.id}/collaborators/${collaboratorToRemove}`,
                {
                    preserveScroll: true,
                    only: ['collaborators'],
                    onFinish: () => {
                        setCollaboratorToRemove(null);
                        setRemoveCollaboratorDialog(false);
                    }
                }
            );
        }
    };

    const getPermissionBadge = (level: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
            edit: 'default',
            view: 'outline',
        };
        return (
            <Badge variant={variants[level] || 'outline'}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Collaborators - ${template.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manage Collaborators</h1>
                        <p className="text-muted-foreground mt-1">
                            Template: <span className="font-medium">{template.name}</span>
                        </p>
                    </div>
                    <Link href={`/templates/${template.id}/edit`}>
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Template
                        </Button>
                    </Link>
                </div>

                {/* Add New Collaborator */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Add Collaborator
                        </CardTitle>
                        <CardDescription>
                            Add users by email to collaborate on this template
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="user@example.com"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="permission_level">Permission Level</Label>
                                    <Select
                                        value={data.permission_level}
                                        onValueChange={(value: any) =>
                                            setData('permission_level', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="view">
                                                View - Can view and use template
                                            </SelectItem>
                                            <SelectItem value="edit">
                                                Edit - Can view, use, and modify template
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button type="submit" disabled={processing}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Collaborator
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Current Collaborators */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Current Collaborators
                        </CardTitle>
                        <CardDescription>
                            Users with access to this template
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {collaborators.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <UserPlus className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground mb-4">
                                    No collaborators yet. Add someone to get started!
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Permission</TableHead>
                                        <TableHead>Added</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {collaborators.map((collaborator) => (
                                        <TableRow key={collaborator.id}>
                                            <TableCell className="font-medium">
                                                {collaborator.name}
                                            </TableCell>
                                            <TableCell>{collaborator.email}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={collaborator.permission_level}
                                                    onValueChange={(value) =>
                                                        handleUpdatePermission(
                                                            collaborator.id,
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-28">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="view">
                                                            View
                                                        </SelectItem>
                                                        <SelectItem value="edit">
                                                            Edit
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    collaborator.created_at
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleRemoveCollaboratorClick(
                                                            collaborator.id
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Remove Collaborator Dialog */}
                <ConfirmDialog
                    open={removeCollaboratorDialog}
                    onOpenChange={setRemoveCollaboratorDialog}
                    onConfirm={handleConfirmRemoveCollaborator}
                    title="Remove Collaborator"
                    description="Are you sure you want to remove this collaborator? They will lose access to this template immediately."
                    confirmText="Remove"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </AppLayout>
    );
}
