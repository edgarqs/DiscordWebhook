import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Zap, Bug, Layout } from 'lucide-react';
import { router } from '@inertiajs/react';

interface WhatsNewModalProps {
    version?: string;
}

export function WhatsNewModal({ version = '1.1.0' }: WhatsNewModalProps) {
    const [open, setOpen] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        // Check if user has dismissed this version
        const dismissedVersion = localStorage.getItem('whats_new_dismissed');
        if (dismissedVersion !== version) {
            setOpen(true);
        }
    }, [version]);

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem('whats_new_dismissed', version);
        }
        setOpen(false);
    };

    const updates = [
        {
            icon: <Zap className="h-5 w-5 text-yellow-500" />,
            title: 'Variables Dinámicas',
            description: 'Usa variables como {{date}}, {{time}}, {{username}} en tus plantillas. Se reemplazan automáticamente al enviar.',
            type: 'feature',
        },
        {
            icon: <Layout className="h-5 w-5 text-blue-500" />,
            title: 'Diseño Compacto',
            description: 'Cards de webhooks y templates rediseñadas con un diseño más compacto y eficiente.',
            type: 'improvement',
        },
        {
            icon: <Bug className="h-5 w-5 text-green-500" />,
            title: 'Búsqueda Mejorada',
            description: 'Ahora puedes buscar webhooks por nombre y etiquetas (tags).',
            type: 'improvement',
        },
        {
            icon: <Sparkles className="h-5 w-5 text-purple-500" />,
            title: 'Botón "Leave"',
            description: 'Los colaboradores ahora pueden abandonar webhooks y templates compartidos fácilmente.',
            type: 'feature',
        },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <DialogTitle className="text-2xl">¡Novedades v{version}!</DialogTitle>
                    </div>
                    <DialogDescription>
                        Descubre las últimas mejoras y funcionalidades
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {updates.map((update, index) => (
                        <div
                            key={index}
                            className="flex gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <div className="shrink-0 mt-0.5">
                                {update.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm mb-1">
                                    {update.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {update.description}
                                </p>
                            </div>
                            <div className="shrink-0">
                                <span className={`
                                    text-xs px-2 py-1 rounded-full
                                    ${update.type === 'feature'
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-blue-500/10 text-blue-500'
                                    }
                                `}>
                                    {update.type === 'feature' ? 'Nuevo' : 'Mejora'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2 mr-auto">
                        <Checkbox
                            id="dont-show"
                            checked={dontShowAgain}
                            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                        />
                        <label
                            htmlFor="dont-show"
                            className="text-sm text-muted-foreground cursor-pointer select-none"
                        >
                            No volver a mostrar
                        </label>
                    </div>
                    <Button onClick={handleClose}>
                        ¡Entendido!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
