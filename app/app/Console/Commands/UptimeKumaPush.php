<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UptimeKumaPush extends Command
{
    // El nombre del comando para ejecutarlo
    protected $signature = 'monitor:push';
    protected $description = 'Verifica salud local y envía heartbeat a Uptime Kuma';

    public function handle()
    {
        $urlKuma = env('UPTIME_KUMA_PUSH_URL');

        if (!$urlKuma) {
            $this->error('No se ha configurado UPTIME_KUMA_PUSH_URL en el .env');
            return;
        }

        try {
            // 1. Verificar Base de Datos
            DB::connection()->getPdo();

            // 2. Verificar que la propia App responda (Local)
            // Usamos el nombre de la app o localhost
            $response = Http::get(config('app.url') ?: 'http://localhost');

            if ($response->successful()) {
                // 3. Si todo está OK, avisamos a Kuma
                Http::timeout(5)->get($urlKuma);
                $this->info('Heartbeat enviado con éxito.');
            } else {
                $this->warn('La web respondió con error, heartbeat no enviado.');
            }

        } catch (\Exception $e) {
            $this->error('Fallo de salud: ' . $e->getMessage());
            Log::error('UptimeKumaPush Falló: ' . $e->getMessage());
        }
    }
}