<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::with('profile');

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
                      ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $user = User::with(['profile', 'workouts' => function($q) {
            $q->latest()->limit(10);
        }])->findOrFail($id);

        // Get user statistics
        $stats = [
            'total_workouts' => $user->workouts()->count(),
            'total_exercises' => $user->exercises()->count(),
            'last_workout' => $user->workouts()->latest()->first()?->date,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'stats' => $stats
            ]
        ]);
    }

    /**
     * Toggle admin status for a user.
     */
    public function toggleAdmin($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent removing admin from self
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot change your own admin status'
            ], 400);
        }

        $user->is_admin = !$user->is_admin;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Admin status updated',
            'data' => $user
        ]);
    }

    /**
     * Delete a user and all their data.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting self
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete your own account'
            ], 400);
        }

        // Get counts for confirmation
        $workoutsCount = $user->workouts()->count();
        $exercisesCount = $user->exercises()->count();

        // Delete user (cascade will handle related data)
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => "User deleted successfully. Removed {$workoutsCount} workouts and {$exercisesCount} custom exercises."
        ]);
    }
}