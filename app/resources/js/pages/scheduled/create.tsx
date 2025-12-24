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

interface Props {
    webhooks: Webhook[];
    templates: Template[];
}

export default function ScheduledCreate({ webhooks, templates }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Scheduled Messages', href: '/scheduled' },
        { title: 'Create', href: '/scheduled/create' },
    ];

    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const getDefaultDateTime = () => {
        const date = new Date();
        date.setHours(date.getHours() + 1);
        return date.toISOString().slice(0, 16);
    };

    const { data, setData, post, processing, errors } = useForm({
        webhook_id: webhooks.length > 0 ? webhooks[0].id : null,
        template_id: null as number | null,
        message_content: {
            content: '',
            embeds: [] as any[],
        },
        schedule_type: 'once' as 'once' | 'recurring',
        scheduled_at: getDefaultDateTime(),
        recurrence_pattern: {
            frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
            time: '12:00',
            days: [] as number[],
            day: 1,
        },
        timezone: 'Europe/Madrid',
        max_sends: undefined as number | undefined,
        files: [] as File[],
    });

    const handleTemplateChange = (templateId: string) => {
        if (templateId === 'none') {
            setSelectedTemplate(null);
            setData({
                ...data,
                template_id: null,
            });
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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/scheduled', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedule Message" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/scheduled">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Schedule Message</h1>
                        <p className="text-muted-foreground mt-1">
                            Create a new scheduled or recurring message
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left Column - Message Configuration */}
                        <div className="space-y-6">
                            {/* Webhook Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Webhook</CardTitle>
                                    <CardDescription>
                                        Select the webhook to send this message to
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="webhook_id">Webhook</Label>
                                        <Select
                                            value={data.webhook_id?.toString() || ''}
                                            onValueChange={(value) => setData('webhook_id', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a webhook" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {webhooks.map((webhook) => (
                                                    <SelectItem key={webhook.id} value={webhook.id.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            {webhook.avatar_url ? (
                                                                <img
                                                                    src={webhook.avatar_url}
                                                                    alt={webhook.name}
                                                                    className="h-5 w-5 rounded-full"
                                                                />
                                                            ) : (
                                                                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                                                            )}
                                                            {webhook.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.webhook_id && (
                                            <p className="text-sm text-destructive">{errors.webhook_id}</p>
                                        )}
                                    </div>

                                    {/* Template Selection (Optional) */}
                                    {templates.length > 0 && (
                                        <div className="space-y-2">
                                            <Label htmlFor="template">Template (Optional)</Label>
                                            <Select
                                                value={selectedTemplate?.toString() || 'none'}
                                                onValueChange={handleTemplateChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a template" />
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

                            {/* Message Content */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Message Content</CardTitle>
                                    <CardDescription>
                                        Enter the message content to be sent
                                    </CardDescription>
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
                                            placeholder="Enter your message here..."
                                            rows={8}
                                            className="resize-none"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            {data.message_content.content.length} / 2000 characters
                                        </p>
                                    </div>

                                    {/* File Upload */}
                                    <div className="space-y-2">
                                        <Label htmlFor="files">Attachments (Optional)</Label>
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
                                        <p className="text-sm text-muted-foreground">
                                            Max 10MB per file. Images and videos only.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Schedule Configuration */}
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
                            {processing ? 'Scheduling...' : 'Schedule Message'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
