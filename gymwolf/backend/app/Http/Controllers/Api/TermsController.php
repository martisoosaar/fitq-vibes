<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TermsController extends Controller
{
    /**
     * Get current document versions from database
     */
    private function getCurrentVersions()
    {
        $termsDoc = Document::where('slug', 'terms')->first();
        $privacyDoc = Document::where('slug', 'privacy')->first();
        
        return [
            'terms' => $termsDoc ? $termsDoc->version : '1.0',
            'privacy' => $privacyDoc ? $privacyDoc->version : '1.0',
        ];
    }
    
    /**
     * Check if user has accepted the current terms
     */
    public function checkAcceptance(Request $request)
    {
        $user = $request->user();
        $currentVersions = $this->getCurrentVersions();
        
        // If user has NULL values (existing users), they haven't accepted
        $termsAccepted = !is_null($user->terms_version) && $user->terms_version === $currentVersions['terms'];
        $privacyAccepted = !is_null($user->privacy_version) && $user->privacy_version === $currentVersions['privacy'];
        
        return response()->json([
            'terms_accepted' => $termsAccepted,
            'privacy_accepted' => $privacyAccepted,
            'current_terms_version' => $currentVersions['terms'],
            'current_privacy_version' => $currentVersions['privacy'],
            'user_terms_version' => $user->terms_version,
            'user_privacy_version' => $user->privacy_version,
        ]);
    }
    
    /**
     * Accept terms and privacy policy
     */
    public function acceptTerms(Request $request)
    {
        $request->validate([
            'accept_terms' => 'required|boolean',
            'accept_privacy' => 'required|boolean',
        ]);
        
        if (!$request->accept_terms || !$request->accept_privacy) {
            return response()->json([
                'success' => false,
                'message' => 'You must accept both Terms of Service and Privacy Policy to continue.'
            ], 422);
        }
        
        $user = $request->user();
        $currentVersions = $this->getCurrentVersions();
        
        $user->terms_accepted_at = now();
        $user->terms_version = $currentVersions['terms'];
        $user->privacy_accepted_at = now();
        $user->privacy_version = $currentVersions['privacy'];
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Terms and Privacy Policy accepted successfully.'
        ]);
    }
}