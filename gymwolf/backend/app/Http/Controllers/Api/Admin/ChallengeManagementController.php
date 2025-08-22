<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\ChallengeResult;
use Illuminate\Http\Request;

class ChallengeManagementController extends Controller
{
    /**
     * Get all challenges for admin.
     */
    public function index()
    {
        $challenges = Challenge::with('creator')
            ->withCount('results')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($challenge) {
                $challenge->status = $challenge->hasEnded() ? 'ended' : 
                    ($challenge->hasStarted() ? 'active' : 'upcoming');
                return $challenge;
            });
        
        return response()->json($challenges);
    }
    
    /**
     * Get single challenge details for editing.
     */
    public function show($id)
    {
        $challenge = Challenge::with(['creator', 'results.user'])
            ->findOrFail($id);
        
        return response()->json($challenge);
    }
    
    /**
     * Create a new challenge.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'rules' => 'nullable|string',
            'prizes' => 'nullable|string',
            'image_url' => 'nullable|url',
            'video_url' => 'nullable|url',
            'result_type' => 'required|in:reps,time',
            'scoring_type' => 'required|in:higher_better,lower_better',
            'result_unit' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
        ]);
        
        $data = $request->all();
        
        // Convert YouTube URL to embed format
        if (!empty($data['video_url'])) {
            $data['video_url'] = $this->convertToEmbedUrl($data['video_url']);
        }
        
        $challenge = Challenge::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Challenge created successfully',
            'challenge' => $challenge,
        ], 201);
    }
    
    /**
     * Update a challenge.
     */
    public function update(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);
        
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'rules' => 'nullable|string',
            'prizes' => 'nullable|string',
            'image_url' => 'nullable|url',
            'video_url' => 'nullable|url',
            'result_type' => 'sometimes|required|in:reps,time',
            'scoring_type' => 'sometimes|required|in:higher_better,lower_better',
            'result_unit' => 'nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            'is_active' => 'boolean',
        ]);
        
        // Don't allow changing result_type or scoring_type if there are already results
        if ($challenge->results()->exists()) {
            if ($request->has('result_type') && $request->result_type !== $challenge->result_type) {
                return response()->json([
                    'message' => 'Cannot change result type after results have been submitted'
                ], 422);
            }
            if ($request->has('scoring_type') && $request->scoring_type !== $challenge->scoring_type) {
                return response()->json([
                    'message' => 'Cannot change scoring type after results have been submitted'
                ], 422);
            }
        }
        
        $data = $request->all();
        
        // Convert YouTube URL to embed format
        if (!empty($data['video_url'])) {
            $data['video_url'] = $this->convertToEmbedUrl($data['video_url']);
        }
        
        $challenge->update($data);
        
        return response()->json([
            'success' => true,
            'message' => 'Challenge updated successfully',
            'challenge' => $challenge,
        ]);
    }
    
    /**
     * Delete a challenge.
     */
    public function destroy($id)
    {
        $challenge = Challenge::findOrFail($id);
        
        // Don't allow deleting if there are results
        if ($challenge->results()->exists()) {
            return response()->json([
                'message' => 'Cannot delete challenge with existing results'
            ], 422);
        }
        
        $challenge->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Challenge deleted successfully',
        ]);
    }
    
    /**
     * Get challenge results for admin review.
     */
    public function results($id)
    {
        $challenge = Challenge::findOrFail($id);
        
        $results = $challenge->leaderboard()
            ->with(['user', 'verifier'])
            ->get()
            ->map(function ($result, $index) {
                $result->rank = $index + 1;
                return $result;
            });
        
        return response()->json([
            'challenge' => $challenge,
            'results' => $results,
        ]);
    }
    
    /**
     * Verify or unverify a result.
     */
    public function verifyResult(Request $request, $challengeId, $resultId)
    {
        $result = ChallengeResult::where('challenge_id', $challengeId)
            ->where('id', $resultId)
            ->firstOrFail();
        
        $request->validate([
            'is_verified' => 'required|boolean',
        ]);
        
        if ($request->is_verified) {
            $result->update([
                'is_verified' => true,
                'verified_by' => auth()->id(),
                'verified_at' => now(),
            ]);
        } else {
            $result->update([
                'is_verified' => false,
                'verified_by' => null,
                'verified_at' => null,
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => $request->is_verified ? 'Result verified' : 'Verification removed',
            'result' => $result->fresh(['user', 'verifier']),
        ]);
    }
    
    /**
     * Delete a result.
     */
    public function deleteResult($challengeId, $resultId)
    {
        $result = ChallengeResult::where('challenge_id', $challengeId)
            ->where('id', $resultId)
            ->firstOrFail();
        
        $result->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Result deleted successfully',
        ]);
    }
    
    /**
     * Upload image for a challenge.
     */
    public function uploadImage(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);
        
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);
        
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($challenge->image_url && file_exists(public_path($challenge->image_url))) {
                unlink(public_path($challenge->image_url));
            }
            
            $image = $request->file('image');
            $imageName = 'challenge_' . $id . '_' . time() . '.' . $image->getClientOriginalExtension();
            
            // Create directory if it doesn't exist
            $uploadPath = public_path('uploads/challenges');
            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }
            
            // Move the image
            $image->move($uploadPath, $imageName);
            
            // Update challenge with new image URL
            $imageUrl = '/uploads/challenges/' . $imageName;
            $challenge->update(['image_url' => $imageUrl]);
            
            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'image_url' => $imageUrl,
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'No image provided',
        ], 400);
    }
    
    /**
     * Convert YouTube URL to embed format.
     */
    private function convertToEmbedUrl($url)
    {
        if (empty($url)) {
            return $url;
        }
        
        // Already an embed URL
        if (strpos($url, 'youtube.com/embed/') !== false) {
            return $url;
        }
        
        // Extract video ID from various YouTube URL formats
        $videoId = null;
        
        // youtube.com/watch?v=VIDEO_ID
        if (preg_match('/youtube\.com\/watch\?v=([^&\n?#]+)/', $url, $matches)) {
            $videoId = $matches[1];
        }
        // youtu.be/VIDEO_ID
        elseif (preg_match('/youtu\.be\/([^&\n?#]+)/', $url, $matches)) {
            $videoId = $matches[1];
        }
        // youtube.com/v/VIDEO_ID
        elseif (preg_match('/youtube\.com\/v\/([^&\n?#]+)/', $url, $matches)) {
            $videoId = $matches[1];
        }
        
        if ($videoId) {
            return 'https://www.youtube.com/embed/' . $videoId;
        }
        
        // Return original URL if not a YouTube URL
        return $url;
    }
}