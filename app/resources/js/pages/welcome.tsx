import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Webhook, LayoutGrid, Send, Zap, Shield, FileText } from 'lucide-react';
import AppLogo from '@/components/app-logo';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            title: 'Webhook Management',
            description: 'Create, organize, and monitor your Discord webhooks in one place.',
            icon: Webhook,
        },
        {
            title: 'Message Templates',
            description: 'Save frequently used message layouts and reuse them instantly.',
            icon: FileText,
        },
        {
            title: 'Quick Send',
            description: 'Send messages rapidly without complex configurations.',
            icon: Zap,
        },
        {
            title: 'Preview Mode',
            description: 'See exactly how your messages will look before sending them.',
            icon: LayoutGrid,
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Head title="Welcome" />

            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AppLogo />
                    </div>
                    <nav className="flex items-center gap-2 sm:gap-4">
                        {auth.user ? (
                            <Link href="/dashboard">
                                <Button size="sm" className="sm:inline-flex">Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Log in</Button>
                                </Link>
                                {canRegister && (
                                    <Link href="/register">
                                        <Button size="sm">Get Started</Button>
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="py-24 px-4 bg-muted/30">
                    <div className="container mx-auto text-center max-w-3xl space-y-6">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight">
                            Simplify Your Discord <br className="hidden sm:block" />
                            <span className="text-blue-600">Webhooks</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
                            The ultimate tool to manage, template, and send Discord messages with ease.
                            Professional formatting without the hassle.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 px-6 sm:px-0">
                            {auth.user ? (
                                <Link href="/dashboard" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full h-12 px-8 text-lg">
                                        Open Dashboard <LayoutGrid className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/register" className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full h-12 px-8 text-lg">
                                            Start for Free <Zap className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <Link href="/login" className="w-full sm:w-auto">
                                        <Button variant="outline" size="lg" className="w-full h-12 px-8 text-lg">
                                            Log in
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-24 px-4 bg-background">
                    <div className="container mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
                            <p className="text-muted-foreground text-lg">
                                Powerful features to enhance your Discord workflow
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature) => (
                                <Card key={feature.title} className="border-none shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <CardHeader>
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                            <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-base">
                                            {feature.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t py-12 bg-muted/10">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="p-1.5 bg-neutral-200 dark:bg-neutral-800 rounded">
                            <Send className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-foreground">Discord Webhook Manager</span>
                    </div>
                    <p className="text-sm">
                        &copy; {new Date().getFullYear()} Edgar. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
