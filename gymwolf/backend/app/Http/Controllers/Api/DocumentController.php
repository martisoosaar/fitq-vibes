<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    /**
     * Display a listing of documents (admin only)
     */
    public function index(Request $request)
    {
        // Check if user is admin
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $documents = Document::with('updatedBy')->get();
        
        return response()->json($documents);
    }
    
    /**
     * Show a specific document (public for terms/privacy)
     */
    public function show($slug)
    {
        $document = Document::where('slug', $slug)->first();
        
        if (!$document) {
            return response()->json(['message' => 'Document not found'], 404);
        }
        
        return response()->json($document);
    }
    
    /**
     * Show document with history (admin only)
     */
    public function showWithHistory(Request $request, $id)
    {
        // Check if user is admin
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $document = Document::with(['history.updatedBy', 'updatedBy'])->find($id);
        
        if (!$document) {
            return response()->json(['message' => 'Document not found'], 404);
        }
        
        return response()->json($document);
    }
    
    /**
     * Update a document (admin only)
     */
    public function update(Request $request, $id)
    {
        // Check if user is admin
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'required|string',
            'change_summary' => 'nullable|string|max:255',
        ]);
        
        $document = Document::find($id);
        
        if (!$document) {
            return response()->json(['message' => 'Document not found'], 404);
        }
        
        // Update document with new version
        $document->updateWithVersion(
            $request->only(['title', 'content']),
            $request->user()->id,
            $request->input('change_summary')
        );
        
        // When terms or privacy is updated, invalidate all user acceptances
        if (in_array($document->slug, ['terms', 'privacy'])) {
            $this->invalidateUserAcceptances($document->slug);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Document updated successfully',
            'document' => $document->fresh()->load('updatedBy')
        ]);
    }
    
    /**
     * Invalidate user acceptances when document is updated
     */
    private function invalidateUserAcceptances($slug)
    {
        if ($slug === 'terms') {
            // Reset all users' terms acceptance
            \App\Models\User::query()->update([
                'terms_version' => null,
                'terms_accepted_at' => null,
            ]);
        } elseif ($slug === 'privacy') {
            // Reset all users' privacy acceptance
            \App\Models\User::query()->update([
                'privacy_version' => null,
                'privacy_accepted_at' => null,
            ]);
        }
    }
}