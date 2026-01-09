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
import { Sparkles, Zap, Calendar, AtSign, Layout } from 'lucide-react';
import { router } from '@inertiajs/react';

interface WhatsNewModalProps {
    version?: string;
}

export function WhatsNewModal({ version = '1.4.0' }: WhatsNewModalProps) {
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
            icon: <Sparkles className="h-5 w-5 text-purple-500" />,
            title: 'Generación con IA',
            description: 'Usa IA (OpenAI o Gemini) para redactar tus mensajes automáticamente. ¡Pruébalo en cualquier editor!',
            type: 'feature',
        },
        {
            icon: <Calendar className="h-5 w-5 text-blue-500" />,
            title: 'Programación de Mensajes',
            description: 'Envía mensajes en el momento perfecto. Soporte para envíos únicos y recurrentes.',
            type: 'feature',
        },
        {
            icon: <AtSign className="h-5 w-5 text-green-500" />,
            title: 'Soporte de Menciones',
            description: 'Ahora puedes mencionar usuarios, roles y @everyone directamente desde el editor.',
            type: 'feature',
        },
        {
            icon: <Zap className="h-5 w-5 text-yellow-500" />,
            title: 'Variables Dinámicas',
            description: 'Usa {{date}}, {{time}}, {{username}} y más en tus plantillas y mensajes programados.',
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

                <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    {updates.map((update, index) => (
                        <div
                            key={index}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <div className="flex items-center gap-3 sm:block">
                                <div className="shrink-0 mt-0.5">
                                    {update.icon}
                                </div>
                                <div className="sm:hidden shrink-0 ml-auto">
                                    <span className={`
                                        text-[10px] px-2 py-0.5 rounded-full font-medium
                                        ${update.type === 'feature'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-blue-500/10 text-blue-500'
                                        }
                                    `}>
                                        {update.type === 'feature' ? 'Nuevo' : 'Mejora'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm mb-1">
                                    {update.title}
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {update.description}
                                </p>
                            </div>
                            <div className="hidden sm:block shrink-0">
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

                <DialogFooter className="flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 mr-auto pb-2 sm:pb-0">
                        <Checkbox
                            id="dont-show"
                            checked={dontShowAgain}
                            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                        />
                        <label
                            htmlFor="dont-show"
                            className="text-xs sm:text-sm text-muted-foreground cursor-pointer select-none"
                        >
                            No volver a mostrar
                        </label>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            handleClose();
                            router.visit('/changelog');
                        }}
                        className="w-full sm:w-auto"
                    >
                        Ver Historial
                    </Button>
                    <Button onClick={handleClose} className="w-full sm:w-auto">
                        ¡Entendido!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
