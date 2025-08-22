<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// API v2 routes
Route::prefix('v2')->group(function () {
    
    // Public routes (no auth required)
    Route::get('public/stats', 'App\Http\Controllers\Api\PublicStatsController@index');
    
    // Authentication routes
    Route::group(['prefix' => 'auth'], function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
        Route::post('refresh', [AuthController::class, 'refresh'])->middleware('auth:api');
        Route::get('me', [AuthController::class, 'me'])->middleware('auth:api');
        
        // Magic link authentication
        Route::post('magic-link/send', 'App\Http\Controllers\Api\MagicLinkController@sendMagicLink');
        Route::post('magic-link/verify', 'App\Http\Controllers\Api\MagicLinkController@verifyMagicLink');
    });

    // Protected routes
    Route::middleware('auth:api')->group(function () {
        
        // User info
        Route::get('user', function (Request $request) {
            $user = $request->user();
            $user->load('profile');
            return response()->json(['user' => $user]);
        });
        
        // Workout routes
        Route::apiResource('workouts', 'App\Http\Controllers\Api\WorkoutController');
        
        // User exercise routes (must be before apiResource to avoid route conflicts)
        Route::get('user/exercises', 'App\Http\Controllers\Api\UserExerciseController@myExercises');
        Route::get('exercises/verified', 'App\Http\Controllers\Api\UserExerciseController@verified');
        Route::get('exercises/by-muscle-group/{muscleGroupName}', 'App\Http\Controllers\Api\UserExerciseController@byMuscleGroup');
        
        // Exercise routes (apiResource creates routes like exercises/{id})
        Route::apiResource('exercises', 'App\Http\Controllers\Api\ExerciseController');
        Route::get('muscle-groups', 'App\Http\Controllers\Api\Admin\ExerciseManagementController@getMuscleGroups');
        
        // Template routes
        Route::apiResource('templates', 'App\Http\Controllers\Api\TemplateController');
        
        // User profile routes
        Route::get('profile', 'App\Http\Controllers\Api\ProfileController@show');
        Route::put('profile', 'App\Http\Controllers\Api\ProfileController@update');
        
        // User settings
        Route::get('user/settings', 'App\Http\Controllers\Api\UserController@settings');
        Route::put('user/settings', 'App\Http\Controllers\Api\UserController@updateSettings');
        
        // Terms acceptance routes
        Route::get('terms/check', 'App\Http\Controllers\Api\TermsController@checkAcceptance');
        Route::post('terms/accept', 'App\Http\Controllers\Api\TermsController@acceptTerms');
        
        // Analytics routes
        Route::get('analytics/overview', 'App\Http\Controllers\Api\AnalyticsController@overview');
        Route::get('analytics/progress', 'App\Http\Controllers\Api\AnalyticsController@progress');
        
        // Exercise stats routes
        Route::get('exercises/{id}/stats', 'App\Http\Controllers\Api\ExerciseStatsController@show');
        
        // Admin routes
        Route::middleware('is_admin')->prefix('admin')->group(function () {
            // User management
            Route::get('users', 'App\Http\Controllers\Api\Admin\UserManagementController@index');
            Route::get('users/{id}', 'App\Http\Controllers\Api\Admin\UserManagementController@show');
            Route::post('users/{id}/toggle-admin', 'App\Http\Controllers\Api\Admin\UserManagementController@toggleAdmin');
            Route::delete('users/{id}', 'App\Http\Controllers\Api\Admin\UserManagementController@destroy');
            
            // Workout management
            Route::get('workouts', 'App\Http\Controllers\Api\Admin\WorkoutManagementController@index');
            Route::get('workouts/stats', 'App\Http\Controllers\Api\Admin\WorkoutManagementController@stats');
            Route::get('workouts/{id}', 'App\Http\Controllers\Api\Admin\WorkoutManagementController@show');
            
            // Exercise management
            Route::get('exercises', 'App\Http\Controllers\Api\Admin\ExerciseManagementController@index');
            Route::get('exercises/{id}', 'App\Http\Controllers\Api\Admin\ExerciseManagementController@show');
            Route::put('exercises/{id}', 'App\Http\Controllers\Api\Admin\ExerciseManagementController@update');
            Route::post('exercises/{id}/verify', 'App\Http\Controllers\Api\Admin\ExerciseManagementController@verify');
            Route::post('exercises/{id}/assign-to-user', 'App\Http\Controllers\Api\Admin\ExerciseManagementController@assignToUser');
            Route::post('exercises/{id}/upload-images', 'App\Http\Controllers\Api\Admin\ExerciseManagementController@uploadImages');
            Route::delete('exercises/{id}/delete-image', 'App\Http\Controllers\Api\Admin\ExerciseManagementController@deleteImage');
            Route::delete('exercises/{id}', 'App\Http\Controllers\Api\Admin\ExerciseManagementController@destroy');
            Route::get('muscle-groups', 'App\Http\Controllers\Api\Admin\ExerciseManagementController@getMuscleGroups');
            Route::get('equipment', 'App\Http\Controllers\Api\Admin\ExerciseManagementController@getEquipment');
            Route::post('equipment', 'App\Http\Controllers\Api\Admin\ExerciseManagementController@createEquipment');
            
            // Document management
            Route::get('documents', 'App\Http\Controllers\Api\DocumentController@index');
            Route::get('documents/{id}/history', 'App\Http\Controllers\Api\DocumentController@showWithHistory');
            Route::put('documents/{id}', 'App\Http\Controllers\Api\DocumentController@update');
            
            // Challenge management
            Route::get('challenges', 'App\Http\Controllers\Api\Admin\ChallengeManagementController@index');
            Route::post('challenges', 'App\Http\Controllers\Api\Admin\ChallengeManagementController@store');
            Route::get('challenges/{id}', 'App\Http\Controllers\Api\Admin\ChallengeManagementController@show');
            Route::put('challenges/{id}', 'App\Http\Controllers\Api\Admin\ChallengeManagementController@update');
            Route::delete('challenges/{id}', 'App\Http\Controllers\Api\Admin\ChallengeManagementController@destroy');
            Route::get('challenges/{id}/results', 'App\Http\Controllers\Api\Admin\ChallengeManagementController@results');
            Route::post('challenges/{challengeId}/results/{resultId}/verify', 'App\Http\Controllers\Api\Admin\ChallengeManagementController@verifyResult');
            Route::delete('challenges/{challengeId}/results/{resultId}', 'App\Http\Controllers\Api\Admin\ChallengeManagementController@deleteResult');
            Route::post('challenges/{id}/upload-image', 'App\Http\Controllers\Api\Admin\ChallengeManagementController@uploadImage');
            
            // Translation management routes
            Route::post('translations', 'App\Http\Controllers\Api\Admin\TranslationController@store');
            Route::delete('translations/{key}', 'App\Http\Controllers\Api\Admin\TranslationController@destroy');
        });
        
        // Challenge routes for users
        Route::get('challenges/active', 'App\Http\Controllers\Api\ChallengeController@active');
        Route::get('challenges/current', 'App\Http\Controllers\Api\ChallengeController@current');
        Route::get('challenges/past', 'App\Http\Controllers\Api\ChallengeController@past');
        Route::get('challenges/{id}', 'App\Http\Controllers\Api\ChallengeController@show');
        Route::post('challenges/{id}/submit', 'App\Http\Controllers\Api\ChallengeController@submitResult');
    });
    
    // Public document routes (for terms and privacy pages)
    Route::get('documents/{slug}', 'App\Http\Controllers\Api\DocumentController@show');
});

// Legacy compatibility route
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});