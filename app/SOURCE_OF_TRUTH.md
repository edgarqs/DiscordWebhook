# Discord Webhook Manager - Source of Truth

## Application Overview

A Laravel-based web application for managing Discord webhooks with advanced features including scheduled messages, templates, and collaboration.

## Core Features

### 1. Webhook Management
- Create, edit, delete webhooks
- Store webhook URLs securely
- Avatar and description customization
- Message history tracking
- Collaboration system (share webhooks with other users)

### 2. Quick Send
- Send messages to any webhook quickly
- Support for text content
- Embed builder
- File attachments
- Template integration

### 3. Templates
- Create reusable message templates
- Organize by categories
- Share templates with collaborators
- Dynamic variables system
- Load templates in send pages

### 4. Scheduled Messages ⭐ NEW
- **One-time scheduled messages**: Send at specific date/time
- **Recurring messages**: Daily, weekly, monthly schedules
- **File attachments**: Upload images/videos (auto-deleted after send)
- **Template integration**: Load templates for scheduled messages
- **Timezone support**: Full timezone handling (default: Europe/Madrid)
- **Pause/Resume**: Control recurring messages
- **Status tracking**: pending, processing, completed, failed, paused

### 5. Collaboration
- Share webhooks with other users
- Permission levels (view, edit, admin)
- Invitation system
- Leave shared resources

### 6. User Management
- Authentication (login/register)
- Profile management
- Password reset
- Admin controls

## Technical Stack

### Backend
- **Framework**: Laravel 12.43.0
- **PHP**: 8.4.5
- **Database**: PostgreSQL
- **Queue**: Laravel Queue (database/redis)
- **Scheduler**: Laravel Scheduler (cron)
- **Storage**: Local filesystem

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Inertia.js
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Build**: Vite

## Architecture

### Database Schema

#### Core Tables
- `users`: User accounts
- `webhooks`: Discord webhook configurations
- `templates`: Message templates
- `webhook_history`: Message send history
- `scheduled_messages`: Scheduled message configurations ⭐
- `scheduled_message_files`: File attachments for scheduled messages ⭐

#### Collaboration Tables
- `webhook_collaborators`: Webhook sharing
- `template_collaborators`: Template sharing
- `invitations`: Pending invitations

### Key Components

#### Models
- `User`: User account with relationships
- `Webhook`: Webhook configuration
- `Template`: Message template
- `ScheduledMessage`: Scheduled message with relationships ⭐
- `ScheduledMessageFile`: File attachment with auto-delete observer ⭐

#### Jobs
- `SendScheduledMessage`: Processes and sends scheduled messages ⭐

#### Commands
- `ProcessScheduledMessages`: Finds and dispatches ready messages ⭐

#### Services
- `DiscordMessageService`: Handles Discord API communication

## File Structure

```
app/
├── app/
│   ├── Console/Commands/
│   │   └── ProcessScheduledMessages.php ⭐
│   ├── Http/Controllers/
│   │   ├── WebhookController.php
│   │   ├── TemplateController.php
│   │   ├── ScheduledMessageController.php ⭐
│   │   └── ...
│   ├── Jobs/
│   │   └── SendScheduledMessage.php ⭐
│   ├── Models/
│   │   ├── User.php
│   │   ├── Webhook.php
│   │   ├── Template.php
│   │   ├── ScheduledMessage.php ⭐
│   │   ├── ScheduledMessageFile.php ⭐
│   │   └── ...
│   ├── Policies/
│   │   ├── WebhookPolicy.php
│   │   ├── TemplatePolicy.php
│   │   ├── ScheduledMessagePolicy.php ⭐
│   │   └── ...
│   └── Services/
│       └── DiscordMessageService.php
├── database/
│   └── migrations/
│       ├── *_create_scheduled_messages_table.php ⭐
│       └── *_create_scheduled_message_files_table.php ⭐
├── resources/
│   └── js/
│       ├── components/
│       │   ├── schedule-picker.tsx ⭐
│       │   └── ...
│       ├── Pages/
│       │   ├── scheduled/
│       │   │   ├── index.tsx ⭐
│       │   │   ├── create.tsx ⭐
│       │   │   └── edit.tsx ⭐
│       │   ├── webhooks/
│       │   ├── templates/
│       │   └── ...
│       └── layouts/
└── routes/
    ├── web.php
    └── console.php (scheduler registration) ⭐
```

