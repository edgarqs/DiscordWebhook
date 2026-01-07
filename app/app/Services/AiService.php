<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    /**
     * Generate content using OpenAI
     *
     * @param string $prompt
     * @param string $systemPrompt
     * @return string|null
     */
    public function generateContent(string $prompt, string $systemPrompt = 'Eres un experto en comunicación para Discord. Genera únicamente el contenido del mensaje solicitado utilizando formato Markdown de Discord (negritas, listas, emojis, etc.). No incluyas introducciones, explicaciones, ni textos adicionales. Solo devuelve el texto que debe ser enviado a Discord.'): ?string
    {
        $provider = Setting::get('ai_provider', 'openai');
        
        if ($provider === 'gemini') {
            return $this->generateWithGemini($prompt, $systemPrompt);
        }

        return $this->generateWithOpenAi($prompt, $systemPrompt);
    }

    /**
     * Generate content using OpenAI
     */
    private function generateWithOpenAi(string $prompt, string $systemPrompt): ?string
    {
        $apiKey = Setting::get('openai_api_key');

        if (!$apiKey) {
            Log::error('OpenAI API Key not found in settings');
            return null;
        }

        try {
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::withoutVerifying()
                ->withToken($apiKey)
                ->timeout(30)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => 1000,
                ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content');
            }

            Log::error('OpenAI API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('OpenAI generate content exception', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Generate content using Google Gemini
     */
    private function generateWithGemini(string $prompt, string $systemPrompt): ?string
    {
        $apiKey = trim(Setting::get('gemini_api_key', ''));

        if (!$apiKey) {
            Log::error('Gemini API Key not found in settings');
            return null;
        }

        try {
            // Using gemini-2.5-flash which is the current stable model in 2026
            $url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" . rawurlencode($apiKey);

            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::withoutVerifying()
                ->timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($url, [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [
                                ['text' => $systemPrompt . "\n\n" . $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'maxOutputTokens' => 1024,
                    ]
                ]);

            if ($response->successful()) {
                $content = $response->json('candidates.0.content.parts.0.text');
                if ($content) {
                    return $content;
                }
                
                Log::warning('Gemini response successful but content is missing', ['json' => $response->json()]);
                return null;
            }

            Log::error('Gemini API Error Detail', [
                'status' => $response->status(),
                'body' => $response->body(),
                'url_mask' => 'https://.../v1/models/gemini-2.5-flash:generateContent?key=***'
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Gemini generate content exception', ['error' => $e->getMessage()]);
            return null;
        }
    }
}
