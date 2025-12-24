import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Upload, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { SchedulePicker } from '@/components/schedule-picker';

interface Webhook {
    id: number;
    name: string;
    avatar_url?: string;
}

interface Template {
    id: number;
    name: string;
    category: string;
    content: {
        content?: string;
        embeds?: any[];
    };
}

interface ScheduledMessageFile {
    id: number;
    filename: string;
    size: number;
}

interface ScheduledMessage {
    id: number;
    webhook_id: number;
    template_id?: number;
    message_content: {
        content: string;
        embeds: any[];
    };
    schedule_type: 'once' | 'recurring';
    scheduled_at?: string;
    recurrence_pattern?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        time: string;
        days: number[];
        day: number;
    };
    timezone: string;
    max_sends?: number;
    files: ScheduledMessageFile[];
}

interface Props {
    scheduledMessage: ScheduledMessage;
    webhooks: Webhook[];
    templates: Template[];
}

export default function ScheduledEdit({ scheduledMessage, webhooks, templates }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Scheduled Messages', href: '/scheduled' },
        { title: 'Edit', href: `/scheduled/${scheduledMessage.id}/edit` },
    ];

    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(scheduledMessage.template_id || null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [filesToRemove, setFilesToRemove] = useState<number[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        webhook_id: scheduledMessage.webhook_id,
        template_id: scheduledMessage.template_id || null,
        message_content: scheduledMessage.message_content,
        schedule_type: scheduledMessage.schedule_type,
        scheduled_at: scheduledMessage.scheduled_at ? scheduledMessage.scheduled_at.slice(0, 16) : '',
        recurrence_pattern: scheduledMessage.recurrence_pattern || {
            frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
            time: '12:00',
            days: [] as number[],
            day: 1,
        },
        timezone: scheduledMessage.timezone,
        max_sends: scheduledMessage.max_sends,
        files: [] as File[],
        remove_files: [] as number[],
        _method: 'PUT',
    });

    const handleTemplateChange = (templateId: string) => {
        if (templateId === 'none') {
            setSelectedTemplate(null);
            setData('template_id', null);
            return;
        }

        const template = templates.find(t => t.id.toString() === templateId);
        if (template) {
            setSelectedTemplate(template.id);
            setData({
                ...data,
                template_id: template.id,
                message_content: {
                    content: template.content.content || '',
                    embeds: template.content.embeds || [],
                },
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles([...selectedFiles, ...newFiles]);
            setData('files', [...selectedFiles, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setData('files', newFiles);
    };

    const removeExistingFile = (fileId: number) => {
        const newFilesToRemove = [...filesToRemove, fileId];
        setFilesToRemove(newFilesToRemove);
        setData('remove_files', newFilesToRemove);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/scheduled/${scheduledMessage.id}`, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Scheduled Message" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/scheduled">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Scheduled Message</h1>
                        <p className="text-muted-foreground mt-1">
                            Update your scheduled message
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Webhook</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="webhook_id">Webhook</Label>
                                        <Select
                                            value={data.webhook_id?.toString() || ''}
                                            onValueChange={(value) => setData('webhook_id', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {webhooks.map((webhook) => (
                                                    <SelectItem key={webhook.id} value={webhook.id.toString()}>
                                                        {webhook.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {templates.length > 0 && (
                                        <div className="space-y-2">
                                            <Label htmlFor="template">Template (Optional)</Label>
                                            <Select
                                                value={selectedTemplate?.toString() || 'none'}
                                                onValueChange={handleTemplateChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {templates.map((template) => (
                                                        <SelectItem key={template.id} value={template.id.toString()}>
                                                            {template.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Message Content</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="content">Message Text</Label>
                                        <Textarea
                                            id="content"
                                            value={data.message_content.content}
                                            onChange={(e) =>
                                                setData('message_content', {
                                                    ...data.message_content,
                                                    content: e.target.value,
                                                })
                                            }
                                            rows={8}
                                            className="resize-none"
                                        />
                                    </div>

                                    {/* Existing Files */}
                                    {scheduledMessage.files.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Current Files</Label>
                                            <div className="space-y-2">
                                                {scheduledMessage.files.filter(f => !filesToRemove.includes(f.id)).map((file) => (
                                                    <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                                        <span className="text-sm truncate">{file.filename}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeExistingFile(file.id)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* New Files */}
                                    <div className="space-y-2">
                                        <Label htmlFor="files">Add New Files</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="files"
                                                type="file"
                                                multiple
                                                accept="image/*,video/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById('files')?.click()}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload Files
                                            </Button>
                                        </div>
                                        {selectedFiles.length > 0 && (
                                            <div className="space-y-2">
                                                {selectedFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                                        <span className="text-sm truncate">{file.name}</span>
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
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <SchedulePicker
                                scheduleType={data.schedule_type}
                                onScheduleTypeChange={(type) => setData('schedule_type', type)}
                                scheduledAt={data.scheduled_at}
                                onScheduledAtChange={(value) => setData('scheduled_at', value)}
                                recurrencePattern={data.recurrence_pattern}
                                onRecurrencePatternChange={(pattern) => setData('recurrence_pattern', pattern)}
                                timezone={data.timezone}
                                onTimezoneChange={(tz) => setData('timezone', tz)}
                                maxSends={data.max_sends}
                                onMaxSendsChange={(value) => setData('max_sends', value)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end border-t pt-6">
                        <Link href="/scheduled">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Send className="h-4 w-4" />
                            {processing ? 'Updating...' : 'Update Message'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
