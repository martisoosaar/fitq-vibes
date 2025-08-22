<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Workout;
use Illuminate\Http\Request;

class WorkoutManagementController extends Controller
{
    /**
     * Display a listing of all workouts.
     */
    public function index(Request $request)
    {
        $query = Workout::with(['user', 'segments.exercises.exercise']);

        // Search by workout name or user name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('date', '<=', $request->to_date);
        }

        $workouts = $query->orderBy('date', 'desc')
                          ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $workouts
        ]);
    }

    /**
     * Display the specified workout with full details.
     */
    public function show($id)
    {
        $workout = Workout::with([
            'user.profile',
            'segments.exercises.exercise',
            'segments.exercises.sets'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $workout
        ]);
    }

    /**
     * Get workout statistics.
     */
    public function stats()
    {
        $stats = [
            'total_workouts' => Workout::count(),
            'workouts_today' => Workout::whereDate('date', today())->count(),
            'workouts_this_week' => Workout::whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'workouts_this_month' => Workout::whereMonth('date', now()->month)->whereYear('date', now()->year)->count(),
            'avg_workouts_per_user' => Workout::count() / max(1, \App\Models\User::count()),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}