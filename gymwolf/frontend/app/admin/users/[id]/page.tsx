'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, User, Mail, Calendar, Shield, Activity, Dumbbell, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface UserDetail {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  profile?: {
    bio?: string;
    avatar_url?: string;
    height_cm?: number;
    weight_kg?: number;
    unit_system?: 'metric' | 'imperial';
  };
  workouts_count?: number;
  exercises_count?: number;
  recent_workouts?: Array<{
    id: number;
    name: string;
    created_at: string;
    duration_minutes?: number;
    exercises_count?: number;
  }>;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      // The API returns { user: {...}, stats: {...} }
      const userData = response.data.data.user || response.data.data;
      // Add stats to user object if they exist
      if (response.data.data.stats) {
        userData.workouts_count = response.data.data.stats.total_workouts;
        userData.exercises_count = response.data.data.stats.total_exercises;
      }
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user details:', error);
      router.push('/admin/users');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdmin = async () => {
    try {
      const response = await api.post(`/admin/users/${userId}/toggle-admin`);
      if (response.data.success) {
        fetchUserDetail(); // Refresh the data
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };

  const deleteUser = async () => {
    if (!user) return;
    
    const confirmMessage = `Are you sure you want to delete user "${user.name}"?\n\n` +
      `This will permanently delete:\n` +
      `• ${user.workouts_count || 0} workouts\n` +
      `• ${user.exercises_count || 0} custom exercises\n` +
      `• All user data\n\n` +
      `This action cannot be undone!`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    // Double confirmation for safety
    const secondConfirm = prompt(`Type "${user.name}" to confirm deletion:`);
    if (secondConfirm !== user.name) {
      alert('User name did not match. Deletion cancelled.');
      return;
    }
    
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        alert(response.data.message);
        router.push('/admin/users');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading user details...</div>;
  }

  if (!user) {
    return <div className="text-gray-500 dark:text-gray-400">User not found</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAdmin}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              user.is_admin
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
          </button>
          <button
            onClick={deleteUser}
            className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete User
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            {/* User Details */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Joined {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'Unknown'}
                </div>
                <div className="flex items-center gap-2">
                  {user.is_admin ? (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                      <Shield className="h-3 w-3" />
                      Administrator
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      Regular User
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      {user.profile && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.profile.bio && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Bio</p>
                  <p className="text-gray-900 dark:text-gray-300">{user.profile.bio}</p>
                </div>
              )}
              
              {user.profile.height_cm && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Height</p>
                  <p className="text-gray-900 dark:text-gray-300">
                    {user.profile.unit_system === 'imperial' 
                      ? `${Math.floor(user.profile.height_cm / 2.54 / 12)}'${Math.round((user.profile.height_cm / 2.54) % 12)}"`
                      : `${user.profile.height_cm} cm`}
                  </p>
                </div>
              )}
              
              {user.profile.weight_kg && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Weight</p>
                  <p className="text-gray-900 dark:text-gray-300">
                    {user.profile.unit_system === 'imperial'
                      ? `${Math.round(user.profile.weight_kg * 2.205)} lbs`
                      : `${user.profile.weight_kg} kg`}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Unit System</p>
                <p className="text-gray-900 dark:text-gray-300 capitalize">{user.profile.unit_system || 'metric'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Activity className="h-10 w-10 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workouts</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {user.workouts_count || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Dumbbell className="h-10 w-10 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Custom Exercises</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {user.exercises_count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Workouts */}
      {user.recent_workouts && user.recent_workouts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Workouts</h3>
            
            <div className="space-y-3">
              {user.recent_workouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {workout.name || 'Untitled Workout'}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>{workout.created_at ? format(new Date(workout.created_at), 'MMM d, yyyy') : 'Unknown date'}</span>
                      {workout.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {workout.duration_minutes} min
                        </span>
                      )}
                      {workout.exercises_count !== undefined && (
                        <span className="flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" />
                          {workout.exercises_count} exercises
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/workouts/${workout.id}`)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}