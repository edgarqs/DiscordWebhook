<?php

use App\Services\DiscordWebhookService;

$service = new DiscordWebhookService();
$result = $service->validateWebhook('https://discord.com/api/webhooks/1450047832521183295/feZEtk4l5_4gQl1D5FI5U4PqvVMbSukxuqDlNIrktK0U3DZwJ9oR8wKMdTt1GXP1G3fy');

dd($result);
