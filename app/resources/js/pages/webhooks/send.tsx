import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';
import { Webhook } from '@/types';

interface SendProps {
    webhook: Webhook;
}

export default function WebhookSend({ webhook }: SendProps) {
    const { data, setData, post, processing, errors } = useForm({
        content: '',
        embeds: [] as any[],
        components: [] as any[],
    });

    const [activeTab, setActiveTab] = useState<'content' | 'embeds' | 'buttons'>('content');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/webhooks/${webhook.id}/send`);
    };

    const addEmbed = () => {
        setData('embeds', [
            ...data.embeds,
            {
                title: '',
                description: '',
                color: 5814783, // Discord blurple
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

    return (
        <AppLayout>
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
                                    onClick={() => setActiveTab('buttons')}
                                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'buttons'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Buttons
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

                            {/* Buttons Tab */}
                            {activeTab === 'buttons' && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>Button support coming soon</p>
                                    <p className="text-sm mt-2">
                                        For now, you can send messages with content and embeds
                                    </p>
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
                                        className="border-l-4 bg-[#2f3136] rounded p-3 space-y-2"
                                        style={{ borderColor: `#${embed.color?.toString(16).padStart(6, '0') || '5865f2'}` }}
                                    >
                                        {embed.title && (
                                            <p className="text-white font-semibold">{embed.title}</p>
                                        )}
                                        {embed.description && (
                                            <p className="text-[#dcddde] text-sm whitespace-pre-wrap">
                                                {embed.description}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                {!data.content && data.embeds.length === 0 && (
                                    <p className="text-[#72767d] text-center py-8">
                                        Your message preview will appear here
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
