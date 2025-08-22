<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\MagicLink;
use App\Mail\MagicLinkMail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use SendGrid\Mail\Mail as SendGridMail;
use SendGrid;

class MagicLinkController extends Controller
{
    /**
     * Send a magic link to the user's email
     */
    public function sendMagicLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $email = $request->email;
        
        // Check if user exists, if not create
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => explode('@', $email)[0], // Use email prefix as name
                'password' => bcrypt(Str::random(32)) // Random password since we're passwordless
            ]
        );

        // Delete old magic links for this email
        MagicLink::where('email', $email)->delete();

        // Create new magic link
        $magicLink = MagicLink::create([
            'email' => $email,
            'token' => Str::random(64),
            'expires_at' => Carbon::now()->addMinutes(15), // Link expires in 15 minutes
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        // Create login URL
        $frontendUrl = env('APP_FRONTEND_URL', 'http://localhost:3001');
        $loginUrl = $frontendUrl . '/auth/magic-link?token=' . $magicLink->token;

        // Try to send email with SendGrid
        $emailSent = false;
        
        if (config('services.sendgrid.api_key') && config('services.sendgrid.api_key') !== 'your-sendgrid-api-key-here') {
            try {
                $sendgrid = new SendGrid(config('services.sendgrid.api_key'));
                $email_obj = new SendGridMail();
                $email_obj->setFrom(config('mail.from.address'), config('mail.from.name'));
                $email_obj->setSubject("Your Gymwolf Login Link");
                $email_obj->addTo($email);
                
                // Create HTML content
                $html = view('emails.magic-link', [
                    'loginUrl' => $loginUrl,
                    'userEmail' => $email
                ])->render();
                
                // Create text content
                $text = view('emails.magic-link-text', [
                    'loginUrl' => $loginUrl,
                    'userEmail' => $email
                ])->render();
                
                $email_obj->addContent("text/plain", $text);
                $email_obj->addContent("text/html", $html);
                
                $response = $sendgrid->send($email_obj);
                
                if ($response->statusCode() >= 200 && $response->statusCode() < 300) {
                    $emailSent = true;
                }
            } catch (\Exception $e) {
                Log::error('SendGrid error: ' . $e->getMessage());
            }
        }

        // In development or if SendGrid not configured, return the link directly
        if (!$emailSent && config('app.env') === 'local') {
            return response()->json([
                'success' => true,
                'message' => 'Magic link ready (email not configured)',
                'debug_link' => $loginUrl // Remove this in production
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $emailSent ? 'Check your email for the login link' : 'Email service not configured, please contact support'
        ]);
    }

    /**
     * Verify magic link and log user in
     */
    public function verifyMagicLink(Request $request)
    {
        $request->validate([
            'token' => 'required|string'
        ]);

        $magicLink = MagicLink::where('token', $request->token)->first();

        if (!$magicLink) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid login link'
            ], 400);
        }

        if (!$magicLink->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'This login link has expired or already been used'
            ], 400);
        }

        // Find user
        $user = User::where('email', $magicLink->email)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Mark link as used
        $magicLink->markAsUsed();

        // Create long-lived token (1 year)
        $tokenResult = $user->createToken('gymwolf-app');
        $token = $tokenResult->accessToken;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ],
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => 365 * 24 * 60 * 60 // 1 year in seconds
        ]);
    }
}