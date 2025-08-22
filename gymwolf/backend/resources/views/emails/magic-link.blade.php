<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Gymwolf Login Link</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo img {
            height: 50px;
            width: auto;
        }
        h1 {
            color: #2563eb;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: white !important;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 30px 0;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
        }
        .button:hover {
            background-color: #1e40af;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h2 style="color: #333; margin: 0;">Gymwolf</h2>
        </div>
        
        <h1>Login to Your Account</h1>
        
        <p>Hi there!</p>
        
        <p>You requested a login link for <strong>{{ $userEmail }}</strong>. Click the button below to log in to your Gymwolf account:</p>
        
        <a href="{{ $loginUrl }}" class="button" style="display: block; text-align: center;">
            Log In to Gymwolf
        </a>
        
        <div class="warning">
            ⏰ This link will expire in 15 minutes for security reasons.
        </div>
        
        <p>If you didn't request this login link, you can safely ignore this email.</p>
        
        <p>Having trouble with the button? Copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #2563eb; font-size: 12px;">{{ $loginUrl }}</p>
        
        <div class="footer">
            <p>© {{ date('Y') }} Gymwolf. All rights reserved.</p>
            <p>A better way to track your workouts.</p>
        </div>
    </div>
</body>
</html>