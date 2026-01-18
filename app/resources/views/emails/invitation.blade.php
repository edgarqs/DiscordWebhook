<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webhook Collaboration Invitation</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .email-header {
            background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .email-body {
            padding: 40px 30px;
        }
        .email-footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
        .btn-primary {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .btn-primary:hover {
            color: #ffffff;
            transform: translateY(-2px);
        }
        .webhook-info {
            background-color: #f8f9fa;
            border-left: 4px solid #5865F2;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .permission-badge {
            display: inline-block;
            padding: 6px 12px;
            background-color: #5865F2;
            color: #ffffff;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .permission-badge.admin {
            background-color: #ed4245;
        }
        .permission-badge.editor {
            background-color: #57F287;
            color: #1e1e1e;
        }
        .permission-badge.viewer {
            background-color: #faa61a;
            color: #1e1e1e;
        }
        .permission-description {
            background-color: #e7f3ff;
            border-radius: 4px;
            padding: 15px;
            margin: 15px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1 class="mb-0">🎉 You're Invited!</h1>
        </div>

        <!-- Body -->
        <div class="email-body">
            <p class="lead">Hello!</p>
            
            <p><strong>{{ $inviterName }}</strong> has invited you to collaborate on a webhook.</p>

            <div class="webhook-info">
                <h5 class="mb-3">📡 Webhook Details</h5>
                <p class="mb-2"><strong>Webhook Name:</strong> {{ $webhookName }}</p>
                <p class="mb-0">
                    <strong>Your Role:</strong> 
                    <span class="permission-badge {{ strtolower($permissionLevel) }}">{{ $permissionLevel }}</span>
                </p>
            </div>

            <div class="permission-description">
                <strong>What you can do:</strong><br>
                {{ $permissionDescription }}
            </div>

            <div class="text-center">
                <a href="{{ $dashboardUrl }}" class="btn-primary">View Your Invitations</a>
            </div>

            <p class="mt-4">You can accept or decline this invitation from your dashboard. The invitation will be waiting for you when you log in.</p>

            <hr class="my-4">

            <p class="text-muted small">If you did not expect this invitation or don't have an account, you can safely ignore this email.</p>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p class="mb-1"><strong>{{ config('app.name') }}</strong></p>
            <p class="mb-0">&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
