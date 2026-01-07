<?php

namespace App\Http\Controllers;

use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AiController extends Controller
{
    /**
     * Generate message content using AI
     */
    public function generate(Request $request, AiService $aiService)
    {
        $user = auth()->user();

        if (!$user->can_use_ai && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para usar esta función.',
            ], 403);
        }

        // Check daily limit for non-admins
        if (!$user->isAdmin()) {
            $dailyLimit = \App\Models\Setting::get('ai_daily_limit', 5);
            $usageCount = \App\Models\AiUsage::where('user_id', $user->id)
                ->whereDate('created_at', now()->today())
                ->count();

            if ($usageCount >= $dailyLimit) {
                return response()->json([
                    'success' => false,
                    'message' => 'Has alcanzado el límite diario de uso de la IA (' . $dailyLimit . '). ¡Vuelve mañana!',
                ], 429);
            }
        }

        $validated = $request->validate([
            'prompt' => 'required|string|max:500',
        ]);

        $content = $aiService->generateContent($validated['prompt']);

        if (!$content) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo generar el contenido. Esto puede deberse a una clave de API inválida, límites excedidos o un modelo no disponible.',
            ], 422);
        }

        // Record usage for non-admins
        if (!$user->isAdmin()) {
            \App\Models\AiUsage::create(['user_id' => $user->id]);
        }

        return response()->json([
            'success' => true,
            'content' => $content,
        ]);
    }

    /**
     * Toggle AI access for a user (Admin only)
     */
    public function toggleAccess(\App\Models\User $user)
    {
        if (!auth()->user()->isAdmin()) {
            abort(403);
        }

        if ($user->isAdmin()) {
            return redirect()->back()->with('error', 'No se puede cambiar el acceso de un administrador.');
        }

        $user->update([
            'can_use_ai' => !$user->can_use_ai
        ]);

        return redirect()->back()->with('success', 'Acceso a IA actualizado para el usuario.');
    }
}
