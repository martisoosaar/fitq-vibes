'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Link from 'next/link';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Plus, Activity, TrendingUp, Clock, Dumbbell, MapPin, Loader2 } from 'lucide-react';
import { t } from '@/lib/translations';

interface Workout {
  id: number;
  name: string;
  date: string;
  notes: string | null;
  segments: Array<{
    id: number;
    name: string;
    segment_type: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, checkAuth, refreshUser } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    weeklyFrequency: 0,
    totalVolume: 0,
    totalDuration: 0,
    totalDistance: 0,
  });

  useEffect(() => {
    checkAuth();
    if (!localStorage.getItem('token')) {
      router.push('/login');
    } else {
      refreshUser(); // Refresh user data from API
      fetchData();
    }
  }, []);

  const loadMoreWorkouts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const response = await api.get(`/workouts?page=${currentPage + 1}&per_page=10`);
      const newWorkouts = response.data.data.data || [];
      
      if (newWorkouts.length === 0 || newWorkouts.length < 10) {
        setHasMore(false);
      }
      
      if (newWorkouts.length > 0) {
        setWorkouts(prev => [...prev, ...newWorkouts]);
        setCurrentPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more workouts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore]);

  useEffect(() => {
    const currentElement = loadMoreRef.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreWorkouts();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(currentElement);
    observerRef.current = observer;

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [loadMoreWorkouts, hasMore, isLoadingMore]);

  const fetchData = async () => {
    try {
      // Fetch recent workouts
      const workoutsRes = await api.get('/workouts?page=1&per_page=10');
      const initialWorkouts = workoutsRes.data.data.data || [];
      setWorkouts(initialWorkouts);
      setCurrentPage(1); // Reset to page 1
      
      // Check if there are more pages available
      const totalPages = workoutsRes.data.data.last_page || 1;
      setHasMore(totalPages > 1);

      // Fetch analytics data - wrap in try-catch to prevent failure
      try {
        const analyticsRes = await api.get('/analytics/overview?period=30');
        if (analyticsRes.data.success) {
          const data = analyticsRes.data.data;
          // If no recent workouts, show all-time stats
          const showAllTime = data.total_workouts === 0 && data.all_time_workouts > 0;
          setStats({
            totalWorkouts: showAllTime ? data.all_time_workouts : data.total_workouts || 0,
            weeklyFrequency: data.workout_frequency || 0,
            totalVolume: showAllTime ? data.all_time_volume_kg : data.total_volume_kg || 0,
            totalDuration: data.total_duration_minutes || data.total_cardio_minutes || 0,
            totalDistance: data.total_distance_km || 0,
          });
        }
      } catch (analyticsError) {
        console.error('Analytics endpoint error:', analyticsError);
        // Use basic stats from workouts response as fallback
        setStats({
          totalWorkouts: workoutsRes.data.data.total || 0,
          weeklyFrequency: 0,
          totalVolume: 0,
          totalDuration: 0,
          totalDistance: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <Navigation />
      
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('nav.dashboard')}
            </h1>
            <Link
              href="/workouts/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('workouts.newWorkout')}
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-10 w-10 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.totalWorkouts')}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalWorkouts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-10 w-10 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.weeklyAverage')}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.weeklyFrequency}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Dumbbell className="h-10 w-10 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.totalVolume')}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {(stats.totalVolume / 1000).toFixed(1)} t
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-10 w-10 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.totalTime')}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}m
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <MapPin className="h-10 w-10 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.totalDistance')}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalDistance} km</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('dashboard.recentWorkouts')}</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {workouts.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>{t('dashboard.noWorkouts')}</p>
                <Link
                  href="/workouts/new"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  {t('dashboard.createFirstWorkout')}
                </Link>
              </div>
            ) : (
              workouts.map((workout) => (
                <Link
                  key={workout.id}
                  href={`/workouts/${workout.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{workout.name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        {workout.segments.map((segment) => (
                          <span
                            key={segment.id}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              segment.segment_type === 'cardio' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                : segment.segment_type === 'strength'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {segment.segment_type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(workout.date), 'MMM d, yyyy')}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          {/* Load More Indicator */}
          {hasMore && (
            <div 
              ref={loadMoreRef}
              className="px-6 py-8 flex flex-col items-center gap-4"
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t('dashboard.loadingMore')}</span>
                </div>
              ) : (
                <>
                  <div className="text-gray-400 dark:text-gray-500 text-sm">{t('dashboard.scrollForMore')}</div>
                  <button
                    onClick={loadMoreWorkouts}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {t('dashboard.loadMore')}
                  </button>
                </>
              )}
            </div>
          )}
          
          {!hasMore && workouts.length > 0 && (
            <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              {t('dashboard.noMoreWorkouts')}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}