'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Search, Filter, Edit2, Trash2, Eye, Dumbbell, User, Shield } from 'lucide-react';

interface Exercise {
  id: number;
  name: string;
  category: string;
  primary_muscle_group: string | null;
  secondary_muscle_groups: string[] | null;
  equipment: string | null;
  created_by: number | null;
  is_public: boolean;
  usage_count?: number;
}

interface MuscleGroup {
  id: number;
  name: string;
  category: string | null;
  exercise_count?: number;
}

export default function ExercisesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'my';
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [muscleGroup, setMuscleGroup] = useState('all');
  const [equipment, setEquipment] = useState('all');
  
  const [muscleGroupOptions, setMuscleGroupOptions] = useState<string[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchUserData();
    if (activeTab === 'my') {
      fetchMyExercises();
    } else if (activeTab === 'verified') {
      fetchVerifiedExercises();
    } else {
      fetchMuscleGroups();
      if (selectedMuscleGroup) {
        fetchExercisesByMuscleGroup(selectedMuscleGroup);
      }
    }
  }, [activeTab, selectedMuscleGroup]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user');
      setCurrentUserId(response.data.id);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchMyExercises = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (category !== 'all') params.append('category', category);
      if (muscleGroup !== 'all') params.append('muscle_group', muscleGroup);
      if (equipment !== 'all') params.append('equipment', equipment);
      
      const response = await api.get(`/user/exercises?${params.toString()}`);
      setExercises(response.data.exercises || []);
      
      // Extract unique muscle groups and equipment for filters
      const muscleGroups = new Set<string>();
      const equipmentSet = new Set<string>();
      
      response.data.exercises?.forEach((ex: Exercise) => {
        if (ex.primary_muscle_group) muscleGroups.add(ex.primary_muscle_group);
        if (ex.equipment) equipmentSet.add(ex.equipment);
      });
      
      setMuscleGroupOptions(Array.from(muscleGroups).sort());
      setEquipmentOptions(Array.from(equipmentSet).sort());
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVerifiedExercises = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (category !== 'all') params.append('category', category);
      if (muscleGroup !== 'all') params.append('muscle_group', muscleGroup);
      if (equipment !== 'all') params.append('equipment', equipment);
      
      const response = await api.get(`/exercises/verified?${params.toString()}`);
      setExercises(response.data.exercises || response.data || []);
      
      // Extract unique muscle groups and equipment for filters
      const muscleGroups = new Set<string>();
      const equipmentSet = new Set<string>();
      
      const exerciseList = response.data.exercises || response.data || [];
      exerciseList.forEach((ex: Exercise) => {
        if (ex.primary_muscle_group) muscleGroups.add(ex.primary_muscle_group);
        if (ex.equipment) equipmentSet.add(ex.equipment);
      });
      
      setMuscleGroupOptions(Array.from(muscleGroups).sort());
      setEquipmentOptions(Array.from(equipmentSet).sort());
    } catch (error) {
      console.error('Error fetching verified exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMuscleGroups = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/muscle-groups');
      // Handle both direct array and nested data structure
      const muscleGroupsData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setMuscleGroups(muscleGroupsData);
    } catch (error) {
      console.error('Error fetching muscle groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExercisesByMuscleGroup = async (muscleGroupName: string) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/exercises/by-muscle-group/${encodeURIComponent(muscleGroupName)}`);
      setExercises(response.data.exercises || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (exerciseId: number) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;
    
    try {
      await api.delete(`/exercises/${exerciseId}`);
      setExercises(exercises.filter(ex => ex.id !== exerciseId));
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Failed to delete exercise');
    }
  };

  const setActiveTab = (tab: string) => {
    router.push(`/exercises?tab=${tab}`);
    setSelectedMuscleGroup(null);
  };

  const getExerciseIcon = (exercise: Exercise) => {
    if (exercise.created_by === null) {
      return <Shield className="h-4 w-4 text-blue-500" title="System exercise" />;
    } else if (exercise.created_by === currentUserId) {
      return <User className="h-4 w-4 text-green-500" title="Your exercise" />;
    } else {
      return <User className="h-4 w-4 text-gray-400" title="Community exercise" />;
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    if (searchTerm && !exercise.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Exercises</h1>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('my')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              My Exercises
            </button>
            <button
              onClick={() => setActiveTab('verified')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'verified'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Verified Exercises
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              All Exercises
            </button>
          </nav>
        </div>

        {/* My Exercises Tab */}
        {activeTab === 'my' && (
          <div>
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="sports">Sports</option>
                  <option value="mobility">Mobility</option>
                </select>

                <select
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Muscle Groups</option>
                  {muscleGroupOptions.map(mg => (
                    <option key={mg} value={mg}>{mg}</option>
                  ))}
                </select>

                <select
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Equipment</option>
                  {equipmentOptions.map(eq => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>

                <button
                  onClick={fetchMyExercises}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Filter className="h-5 w-5 inline mr-1" />
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Exercise List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading exercises...</div>
              ) : filteredExercises.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No exercises found</div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredExercises.map((exercise) => (
                    <div key={exercise.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getExerciseIcon(exercise)}
                            <Link 
                              href={`/exercises/${exercise.id}`}
                              className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {exercise.name}
                            </Link>
                            {exercise.usage_count && exercise.usage_count > 0 && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({exercise.usage_count} uses)
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="inline-block mr-4">
                              Category: <span className="font-medium">{exercise.category}</span>
                            </span>
                            {exercise.primary_muscle_group && (
                              <span className="inline-block mr-4">
                                Muscle: <span className="font-medium">{exercise.primary_muscle_group}</span>
                              </span>
                            )}
                            {exercise.equipment && (
                              <span className="inline-block">
                                Equipment: <span className="font-medium">{exercise.equipment}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/exercises/${exercise.id}`}
                            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            title="View exercise"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          {exercise.created_by === currentUserId && (
                            <>
                              <Link
                                href={`/exercises/${exercise.id}/edit`}
                                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                title="Edit exercise"
                              >
                                <Edit2 className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(exercise.id)}
                                className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                title="Delete exercise"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verified Exercises Tab */}
        {activeTab === 'verified' && (
          <div>
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="sports">Sports</option>
                  <option value="mobility">Mobility</option>
                </select>

                <select
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Muscle Groups</option>
                  {muscleGroupOptions.map(mg => (
                    <option key={mg} value={mg}>{mg}</option>
                  ))}
                </select>

                <select
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Equipment</option>
                  {equipmentOptions.map(eq => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>

                <button
                  onClick={fetchVerifiedExercises}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Filter className="h-5 w-5 inline mr-1" />
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Exercise List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading exercises...</div>
              ) : filteredExercises.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No exercises found</div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredExercises.map((exercise) => (
                    <div key={exercise.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" title="Verified exercise" />
                            <Link 
                              href={`/exercises/${exercise.id}`}
                              className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {exercise.name}
                            </Link>
                          </div>
                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="inline-block mr-4">
                              Category: <span className="font-medium">{exercise.category}</span>
                            </span>
                            {exercise.primary_muscle_group && (
                              <span className="inline-block mr-4">
                                Muscle: <span className="font-medium">{exercise.primary_muscle_group}</span>
                              </span>
                            )}
                            {exercise.equipment && (
                              <span className="inline-block">
                                Equipment: <span className="font-medium">{exercise.equipment}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/exercises/${exercise.id}`}
                            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            title="View exercise"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Exercises Tab */}
        {activeTab === 'all' && (
          <div>
            {!selectedMuscleGroup ? (
              // Muscle Groups Grid
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {muscleGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedMuscleGroup(group.name)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Dumbbell className="h-8 w-8 text-blue-500" />
                      {group.exercise_count !== undefined && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {group.exercise_count} exercises
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {group.name}
                    </h3>
                    {group.category && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {group.category}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              // Exercise List for Selected Muscle Group
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedMuscleGroup} Exercises
                  </h2>
                  <button
                    onClick={() => setSelectedMuscleGroup(null)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    ← Back to muscle groups
                  </button>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading exercises...</div>
                  ) : exercises.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No exercises found for this muscle group</div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {exercises.map((exercise) => (
                        <div key={exercise.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {getExerciseIcon(exercise)}
                                <Link 
                                  href={`/exercises/${exercise.id}`}
                                  className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  {exercise.name}
                                </Link>
                              </div>
                              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="inline-block mr-4">
                                  Category: <span className="font-medium">{exercise.category}</span>
                                </span>
                                {exercise.equipment && (
                                  <span className="inline-block">
                                    Equipment: <span className="font-medium">{exercise.equipment}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link
                              href={`/exercises/${exercise.id}`}
                              className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                              title="View exercise"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}