## Scheduled Messages System ⭐

### How It Works

1. **User creates scheduled message** via web interface
2. **Message stored** in database with schedule configuration
3. **Cron runs every minute** → triggers Laravel scheduler
4. **Scheduler executes** `scheduled-messages:process` command
5. **Command finds ready messages** (where `next_send_at <= now()`)
6. **Dispatches jobs** to queue for each message
7. **Queue worker processes** jobs and sends to Discord
8. **Files auto-deleted** after sending
9. **Status updated** (completed for one-time, calculates next send for recurring)

### Schedule Types

**One-time:**
- User selects specific date and time
- Sent once and marked as completed
- Files deleted after send

**Recurring:**
- Daily: Every day at specified time
- Weekly: Specific days of week at specified time
- Monthly: Specific day of month at specified time
- Optional max sends limit
- Files deleted after EACH send
- Can be paused/resumed

### File Handling

- Stored in `storage/app/scheduled_messages/{message_id}/`
- Max 10MB per file
- Supported: images and videos
- **Auto-deleted after every send** (observer pattern)
- Cascade delete when message is deleted

## Deployment Requirements

### Production Setup

1. **Web Server**: Nginx/Apache with PHP 8.4+
2. **Database**: PostgreSQL
3. **Queue Worker**: Supervisor managing `queue:work`
4. **Cron Job**: Running `schedule:run` every minute
5. **Storage**: Writable `storage/` directory

### Environment Variables

```env
APP_NAME="Discord Webhook Manager"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_user
DB_PASSWORD=your_password

QUEUE_CONNECTION=database  # or redis for better performance

# Optional: For email features
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
```

### Cron Configuration

Add to crontab:
```bash
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

### Supervisor Configuration

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/app/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/app/storage/logs/worker.log
```

## API Integration

### Discord Webhook Format

Messages are sent to Discord using the webhook URL with this structure:

```json
{
  "content": "Message text",
  "embeds": [
    {
      "title": "Embed Title",
      "description": "Embed Description",
      "color": 5814783,
      "url": "https://example.com",
      "author": {
        "name": "Author Name",
        "url": "https://example.com",
        "icon_url": "https://example.com/icon.png"
      },
      "footer": {
        "text": "Footer Text",
        "icon_url": "https://example.com/footer.png"
      },
      "image": {
        "url": "https://example.com/image.png"
      },
      "thumbnail": {
        "url": "https://example.com/thumb.png"
      },
      "fields": [
        {
          "name": "Field Name",
          "value": "Field Value",
          "inline": true
        }
      ]
    }
  ]
}
```

Files are sent as multipart/form-data.

## Security

- **Authentication**: Laravel Sanctum
- **Authorization**: Policy-based (users can only access their own resources)
- **CSRF Protection**: Enabled on all forms
- **File Validation**: Type and size restrictions
- **SQL Injection**: Protected via Eloquent ORM
- **XSS Protection**: React escapes output by default

## Monitoring

### Logs
- Application: `storage/logs/laravel.log`
- Queue Worker: `storage/logs/worker.log`

### Health Checks
- Queue status: `php artisan queue:monitor`
- Scheduler status: `php artisan schedule:list`
- Failed jobs: `php artisan queue:failed`

## Maintenance

### Regular Tasks
- Monitor failed jobs
- Clean up old completed scheduled messages
- Check storage usage
- Review error logs
- Update dependencies

### Backup
- Database (PostgreSQL dump)
- Uploaded files in `storage/app/`
- `.env` configuration

## Version History

- **v1.0**: Initial release with webhooks and templates
- **v1.1**: Added collaboration system
- **v1.2**: Added scheduled messages system ⭐

## Documentation

- **Deployment Guide**: `SCHEDULED_MESSAGES_DEPLOYMENT.md`
- **Walkthrough**: See artifacts directory for implementation details
- **API Docs**: Discord Webhook API documentation

## Support

For issues:
1. Check logs: `storage/logs/laravel.log`
2. Verify queue is running: `ps aux | grep queue:work`
3. Check cron: `grep CRON /var/log/syslog`
4. Review failed jobs: `php artisan queue:failed`
