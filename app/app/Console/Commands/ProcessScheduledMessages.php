<?php

namespace App\Console\Commands;

use App\Jobs\SendScheduledMessage;
use App\Models\ScheduledMessage;
use Illuminate\Console\Command;

class ProcessScheduledMessages extends Command
{
    protected $signature = 'scheduled-messages:process';
    protected $description = 'Process scheduled messages that are ready to be sent';

    public function handle()
    {
        $messages = ScheduledMessage::readyToSend()->get();

        if ($messages->isEmpty()) {
            $this->info('No messages ready to send');
            return 0;
        }

        $this->info("Found {$messages->count()} message(s) ready to send");

        foreach ($messages as $message) {
            SendScheduledMessage::dispatch($message);
            $this->info("Dispatched message ID: {$message->id}");
        }

        return 0;
    }
}
