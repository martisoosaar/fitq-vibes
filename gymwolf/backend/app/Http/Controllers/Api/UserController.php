<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Get current user's settings.
     */
    public function settings()
    {
        $user = auth()->user();
        
        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'date_format' => $user->date_format ?? 'MM/DD/YYYY',
        ]);
    }
    
    /**
     * Update user settings.
     */
    public function updateSettings(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'date_format' => 'sometimes|required|string|in:MM/DD/YYYY,DD/MM/YYYY,YYYY-MM-DD,DD.MM.YYYY',
            'current_password' => 'required_with:new_password|string',
            'new_password' => 'sometimes|string|min:8|confirmed',
        ]);
        
        // Check current password if changing password
        if ($request->has('new_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect'
                ], 422);
            }
            $user->password = Hash::make($request->new_password);
        }
        
        // Update other fields
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        
        if ($request->has('date_format')) {
            $user->date_format = $request->date_format;
        }
        
        $user->save();
        
        return response()->json([
            'message' => 'Settings updated successfully',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'date_format' => $user->date_format,
            ],
        ]);
    }
}