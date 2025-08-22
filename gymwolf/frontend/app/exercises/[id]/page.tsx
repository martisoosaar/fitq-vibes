'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ArrowLeft, Dumbbell, Clock, Weight, Info, MapPin, TrendingUp, Award, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface Exercise {
  id: number;
  name: string;
  category: string;
  primary_muscle_group: string | null;
  secondary_muscle_groups: string | null;
  equipment: string | null;
  instructions: string | null;
  video_url: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

interface ExerciseStats {
  exercise_id: number;
  exercise_name: string;
  exercise_category: string;
  is_cardio: boolean;
  total_workouts: number;
  total_sets: number;
  total_reps: number;
  total_volume_kg: number;
  max_weight_kg: number | null;
  max_reps: number | null;
  avg_weight_kg: number | null;
  avg_reps: number | null;
  // Cardio-specific stats
  total_distance_km: number;
  total_duration_seconds: number;
  max_distance_km: number | null;
  max_duration_seconds: number | null;
  avg_distance_km: number | null;
  avg_duration_seconds: number | null;
  personal_records: {
    max_weight?: {
      weight_kg: number;
      reps: number;
      date: string;
      workout_name: string;
    };
    record_set?: {
      weight_kg: number;
      reps: number;
      volume: number;
      date: string;
      workout_name: string;
    };
    record_training?: {
      total_volume: number;
      total_reps: number;
      total_sets: number;
      date: string;
      workout_name: string;
    };
  };
  last_workout: {
    date: string;
    name: string;
  } | null;
  first_workout: {
    date: string;
    name: string;
  } | null;
  recent_sets: Array<{
    date: string;
    workout_name: string;
    sets: Array<{
      set_number: number;
      weight_kg: number;
      reps: number;
      distance_km: number | null;
      duration_seconds: number | null;
      is_warmup: boolean;
    }>;
    total_volume: number;
    total_distance: number;
    total_duration: number;
  }>;
  progress: {
    weight_change_percent: number;
    weight_change_kg: number;
  } | null;
}

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params.id as string;
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
    } else {
      fetchData();
    }
  }, [exerciseId]);

  const fetchData = async () => {
    try {
      // Fetch exercise details
      const exerciseResponse = await api.get(`/exercises/${exerciseId}`);
      if (exerciseResponse.data.success) {
        setExercise(exerciseResponse.data.data);
      }
      
      // Fetch exercise statistics
      try {
        const statsResponse = await api.get(`/exercises/${exerciseId}/stats`);
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }
      } catch (statsError) {
        console.log('No stats available for this exercise');
      }
    } catch (error: any) {
      console.error('Error fetching exercise:', error);
      if (error.response?.status === 404) {
        setError('Exercise not found');
      } else {
        setError('Failed to load exercise');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return <Dumbbell className="h-5 w-5 text-blue-600" />;
      case 'cardio':
        return <MapPin className="h-5 w-5 text-green-600" />;
      case 'flexibility':
        return <Info className="h-5 w-5 text-purple-600" />;
      default:
        return <Dumbbell className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${secs}s`;
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // YouTube URL patterns
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo URL pattern
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Return original URL if not YouTube or Vimeo
    return url;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading exercise...</div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error || 'Exercise not found'}</div>
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <Navigation />
      
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Exercise Details</h1>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Exercise Name and Category */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{exercise.name}</h2>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(exercise.category)}
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {exercise.category}
                    </span>
                  </div>
                  {!exercise.created_by && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified Exercise
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Details */}
          <div className="px-6 py-5 space-y-6">
            {/* Muscle Groups */}
            {exercise.primary_muscle_group && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Primary Muscle Group
                </h3>
                <p className="mt-2 text-base text-gray-900">{exercise.primary_muscle_group}</p>
              </div>
            )}

            {exercise.secondary_muscle_groups && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Secondary Muscle Groups
                </h3>
                <p className="mt-2 text-base text-gray-900">{exercise.secondary_muscle_groups}</p>
              </div>
            )}

            {/* Equipment */}
            {exercise.equipment && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Equipment
                </h3>
                <p className="mt-2 text-base text-gray-900">{exercise.equipment}</p>
              </div>
            )}

            {/* Instructions */}
            {exercise.instructions && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Instructions
                </h3>
                <div className="mt-2 text-base text-gray-900 whitespace-pre-wrap">
                  {exercise.instructions}
                </div>
              </div>
            )}

            {/* Video */}
            {exercise.video_url && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Exercise Video
                </h3>
                <div className="mt-3 relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={getEmbedUrl(exercise.video_url)}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* If no details are available */}
            {!exercise.primary_muscle_group && 
             !exercise.secondary_muscle_groups && 
             !exercise.equipment && 
             !exercise.instructions && (
              <div className="text-center py-8 text-gray-500">
                <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No additional details available for this exercise.</p>
              </div>
            )}
          </div>

          {/* Personal Statistics */}
          {stats && stats.total_workouts > 0 && (
            <>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Statistics</h3>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Activity className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-500">Workouts</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_workouts}</p>
                  </div>
                  
                  {stats.is_cardio ? (
                    <>
                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <MapPin className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm text-gray-500">Total Distance</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.total_distance_km ? `${stats.total_distance_km} km` : '-'}
                        </p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-purple-500 mr-2" />
                          <span className="text-sm text-gray-500">Total Time</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatDuration(stats.total_duration_seconds)}
                        </p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <TrendingUp className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className="text-sm text-gray-500">Avg Distance</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.avg_distance_km ? `${stats.avg_distance_km} km` : '-'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Dumbbell className="h-5 w-5 text-purple-500 mr-2" />
                          <span className="text-sm text-gray-500">Total Sets</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_sets}</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Weight className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm text-gray-500">Total Volume</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_volume_kg} kg</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Award className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className="text-sm text-gray-500">Max Weight</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.max_weight_kg ? `${stats.max_weight_kg} kg` : '-'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Personal Records */}
                {stats.personal_records && Object.keys(stats.personal_records).length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Personal Records</h4>
                    <div className="space-y-3">
                      {/* 1 Repetition Record */}
                      {stats.personal_records.max_weight && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <Award className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-700 text-sm">1 Repetition Record</h5>
                              <p className="text-3xl font-bold text-yellow-700 mt-1">
                                {stats.personal_records.max_weight.weight_kg} kg
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                {stats.personal_records.max_weight.reps} reps • {format(new Date(stats.personal_records.max_weight.date), 'PPP')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Record Set */}
                      {stats.personal_records.record_set && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <TrendingUp className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-700 text-sm">Record Set</h5>
                              <p className="text-3xl font-bold text-green-700 mt-1">
                                {stats.personal_records.record_set.volume} kg
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                {stats.personal_records.record_set.weight_kg} kg × {stats.personal_records.record_set.reps} reps • {format(new Date(stats.personal_records.record_set.date), 'PPP')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Record Training */}
                      {stats.personal_records.record_training && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <Activity className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-700 text-sm">Record Training</h5>
                              <p className="text-3xl font-bold text-purple-700 mt-1">
                                {stats.personal_records.record_training.total_volume} kg
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                {stats.personal_records.record_training.total_sets} sets • {stats.personal_records.record_training.total_reps} reps • {format(new Date(stats.personal_records.record_training.date), 'PPP')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Indicator */}
                {stats.progress && (
                  <div className={`border rounded-lg p-4 mb-6 ${
                    stats.progress.weight_change_percent > 0 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center">
                      <TrendingUp className={`h-6 w-6 mr-3 ${
                        stats.progress.weight_change_percent > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`} />
                      <div>
                        <h4 className="font-semibold text-gray-900">Recent Progress</h4>
                        <p className="text-gray-700">
                          {stats.progress.weight_change_percent > 0 ? '+' : ''}
                          {stats.progress.weight_change_kg} kg ({stats.progress.weight_change_percent}%) 
                          in the last month
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Workouts */}
                {stats.recent_sets.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Performance</h4>
                    <div className="space-y-3">
                      {stats.recent_sets.map((workout, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{workout.workout_name}</p>
                              <p className="text-sm text-gray-500">
                                {format(new Date(workout.date), 'PPP')}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-gray-600">
                              {stats.is_cardio ? (
                                <>
                                  {workout.total_distance ? `${workout.total_distance.toFixed(2)} km` : ''} 
                                  {workout.total_distance && workout.total_duration ? ' • ' : ''}
                                  {workout.total_duration ? formatDuration(workout.total_duration) : ''}
                                </>
                              ) : (
                                `${workout.total_volume} kg total`
                              )}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {workout.sets.map((set, setIdx) => (
                              <span 
                                key={setIdx}
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  set.is_warmup 
                                    ? 'bg-orange-100 text-orange-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {stats.is_cardio ? (
                                  <>
                                    {set.is_warmup && 'W'} Set {set.set_number}: 
                                    {set.distance_km ? ` ${set.distance_km}km` : ''}
                                    {set.duration_seconds ? ` ${formatDuration(set.duration_seconds)}` : ''}
                                  </>
                                ) : (
                                  <>
                                    {set.is_warmup && 'W'} Set {set.set_number}: {set.weight_kg}kg x {set.reps}
                                  </>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer with actions */}
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={() => router.back()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              {exercise.created_by && (
                <Link
                  href={`/exercises/${exercise.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Edit Exercise
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}