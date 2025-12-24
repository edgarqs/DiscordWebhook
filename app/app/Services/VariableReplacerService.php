<?php

namespace App\Services;

use App\Models\User;
use App\Models\Webhook;
use Carbon\Carbon;

class VariableReplacerService
{
    protected array $variables = [
        'date' => 'Fecha actual (formato DD/MM/YYYY)',
        'time' => 'Hora actual (formato 24h)',
        'datetime' => 'Fecha y hora completa',
        'username' => 'Nombre del usuario actual',
        'user_email' => 'Email del usuario actual',
        'webhook_name' => 'Nombre del webhook',
        'day' => 'Día de la semana',
        'month' => 'Mes actual',
        'year' => 'Año actual',
    ];

    /**
     * Replace variables in a string
     */
    public function replace(string $content, User $user, ?Webhook $webhook = null): string
    {
        $now = Carbon::now();
        
        $replacements = [
            '{{date}}' => $now->format('d/m/Y'),
            '{{time}}' => $now->format('H:i'),
            '{{datetime}}' => $now->format('d/m/Y H:i'),
            '{{username}}' => $user->name,
            '{{user_email}}' => $user->email,
            '{{webhook_name}}' => $webhook?->name ?? 'N/A',
            '{{day}}' => $now->translatedFormat('l'),
            '{{month}}' => $now->translatedFormat('F'),
            '{{year}}' => $now->format('Y'),
        ];

        return str_replace(
            array_keys($replacements),
            array_values($replacements),
            $content
        );
    }

    /**
     * Replace variables in entire payload (content, embeds, etc.)
     */
    public function replaceInPayload(array $payload, User $user, ?Webhook $webhook = null): array
    {
        // Convert to JSON, replace, and convert back
        $json = json_encode($payload);
        $replaced = $this->replace($json, $user, $webhook);
        return json_decode($replaced, true);
    }

    /**
     * Get list of available variables with descriptions
     */
    public function getAvailableVariables(): array
    {
        return $this->variables;
    }

    /**
     * Get example values for preview
     */
    public function getExampleReplacements(): array
    {
        $now = Carbon::now();
        
        return [
            '{{date}}' => $now->format('d/m/Y'),
            '{{time}}' => $now->format('H:i'),
            '{{datetime}}' => $now->format('d/m/Y H:i'),
            '{{username}}' => 'John Doe',
            '{{user_email}}' => 'john@example.com',
            '{{webhook_name}}' => 'My Webhook',
            '{{day}}' => $now->translatedFormat('l'),
            '{{month}}' => $now->translatedFormat('F'),
            '{{year}}' => $now->format('Y'),
        ];
    }
}
