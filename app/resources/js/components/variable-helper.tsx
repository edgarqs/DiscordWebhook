import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Zap, Copy, Check } from 'lucide-react';

interface VariableHelperProps {
    variables?: Record<string, string>;
}

export function VariableHelper({ variables }: VariableHelperProps) {
    const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

    const defaultVariables = {
        '{{date}}': 'Fecha actual (24/12/2024)',
        '{{time}}': 'Hora actual (11:23)',
        '{{datetime}}': 'Fecha y hora (24/12/2024 11:23)',
        '{{username}}': 'Nombre del usuario',
        '{{user_email}}': 'Email del usuario',
        '{{webhook_name}}': 'Nombre del webhook',
        '{{day}}': 'Día de la semana (Lunes)',
        '{{month}}': 'Mes actual (Diciembre)',
        '{{year}}': 'Año actual (2024)',
    };

    const variableList = variables || defaultVariables;

    const handleCopy = (variable: string) => {
        navigator.clipboard.writeText(variable);
        setCopiedVariable(variable);
        setTimeout(() => setCopiedVariable(null), 2000);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Zap className="h-4 w-4" />
                    Variables
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Variables Dinámicas</DialogTitle>
                    <DialogDescription>
                        Usa estas variables en tu plantilla. Se reemplazarán automáticamente al usar la plantilla.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {Object.entries(variableList).map(([key, description]) => (
                        <div
                            key={key}
                            className="flex items-start justify-between gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <code className="text-sm font-mono font-semibold text-primary break-all">
                                    {key}
                                </code>
                                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">
                                    {description}
                                </p>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopy(key)}
                                className="shrink-0 h-8 w-8 p-0"
                            >
                                {copiedVariable === key ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-4 mt-4">
                    <p className="text-xs text-muted-foreground">
                        <strong>Tip:</strong> Puedes usar variables en cualquier parte del mensaje: contenido, títulos de embeds, descripciones, etc.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
