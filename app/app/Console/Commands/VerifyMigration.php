<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Webhook;
use App\Models\Template;
use App\Models\ScheduledMessage;
use App\Models\MessageHistory;
use App\Models\Invitation;
use App\Models\WebhookCollaborator;

class VerifyMigration extends Command
{
    protected $signature = 'db:verify-migration {--detailed : Show detailed comparison}';
    protected $description = 'Verify database migration integrity by comparing record counts and data samples';

    public function handle()
    {
        $this->info('🔍 Verificando integridad de la migración...');
        $this->newLine();

        $models = [
            'Users' => User::class,
            'Webhooks' => Webhook::class,
            'Templates' => Template::class,
            'Scheduled Messages' => ScheduledMessage::class,
            'Message History' => MessageHistory::class,
            'Invitations' => Invitation::class,
            'Webhook Collaborators' => WebhookCollaborator::class,
        ];

        $allPassed = true;

        foreach ($models as $name => $model) {
            $count = $model::count();
            $this->line("📊 <fg=cyan>{$name}</>: <fg=yellow>{$count}</> registros");

            if ($count === 0 && $name !== 'Invitations') {
                $this->warn("   ⚠️  Advertencia: No hay registros en {$name}");
            }

            if ($this->option('detailed') && $count > 0) {
                $this->showDetailedInfo($name, $model);
            }
        }

        $this->newLine();
        $this->info('🔗 Verificando relaciones...');
        
        // Verificar relaciones
        $this->verifyRelationships();

        $this->newLine();
        $this->info('🔐 Verificando autenticación...');
        
        // Verificar que las contraseñas están hasheadas correctamente
        $this->verifyPasswords();

        $this->newLine();
        
        if ($allPassed) {
            $this->info('✅ Verificación completada exitosamente!');
            return 0;
        } else {
            $this->error('❌ Se encontraron problemas durante la verificación');
            return 1;
        }
    }

    private function showDetailedInfo($name, $model)
    {
        try {
            $sample = $model::latest()->first();
            
            if ($sample) {
                $this->line("   📝 Último registro:");
                $this->line("      ID: {$sample->id}");
                $this->line("      Creado: {$sample->created_at}");
                
                if (method_exists($sample, 'user')) {
                    $user = $sample->user;
                    if ($user) {
                        $this->line("      Usuario: {$user->name} ({$user->email})");
                    }
                }
            }
        } catch (\Exception $e) {
            $this->warn("      ⚠️  No se pudo obtener información detallada");
        }
    }

    private function verifyRelationships()
    {
        try {
            // Verificar webhooks con sus owners
            $webhooksWithoutOwner = Webhook::whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('users')
                    ->whereColumn('users.id', 'webhooks.user_id');
            })->count();

            if ($webhooksWithoutOwner > 0) {
                $this->error("   ❌ {$webhooksWithoutOwner} webhooks sin usuario propietario");
            } else {
                $this->info("   ✅ Todos los webhooks tienen propietario");
            }

            // Verificar scheduled messages con webhooks
            $messagesWithoutWebhook = ScheduledMessage::whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('webhooks')
                    ->whereColumn('webhooks.id', 'scheduled_messages.webhook_id');
            })->count();

            if ($messagesWithoutWebhook > 0) {
                $this->error("   ❌ {$messagesWithoutWebhook} mensajes programados sin webhook");
            } else {
                $this->info("   ✅ Todos los mensajes programados tienen webhook");
            }

        } catch (\Exception $e) {
            $this->warn("   ⚠️  Error verificando relaciones: {$e->getMessage()}");
        }
    }

    private function verifyPasswords()
    {
        try {
            $users = User::take(5)->get();
            
            foreach ($users as $user) {
                // Verificar que la contraseña está hasheada (bcrypt empieza con $2y$)
                if (str_starts_with($user->password, '$2y$') || str_starts_with($user->password, '$2a$')) {
                    $this->info("   ✅ Usuario {$user->email}: contraseña correctamente hasheada");
                } else {
                    $this->error("   ❌ Usuario {$user->email}: contraseña NO hasheada correctamente");
                }
            }
        } catch (\Exception $e) {
            $this->warn("   ⚠️  Error verificando contraseñas: {$e->getMessage()}");
        }
    }
}
