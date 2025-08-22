'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Dumbbell, 
  Activity,
  Clock,
  Weight,
  Award,
  User,
  Users,
  ExternalLink
} from 'lucide-react';

interface ExerciseSet {
  id: number;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  distance_km: number | null;
  duration_seconds: number | null;
  is_warmup: boolean;
  is_dropset: boolean;
}

interface WorkoutExercise {
  id: number;
  exercise: {
    id: number;
    name: string;
    category: string;
    primary_muscle_group: string | null;
    equipment: string | null;
    created_by: number | null;
  };
  exercise_order: number;
  notes: string | null;
  sets: ExerciseSet[];
}

interface WorkoutSegment {
  id: number;
  name: string;
  segment_type: string;
  segment_order: number;
  notes: string | null;
  exercises: WorkoutExercise[];
}

interface Workout {
  id: number;
  name: string;
  date: string;
  notes: string | null;
  duration_minutes: number | null;
  segments: WorkoutSegment[];
}

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedWorkout, setEditedWorkout] = useState<Workout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
    } else {
      // Get current user ID from token or API
      fetchUserInfo();
      fetchWorkout();
    }
  }, [workoutId]);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/user');
      if (response.data.user) {
        setCurrentUserId(response.data.user.id);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchWorkout = async () => {
    try {
      const response = await api.get(`/workouts/${workoutId}`);
      if (response.data.success) {
        setWorkout(response.data.data);
        setEditedWorkout(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching workout:', error);
      if (error.response?.status === 404) {
        setError('Workout not found');
      } else {
        setError('Failed to load workout');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedWorkout(workout);
  };

  const handleSave = async () => {
    if (!editedWorkout) return;
    
    try {
      const response = await api.put(`/workouts/${workoutId}`, {
        name: editedWorkout.name,
        notes: editedWorkout.notes,
        date: editedWorkout.date,
      });
      
      if (response.data.success) {
        setWorkout(response.data.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Failed to update workout');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    
    try {
      await api.delete(`/workouts/${workoutId}`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateTotalVolume = () => {
    if (!workout) return 0;
    let total = 0;
    workout.segments.forEach(segment => {
      segment.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.weight_kg && set.reps) {
            total += set.weight_kg * set.reps;
          }
        });
      });
    });
    return total.toFixed(1);
  };

  const calculateTotalSets = () => {
    if (!workout) return 0;
    let total = 0;
    workout.segments.forEach(segment => {
      segment.exercises.forEach(exercise => {
        total += exercise.sets.length;
      });
    });
    return total;
  };

  const calculateTotalDistance = () => {
    if (!workout) return 0;
    let total = 0;
    workout.segments.forEach(segment => {
      if (segment.segment_type === 'cardio') {
        segment.exercises.forEach(exercise => {
          exercise.sets.forEach(set => {
            if (set.distance_km) {
              total += set.distance_km;
            }
          });
        });
      }
    });
    return total.toFixed(2);
  };

  const calculateTotalDuration = () => {
    if (!workout) return 0;
    let totalSeconds = 0;
    workout.segments.forEach(segment => {
      if (segment.segment_type === 'cardio') {
        segment.exercises.forEach(exercise => {
          exercise.sets.forEach(set => {
            if (set.duration_seconds) {
              totalSeconds += set.duration_seconds;
            }
          });
        });
      }
    });
    
    if (totalSeconds === 0 && workout.duration_minutes) {
      return `${workout.duration_minutes} min`;
    }
    
    if (totalSeconds > 0) {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}min`;
      }
      return `${minutes} min`;
    }
    
    return 'Not recorded';
  };

  const hasCardio = workout?.segments.some(s => s.segment_type === 'cardio');
  const hasStrength = workout?.segments.some(s => s.segment_type === 'strength');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading workout...</div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error || 'Workout not found'}</div>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
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
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {isEditing ? (
                <input
                  type="text"
                  value={editedWorkout?.name || ''}
                  onChange={(e) => setEditedWorkout({...editedWorkout!, name: e.target.value})}
                  className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">
                  Ametlik treeningprotokoll #{workout.name.match(/\d+/)?.[0] || workout.id}
                </h1>
              )}
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workout Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              {isEditing ? (
                <input
                  type="date"
                  value={editedWorkout?.date ? format(new Date(editedWorkout.date), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setEditedWorkout({...editedWorkout!, date: e.target.value})}
                  className="text-lg font-semibold border-b border-gray-300 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-lg font-semibold">{format(new Date(workout.date), 'PPP')}</p>
              )}
            </div>
            {hasStrength && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Total Volume</p>
                  <p className="text-lg font-semibold">{calculateTotalVolume()} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Sets</p>
                  <p className="text-lg font-semibold">{calculateTotalSets()}</p>
                </div>
              </>
            )}
            {hasCardio && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Total Distance</p>
                  <p className="text-lg font-semibold">{calculateTotalDistance()} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-lg font-semibold">{calculateTotalDuration()}</p>
                </div>
              </>
            )}
            {!hasCardio && (
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-lg font-semibold">
                  {workout.duration_minutes ? `${workout.duration_minutes} min` : 'Not recorded'}
                </p>
              </div>
            )}
          </div>
          {workout.notes && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Notes</p>
              {isEditing ? (
                <textarea
                  value={editedWorkout?.notes || ''}
                  onChange={(e) => setEditedWorkout({...editedWorkout!, notes: e.target.value})}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              ) : (
                <p className="text-gray-700 mt-1">{workout.notes}</p>
              )}
            </div>
          )}
        </div>

        {/* Segments - only show segments with exercises */}
        {workout.segments.filter(segment => segment.exercises.length > 0).map((segment) => (
          <div key={segment.id} className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                {segment.segment_type === 'cardio' ? (
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <Dumbbell className="h-5 w-5 mr-2 text-blue-600" />
                )}
                <h2 className="text-lg font-semibold text-gray-900">{segment.name}</h2>
                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                  {segment.segment_type}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {segment.exercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No exercises recorded in this segment</p>
                </div>
              ) : segment.exercises.map((exercise, exerciseIndex) => {
                const isSystemExercise = !exercise.exercise.created_by;
                const isOwnExercise = exercise.exercise.created_by === currentUserId && currentUserId !== null;
                const isOtherUserExercise = exercise.exercise.created_by && exercise.exercise.created_by !== currentUserId;
                
                return (
                  <div key={exercise.id} className={exerciseIndex > 0 ? 'mt-6 pt-6 border-t' : ''}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          {/* Exercise type icon - only show one */}
                          {isSystemExercise ? (
                            <div className="group relative">
                              <Award className="h-4 w-4 text-green-600" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Verified Exercise
                              </span>
                            </div>
                          ) : isOwnExercise ? (
                            <div className="group relative">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Your Custom Exercise
                              </span>
                            </div>
                          ) : isOtherUserExercise ? (
                            <div className="group relative">
                              <Users className="h-4 w-4 text-purple-600" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Community Exercise
                              </span>
                            </div>
                          ) : null}
                          
                          {/* Exercise name - clickable for own exercises (edit) or system exercises (view) */}
                          {isOwnExercise ? (
                            <Link 
                              href={`/exercises/${exercise.exercise.id}/edit`}
                              className="text-base font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              {exercise.exercise.name}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : isSystemExercise || isOtherUserExercise ? (
                            <Link 
                              href={`/exercises/${exercise.exercise.id}`}
                              className="text-base font-medium text-gray-900 hover:text-gray-700 flex items-center gap-1"
                            >
                              {exercise.exercise.name}
                              <ExternalLink className="h-3 w-3 opacity-50" />
                            </Link>
                          ) : (
                            <h3 className="text-base font-medium text-gray-900">
                              {exercise.exercise.name}
                            </h3>
                          )}
                        </div>
                        {exercise.exercise.primary_muscle_group && (
                          <p className="text-sm text-gray-500 mt-1">
                            {exercise.exercise.primary_muscle_group}
                            {exercise.exercise.equipment && ` • ${exercise.exercise.equipment}`}
                          </p>
                        )}
                      </div>
                    </div>

                  {/* Sets Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                            Set
                          </th>
                          {segment.segment_type === 'strength' ? (
                            <>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                                Weight (kg)
                              </th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                                Reps
                              </th>
                            </>
                          ) : (
                            <>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                                Distance (km)
                              </th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                                Duration
                              </th>
                            </>
                          )}
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                            Volume
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {exercise.sets.map((set) => (
                          <tr key={set.id} className="border-b">
                            <td className="py-2 text-sm text-gray-900">
                              {set.is_warmup && <span className="text-orange-500 mr-1">W</span>}
                              {set.set_number}
                            </td>
                            {segment.segment_type === 'strength' ? (
                              <>
                                <td className="py-2 text-sm text-gray-900">
                                  {set.weight_kg || '-'}
                                </td>
                                <td className="py-2 text-sm text-gray-900">
                                  {set.reps || '-'}
                                </td>
                                <td className="py-2 text-sm text-gray-900">
                                  {set.weight_kg && set.reps 
                                    ? `${(set.weight_kg * set.reps).toFixed(1)} kg`
                                    : '-'}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-2 text-sm text-gray-900">
                                  {set.distance_km?.toFixed(2) || '-'}
                                </td>
                                <td className="py-2 text-sm text-gray-900">
                                  {set.duration_seconds 
                                    ? formatDuration(set.duration_seconds)
                                    : '-'}
                                </td>
                                <td className="py-2 text-sm text-gray-900">
                                  -
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
}