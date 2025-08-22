'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Users, Activity, Dumbbell, TrendingUp } from 'lucide-react';

interface AdminStats {
  total_users: number;
  total_workouts: number;
  total_exercises: number;
  workouts_today: number;
  new_users_this_week: number;
  avg_workouts_per_user: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_workouts: 0,
    total_exercises: 0,
    workouts_today: 0,
    new_users_this_week: 0,
    avg_workouts_per_user: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch multiple stats in parallel
      const [workoutStats, users, exercises] = await Promise.all([
        api.get('/admin/workouts/stats'),
        api.get('/admin/users?per_page=1'),
        api.get('/admin/exercises?per_page=1'),
      ]);

      setStats({
        total_users: users.data.data.total || 0,
        total_workouts: workoutStats.data.data.total_workouts || 0,
        total_exercises: exercises.data.data.total || 0,
        workouts_today: workoutStats.data.data.workouts_today || 0,
        new_users_this_week: 0, // TODO: Implement this
        avg_workouts_per_user: workoutStats.data.data.avg_workouts_per_user || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading stats...</div>;
  }

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.total_users, color: 'blue' },
    { icon: Activity, label: 'Total Workouts', value: stats.total_workouts, color: 'green' },
    { icon: Dumbbell, label: 'Total Exercises', value: stats.total_exercises, color: 'purple' },
    { icon: TrendingUp, label: 'Workouts Today', value: stats.workouts_today, color: 'orange' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <stat.icon className={`h-10 w-10 text-${stat.color}-500`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average Workouts per User</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {stats.avg_workouts_per_user.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Users Today</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {stats.workouts_today}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">New Users This Week</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {stats.new_users_this_week}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}