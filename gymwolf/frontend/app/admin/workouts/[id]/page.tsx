'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, User, Calendar, Clock, Activity, Dumbbell, Weight, Hash } from 'lucide-react';
import { format } from 'date-fns';

interface WorkoutDetail {
  id: number;
  user_id: number;
  name: string;
  date: string;
  notes?: string;
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  segments?: Array<{
    id: number;
    name?: string;
    segment_type?: string;
    exercises?: Array<{
      id: number;
      exercise: {
        id: number;
        name: string;
        category?: string;
        muscle_group?: string;
      };
      sets: Array<{
        id: number;
        reps?: number;
        weight_kg?: number;
        distance_km?: number;
        duration_seconds?: number;
        notes?: string;
      }>;
    }>;
  }>;
}

export default function AdminWorkoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (workoutId) {
      fetchWorkoutDetail();
    }
  }, [workoutId]);

  const fetchWorkoutDetail = async () => {
    try {
      const response = await api.get(`/admin/workouts/${workoutId}`);
      setWorkout(response.data.data);
    } catch (error) {
      console.error('Error fetching workout details:', error);
      router.push('/admin/workouts');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading workout details...</div>;
  }

  if (!workout) {
    return <div className="text-gray-500 dark:text-gray-400">Workout not found</div>;
  }

  const totalExercises = workout.segments?.reduce((sum, segment) => 
    sum + (segment.exercises?.length || 0), 0
  ) || 0;
  
  const totalSets = workout.segments?.reduce((sum, segment) => 
    sum + (segment.exercises?.reduce((exSum, ex) => 
      exSum + (ex.sets?.length || 0), 0
    ) || 0), 0
  ) || 0;
  
  const totalVolume = workout.segments?.reduce((sum, segment) => 
    sum + (segment.exercises?.reduce((exSum, ex) => 
      exSum + ex.sets.reduce((setSum, set) => 
        setSum + ((set.weight_kg || 0) * (set.reps || 0)), 0
      ), 0
    ) || 0), 0
  ) || 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/workouts')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workouts
        </button>
      </div>

      {/* Workout Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {workout.name || 'Untitled Workout'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">User</p>
                <button
                  onClick={() => router.push(`/admin/users/${workout.user_id}`)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                >
                  {workout.user?.name || 'Unknown'}
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                <p className="text-sm">{format(new Date(workout.date || workout.created_at), 'MMM d, yyyy')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                <p className="text-sm">{workout.duration_minutes ? `${workout.duration_minutes} min` : 'Not recorded'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Activity className="h-4 w-4" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Exercises</p>
                <p className="text-sm">{totalExercises}</p>
              </div>
            </div>
          </div>
          
          {workout.notes && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</p>
              <p className="text-gray-900 dark:text-gray-300">{workout.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Workout Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Hash className="h-10 w-10 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sets</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalSets}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Weight className="h-10 w-10 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Volume</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {totalVolume.toFixed(0)} kg
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Dumbbell className="h-10 w-10 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Exercises</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {totalExercises}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises by Segments */}
      {workout.segments && workout.segments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workout Segments</h3>
            
            <div className="space-y-6">
              {workout.segments.map((segment) => (
                <div key={segment.id} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    {segment.name || 'Main Workout'} 
                    {segment.segment_type && (
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        ({segment.segment_type})
                      </span>
                    )}
                  </h4>
                  
                  {segment.exercises && segment.exercises.length > 0 && (
                    <div className="space-y-4">
                      {segment.exercises.map((exercise, index) => (
                <div key={exercise.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {index + 1}. {exercise.exercise.name}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {exercise.exercise.category && (
                        <span>{exercise.exercise.category}</span>
                      )}
                      {exercise.exercise.muscle_group && (
                        <span>{exercise.exercise.muscle_group}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Sets */}
                  {exercise.sets && exercise.sets.length > 0 && (
                    <div className="mt-2">
                      <table className="min-w-full">
                        <thead>
                          <tr className="text-xs text-gray-500 dark:text-gray-400">
                            <th className="text-left pr-4">Set</th>
                            <th className="text-left pr-4">Reps</th>
                            <th className="text-left pr-4">Weight</th>
                            <th className="text-left pr-4">Distance</th>
                            <th className="text-left pr-4">Duration</th>
                            <th className="text-left">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercise.sets.map((set, setIndex) => (
                            <tr key={set.id} className="text-sm text-gray-900 dark:text-gray-300">
                              <td className="pr-4 py-1">{setIndex + 1}</td>
                              <td className="pr-4 py-1">{set.reps || '-'}</td>
                              <td className="pr-4 py-1">{set.weight_kg ? `${set.weight_kg} kg` : '-'}</td>
                              <td className="pr-4 py-1">{set.distance_km ? `${set.distance_km} km` : '-'}</td>
                              <td className="pr-4 py-1">
                                {set.duration_seconds ? `${Math.floor(set.duration_seconds / 60)}:${(set.duration_seconds % 60).toString().padStart(2, '0')}` : '-'}
                              </td>
                              <td className="py-1 text-xs text-gray-500 dark:text-gray-400">
                                {set.notes || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}