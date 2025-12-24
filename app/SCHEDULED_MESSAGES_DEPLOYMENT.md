# Scheduled Messages - Deployment Guide

## Overview

This guide explains how to deploy and configure the scheduled messages system in production.

## Prerequisites

- Laravel application deployed
- Database configured and migrated
- Queue worker running
- Cron job access on server

## Deployment Steps

### 1. Run Migrations

```bash
php artisan migrate
```

This will create:
- `scheduled_messages` table
- `scheduled_message_files` table

### 2. Configure Queue

The scheduled messages system uses Laravel Queue for processing. Ensure your queue is configured in `.env`:

```env
QUEUE_CONNECTION=database
# or
QUEUE_CONNECTION=redis
```

### 3. Start Queue Worker

The queue worker must be running to process scheduled messages:

```bash
php artisan queue:work --tries=3 --timeout=60
```

**For production, use a process manager like Supervisor:**

Create `/etc/supervisor/conf.d/laravel-worker.conf`:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/app/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/your/app/storage/logs/worker.log
stopwaitsecs=3600
```

Then:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

### 4. Configure Cron Job

The scheduler needs to run every minute to check for messages ready to send.

Add this to your crontab:

```bash
* * * * * cd /path/to/your/app && php artisan schedule:run >> /dev/null 2>&1
```

**To edit crontab:**
```bash
crontab -e
```

**Example for production:**
```bash
* * * * * cd /var/www/discord-webhook && php artisan schedule:run >> /dev/null 2>&1
```

### 5. Storage Permissions

Ensure the storage directory is writable:

```bash
chmod -R 775 storage
chown -R www-data:www-data storage
```

### 6. Verify Installation

Check that everything is working:

```bash
# Test the command manually
php artisan scheduled-messages:process

# Check queue status
php artisan queue:monitor

# View scheduled tasks
php artisan schedule:list
```

## How It Works

### Scheduler Flow

1. **Cron runs every minute** → Executes `php artisan schedule:run`
2. **Scheduler checks** → Runs `scheduled-messages:process` command
3. **Command finds ready messages** → Queries `scheduled_messages` where `next_send_at <= now()`
4. **Dispatches jobs** → Creates `SendScheduledMessage` jobs for each message
5. **Queue worker processes** → Sends messages to Discord and updates status

### File Handling

- Files are stored in `storage/app/scheduled_messages/{message_id}/`
- Files are **automatically deleted after EVERY send** (both one-time and recurring)
- Observer ensures cleanup when messages are deleted

## Monitoring

### Check Logs

```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Queue worker logs (if using Supervisor)
tail -f storage/logs/worker.log
```

### Check Scheduled Messages

```bash
# List all scheduled messages
php artisan tinker
>>> \App\Models\ScheduledMessage::all();

# Check pending messages
>>> \App\Models\ScheduledMessage::pending()->get();

# Check ready to send
>>> \App\Models\ScheduledMessage::readyToSend()->get();
```

### Check Queue

```bash
# See failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all
```

## Troubleshooting

### Messages Not Sending

1. **Check cron is running:**
   ```bash
   grep CRON /var/log/syslog
   ```

2. **Check queue worker is running:**
   ```bash
   ps aux | grep queue:work
   # or with Supervisor
   sudo supervisorctl status laravel-worker:*
   ```

3. **Check for failed jobs:**
   ```bash
   php artisan queue:failed
   ```

4. **Check logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

### Files Not Deleting

Files should auto-delete after sending. If not:

1. Check observer is registered (it should be automatic)
2. Check storage permissions
3. Manually clean up orphaned files:
   ```bash
   php artisan tinker
   >>> Storage::deleteDirectory('scheduled_messages');
   ```

### Timezone Issues

- All times are stored in UTC in the database
- User's timezone is used for display and input
- Conversion happens in the controller

## Production Checklist

- [ ] Migrations run
- [ ] Queue connection configured
- [ ] Queue worker running (Supervisor)
- [ ] Cron job added
- [ ] Storage permissions set
- [ ] Logs monitored
- [ ] Failed jobs checked regularly

## Scaling

For high-volume scheduled messages:

1. **Use Redis for queue:**
   ```env
   QUEUE_CONNECTION=redis
   ```

2. **Increase queue workers:**
   ```ini
   numprocs=4  # in Supervisor config
   ```

3. **Use Horizon (optional):**
   ```bash
   composer require laravel/horizon
   php artisan horizon:install
   php artisan horizon
   ```

## Maintenance

### Clean Up Completed Messages

Periodically clean up old completed messages:

```bash
php artisan tinker
>>> \App\Models\ScheduledMessage::where('status', 'completed')
    ->where('updated_at', '<', now()->subDays(30))
    ->delete();
```

Or create a scheduled task in `routes/console.php`:

```php
Schedule::command('scheduled-messages:cleanup')->daily();
```

## Security

- Files are stored in `storage/app` (not publicly accessible)
- Authorization via `ScheduledMessagePolicy`
- Users can only manage their own scheduled messages
- File uploads validated (max 10MB, images/videos only)

## Support

For issues, check:
1. Laravel logs: `storage/logs/laravel.log`
2. Queue status: `php artisan queue:monitor`
3. Scheduler status: `php artisan schedule:list`
4. Database: Check `scheduled_messages` and `jobs` tables
