import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Bug, Calendar } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { changelogData } from '@/data/changelog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Changelog',
        href: '/changelog',
    },
];

export default function Changelog() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Changelog" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Calendar className="h-8 w-8 text-primary shrink-0" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Historial de Cambios</h1>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                            Todas las actualizaciones, mejoras y nuevas funcionalidades
                        </p>
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical line - Hidden on mobile */}
                    <div className="absolute left-8 top-0 bottom-0 hidden w-0.5 bg-border sm:block" />

                    {/* Versions */}
                    <div className="space-y-8">
                        {changelogData.map((version, versionIndex) => (
                            <div key={version.version} className="relative pl-0 sm:pl-20">
                                {/* Version marker - Hidden on mobile, shown on sm+ */}
                                <div className="absolute left-0 top-0 hidden sm:flex items-center gap-3">
                                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg">
                                        v{version.version}
                                    </div>
                                </div>

                                {/* Mobile version marker - Shown only on mobile */}
                                <div className="mb-4 flex sm:hidden">
                                    <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm">
                                        v{version.version}
                                    </div>
                                </div>

                                {/* Version content */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle className="text-xl sm:text-2xl">Versión {version.version}</CardTitle>
                                                <CardDescription className="text-sm sm:text-base mt-1">
                                                    {version.date}
                                                </CardDescription>
                                            </div>
                                            {versionIndex === 0 && (
                                                <Badge className="w-fit bg-primary">Última versión</Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Features */}
                                        {version.features.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                                    <h3 className="font-semibold text-lg">Nuevas Funcionalidades</h3>
                                                </div>
                                                <div className="space-y-3 pl-0 sm:pl-7">
                                                    {version.features.map((feature, idx) => (
                                                        <div key={idx} className="border-l-2 border-purple-500 pl-4 py-1">
                                                            <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {feature.description}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Improvements */}
                                        {version.improvements.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Zap className="h-5 w-5 text-blue-500" />
                                                    <h3 className="font-semibold text-lg">Mejoras</h3>
                                                </div>
                                                <div className="space-y-3 pl-0 sm:pl-7">
                                                    {version.improvements.map((improvement, idx) => (
                                                        <div key={idx} className="border-l-2 border-blue-500 pl-4 py-1">
                                                            <h4 className="font-medium text-sm mb-1">{improvement.title}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {improvement.description}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Fixes */}
                                        {version.fixes.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Bug className="h-5 w-5 text-green-500" />
                                                    <h3 className="font-semibold text-lg">Correcciones</h3>
                                                </div>
                                                <div className="space-y-3 pl-0 sm:pl-7">
                                                    {version.fixes.map((fix, idx) => (
                                                        <div key={idx} className="border-l-2 border-green-500 pl-4 py-1">
                                                            <h4 className="font-medium text-sm mb-1">{fix.title}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {fix.description}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
