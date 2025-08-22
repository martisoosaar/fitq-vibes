'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ExerciseSelect from '@/components/ExerciseSelect';
import SegmentTypeSelect from '@/components/SegmentTypeSelect';
import { Plus, X, Save, Dumbbell, Heart, StretchVertical, Trophy, MoreHorizontal } from 'lucide-react';

interface Exercise {
  id: number;
  name: string;
  category: string;
  primary_muscle_group?: string;
  created_by?: number | null;
}

interface WorkoutSegment {
  name: string;
  type: 'strength' | 'cardio' | 'mobility' | 'sports' | 'other';
  exercises: Array<{
    exercise_id: number;
    exercise_name?: string;
    order: number;
    sets: Array<{
      reps?: number;
      weight_kg?: number;
      duration_seconds?: number;
      distance_km?: number;
    }>;
  }>;
}

const segmentIcons = {
  strength: Dumbbell,
  cardio: Heart,
  mobility: StretchVertical,
  sports: Trophy,
  other: MoreHorizontal,
};

export default function NewWorkoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [title, setTitle] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  const [recentlyUsedIds, setRecentlyUsedIds] = useState<number[]>([]);
  const [segments, setSegments] = useState<WorkoutSegment[]>([
    {
      name: 'Main Workout',
      type: 'strength',
      exercises: [],
    },
  ]);

  useEffect(() => {
    // First fetch user info, then exercises and recent exercises
    const initializeData = async () => {
      const userId = await fetchUserInfo();
      await Promise.all([
        fetchExercises(),
        fetchRecentExercises()
      ]);
    };
    initializeData();
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await api.get('/exercises?per_page=1000');
      const exercisesData = res.data.data.data || [];
      setExercises(exercisesData);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/user');
      if (response.data.user) {
        setCurrentUserId(response.data.user.id);
        return response.data.user.id; // Return the user ID
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
    return null;
  };

  const fetchRecentExercises = async () => {
    try {
      // Get recent workouts to calculate usage frequency
      // Start with a smaller number to avoid timeout
      const response = await api.get('/workouts?per_page=50');
      // Handle different response structures
      let allWorkouts = [];
      if (response.data?.data?.data) {
        allWorkouts = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        allWorkouts = response.data.data;
      } else if (Array.isArray(response.data)) {
        allWorkouts = response.data;
      }
      
      // Count exercise usage frequency
      const exerciseUsageCount = new Map<number, number>();
      
      allWorkouts.forEach((workout: any) => {
        if (workout.segments && Array.isArray(workout.segments)) {
          workout.segments.forEach((segment: any) => {
            if (segment.exercises && Array.isArray(segment.exercises)) {
              segment.exercises.forEach((exercise: any) => {
                const exerciseId = exercise.exercise_id || exercise.exercise?.id;
                if (exerciseId) {
                  exerciseUsageCount.set(exerciseId, (exerciseUsageCount.get(exerciseId) || 0) + 1);
                }
              });
            }
          });
        }
      });
      
      // Sort by usage count (most used first)
      const sortedByUsage = Array.from(exerciseUsageCount.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id);
      
      console.log('Exercise usage count:', Array.from(exerciseUsageCount.entries()).slice(0, 10));
      console.log('Top 10 most used exercise IDs:', sortedByUsage.slice(0, 10));
      
      setRecentlyUsedIds(sortedByUsage); // Store all, sorted by frequency
    } catch (error) {
      console.error('Error fetching recent exercises:', error);
      // Don't crash if workouts fail to load
      setRecentlyUsedIds([]);
    }
  };

  const addSegment = (type: 'strength' | 'cardio' | 'mobility' | 'sports' | 'other') => {
    const segmentNames = {
      strength: 'Strength Training',
      cardio: 'Cardio',
      mobility: 'Mobility',
      sports: 'Sports',
      other: 'Other'
    };
    
    setSegments([
      ...segments,
      {
        name: segmentNames[type],
        type,
        exercises: [],
      },
    ]);
  };

  const removeSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  const addExercise = (segmentIndex: number) => {
    const newSegments = [...segments];
    newSegments[segmentIndex].exercises.push({
      exercise_id: exercises[0]?.id || 1,
      order: newSegments[segmentIndex].exercises.length + 1,
      sets: [{ reps: 10, weight_kg: 0 }],
    });
    setSegments(newSegments);
  };

  const addSet = (segmentIndex: number, exerciseIndex: number) => {
    const newSegments = [...segments];
    const lastSet = newSegments[segmentIndex].exercises[exerciseIndex].sets.slice(-1)[0];
    newSegments[segmentIndex].exercises[exerciseIndex].sets.push({ ...lastSet });
    setSegments(newSegments);
  };

  const updateSet = (segmentIndex: number, exerciseIndex: number, setIndex: number, field: string, value: any) => {
    const newSegments = [...segments];
    newSegments[segmentIndex].exercises[exerciseIndex].sets[setIndex] = {
      ...newSegments[segmentIndex].exercises[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setSegments(newSegments);
  };

  const handleSubmit = async () => {
    if (!title || segments.length === 0) {
      alert('Please add a title and at least one segment');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title,
        scheduled_at: new Date().toISOString(),
        segments: segments.map((segment) => ({
          ...segment,
          exercises: segment.exercises.map((ex) => ({
            ...ex,
            notes: '',
            sets: ex.sets.map((set, idx) => ({
              ...set,
              set_number: idx + 1,
            })),
          })),
        })),
      };

      await api.post('/workouts', payload);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating workout:', error);
      alert('Failed to create workout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Workout</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Workout Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Morning Full Body Workout"
            />
          </div>

          {/* Segments */}
          <div className="space-y-6">
            {segments.map((segment, segmentIndex) => {
              const Icon = segmentIcons[segment.type];
              return (
                <div key={segmentIndex} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <input
                        type="text"
                        value={segment.name}
                        onChange={(e) => {
                          const newSegments = [...segments];
                          newSegments[segmentIndex].name = e.target.value;
                          setSegments(newSegments);
                        }}
                        className="font-medium text-lg border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:outline-none dark:text-white dark:bg-transparent"
                      />
                      <SegmentTypeSelect
                        value={segment.type}
                        onChange={(type) => {
                          const newSegments = [...segments];
                          newSegments[segmentIndex].type = type;
                          setSegments(newSegments);
                        }}
                      />
                    </div>
                    {segments.length > 1 && (
                      <button
                        onClick={() => removeSegment(segmentIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Exercises in segment */}
                  <div className="space-y-4">
                    {segment.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                        <div className="mb-2">
                          <ExerciseSelect
                            exercises={exercises}
                            value={exercise.exercise_id}
                            onChange={(exerciseId) => {
                              const newSegments = [...segments];
                              newSegments[segmentIndex].exercises[exerciseIndex].exercise_id = exerciseId;
                              setSegments(newSegments);
                            }}
                            currentUserId={currentUserId}
                            recentlyUsedIds={recentlyUsedIds}
                          />
                        </div>

                        {/* Sets */}
                        <div className="space-y-2">
                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="flex gap-2 items-center">
                              <span className="text-sm text-gray-500 dark:text-gray-400 w-12">
                                Set {setIndex + 1}
                              </span>
                              {segment.type === 'strength' ? (
                                <>
                                  <input
                                    type="number"
                                    value={set.reps || ''}
                                    onChange={(e) => updateSet(segmentIndex, exerciseIndex, setIndex, 'reps', Number(e.target.value))}
                                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded text-sm"
                                    placeholder="Reps"
                                  />
                                  <span className="text-gray-500 dark:text-gray-400">×</span>
                                  <input
                                    type="number"
                                    value={set.weight_kg || ''}
                                    onChange={(e) => updateSet(segmentIndex, exerciseIndex, setIndex, 'weight_kg', Number(e.target.value))}
                                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded text-sm"
                                    placeholder="kg"
                                  />
                                </>
                              ) : (
                                <>
                                  <input
                                    type="number"
                                    value={set.duration_seconds || ''}
                                    onChange={(e) => updateSet(segmentIndex, exerciseIndex, setIndex, 'duration_seconds', Number(e.target.value))}
                                    className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded text-sm"
                                    placeholder="Seconds"
                                  />
                                  <input
                                    type="number"
                                    value={set.distance_km || ''}
                                    onChange={(e) => updateSet(segmentIndex, exerciseIndex, setIndex, 'distance_km', Number(e.target.value))}
                                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded text-sm"
                                    placeholder="km"
                                  />
                                </>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addSet(segmentIndex, exerciseIndex)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Add Set
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => addExercise(segmentIndex)}
                      className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      + Add Exercise
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Segment Button */}
          <div className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Add Segment</h3>
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={() => addSegment('strength')}
                className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Dumbbell className="h-6 w-6 text-blue-600" />
                <span className="text-xs text-gray-600">Strength</span>
              </button>
              <button
                onClick={() => addSegment('cardio')}
                className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Heart className="h-6 w-6 text-red-600" />
                <span className="text-xs text-gray-600">Cardio</span>
              </button>
              <button
                onClick={() => addSegment('mobility')}
                className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-green-50 transition-colors"
              >
                <StretchVertical className="h-6 w-6 text-green-600" />
                <span className="text-xs text-gray-600">Mobility</span>
              </button>
              <button
                onClick={() => addSegment('sports')}
                className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Trophy className="h-6 w-6 text-purple-600" />
                <span className="text-xs text-gray-600">Sports</span>
              </button>
              <button
                onClick={() => addSegment('other')}
                className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="h-6 w-6 text-gray-600" />
                <span className="text-xs text-gray-600">Other</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {isLoading ? 'Saving...' : 'Save Workout'}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}