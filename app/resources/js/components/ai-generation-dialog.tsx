import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AiGenerationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerated: (content: string) => void;
}

export function AiGenerationDialog({
    open,
    onOpenChange,
    onGenerated,
}: AiGenerationDialogProps) {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setGenerating(true);
        setError(null);
        try {
            const response = await axios.post('/ai/generate', { prompt });
            if (response.data.success) {
                onGenerated(response.data.content);
                onOpenChange(false);
                setPrompt('');
            }
        } catch (err: any) {
            console.error('AI Generation failed', err);
            const message = err.response?.data?.message || 'Error al generar contenido con IA. Por favor, inténtalo de nuevo.';
            setError(message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Generar con IA
                    </DialogTitle>
                    <DialogDescription>
                        Escribe una breve descripción de lo que quieres que contenga el mensaje. La IA se encargará de darle formato para Discord.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {error && (
                        <div className="p-3 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md border border-red-200 dark:border-red-900/50">
                            {error}
                        </div>
                    )}
                    <Textarea
                        placeholder="Ej: Un anuncio épico para un torneo de Valorant este domingo a las 6 PM. Incluye premios y un link de registro."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={5}
                        className="resize-none"
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={generating}
                    >
                        Cancelar
                    </Button>
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={generating || !prompt.trim()}
                        className="btn-ai-minimal min-w-[120px]"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#a855f7]" />
                                <span className="btn-ai-text">Generando...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4 text-[#a855f7]" />
                                <span className="btn-ai-text">Generar</span>
                            </>
                        )}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
