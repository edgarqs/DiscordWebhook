<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .btn-reset {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .btn-reset:hover {
            color: #ffffff;
            transform: translateY(-2px);
        }
        .alert-info {
            background-color: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .link-text {
            word-break: break-all;
            font-size: 12px;
            color: #6c757d;
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1 class="mb-0">🔐 Reset Your Password</h1>
        </div>

        <!-- Body -->
        <div class="email-body">
            <p class="lead">Hello!</p>
            
            <p>You are receiving this email because we received a password reset request for your account.</p>
            
            <div class="text-center">
                <a href="{{ $url }}" class="btn-reset">Reset Password</a>
            </div>

            <div class="alert-info">
                <strong>⏱️ Important:</strong> This password reset link will expire in <strong>{{ $count }} minutes</strong>.
            </div>

            <p>If you did not request a password reset, no further action is required. Your password will remain unchanged.</p>

            <hr class="my-4">

            <p class="text-muted small mb-1">If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:</p>
            <div class="link-text">{{ $url }}</div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p class="mb-1"><strong>{{ config('app.name') }}</strong></p>
            <p class="mb-0">&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
