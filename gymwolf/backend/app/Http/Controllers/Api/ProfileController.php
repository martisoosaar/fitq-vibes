<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Display the authenticated user's profile.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show()
    {
        $user = auth()->user()->load(['profile', 'workouts' => function ($query) {
            $query->latest()->limit(5);
        }]);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update the authenticated user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'bio' => 'nullable|string|max:500',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'height_cm' => 'nullable|integer|min:50|max:300',
            'weight_kg' => 'nullable|numeric|min:20|max:500',
            'unit_system' => 'sometimes|in:metric,imperial',
            'timezone' => 'sometimes|timezone',
            'is_public' => 'sometimes|boolean',
            'trainer_level' => 'sometimes|integer|min:0|max:3',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $profile = auth()->user()->profile;

        if (!$profile) {
            $profile = auth()->user()->profile()->create([
                'bio' => '',
                'unit_system' => 'metric',
                'timezone' => 'UTC',
                'is_public' => true,
                'trainer_level' => 0,
            ]);
        }

        $profile->update($request->only([
            'name', 'bio', 'birth_date', 'gender',
            'height_cm', 'weight_kg', 'unit_system',
            'timezone', 'is_public', 'trainer_level'
        ]));

        // Update user's name if provided
        if ($request->has('name')) {
            auth()->user()->update(['name' => $request->name]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => auth()->user()->load('profile')
        ]);
    }

    /**
     * Upload avatar for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $profile = auth()->user()->profile;

        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $filename = 'avatar_' . auth()->id() . '_' . time() . '.' . $avatar->getClientOriginalExtension();
            $path = $avatar->storeAs('avatars', $filename, 'public');

            $profile->update(['avatar_url' => '/storage/' . $path]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Avatar uploaded successfully',
            'data' => ['avatar_url' => $profile->avatar_url]
        ]);
    }
}