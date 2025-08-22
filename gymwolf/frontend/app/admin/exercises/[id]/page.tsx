'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Dumbbell, Tag, User, Calendar, CheckCircle, XCircle, Activity, ChevronDown, ChevronUp, Users, Edit2, Save, X, Plus } from 'lucide-react';
import MediaSection from './MediaSection';
import { format } from 'date-fns';

interface ExerciseDetail {
  exercise: {
    id: number;
    name: string;
    category?: string;
    primary_muscle_group?: string;
    secondary_muscle_groups?: string[] | null;
    equipment?: string;
    description?: string;
    instructions?: string;
    is_public?: boolean;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
    image_url?: string;
    video_url?: string;
    creator?: {
      id: number;
      name: string;
      email: string;
    };
  };
  stats?: {
    total_uses: number;
    unique_users: number;
    last_used?: string;
  };
  recent_workouts?: Array<{
    id: number;
    name: string;
    date: string;
    user: {
      id: number;
      name: string;
    };
  }>;
  recent_users?: Array<{
    id: number;
    name: string;
    email: string;
    workout_count: number;
    last_used: string;
  }>;
}

export default function AdminExerciseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const exerciseId = params.id as string;
  const [data, setData] = useState<ExerciseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecentUsers, setShowRecentUsers] = useState(false);
  const [assigningToUser, setAssigningToUser] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [muscleGroups, setMuscleGroups] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [showNewEquipment, setShowNewEquipment] = useState(false);
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [isCreatingEquipment, setIsCreatingEquipment] = useState(false);
  
  // Build the back URL with preserved query params
  const getBackUrl = () => {
    const queryString = searchParams.toString();
    return queryString ? `/admin/exercises?${queryString}` : '/admin/exercises';
  };

  useEffect(() => {
    if (exerciseId) {
      fetchExerciseDetail();
      fetchMuscleGroups();
      fetchEquipment();
    }
  }, [exerciseId]);

  const fetchExerciseDetail = async () => {
    try {
      const response = await api.get(`/admin/exercises/${exerciseId}`);
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching exercise details:', error);
      router.push(getBackUrl());
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchMuscleGroups = async () => {
    try {
      const response = await api.get('/admin/muscle-groups');
      setMuscleGroups(response.data.data || []);
    } catch (error) {
      console.error('Error fetching muscle groups:', error);
    }
  };
  
  const fetchEquipment = async () => {
    try {
      const response = await api.get('/admin/equipment');
      setEquipment(response.data.data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
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

  const createNewEquipment = async () => {
    if (!newEquipmentName.trim()) return;
    
    setIsCreatingEquipment(true);
    try {
      const response = await api.post('/admin/equipment', {
        name: newEquipmentName.trim(),
        category: 'other'
      });
      
      if (response.data.success) {
        await fetchEquipment();
        setEditValues({ ...editValues, equipment: response.data.data.name });
        setNewEquipmentName('');
        setShowNewEquipment(false);
      }
    } catch (error) {
      console.error('Error creating equipment:', error);
    } finally {
      setIsCreatingEquipment(false);
    }
  };

  const toggleVerification = async () => {
    try {
      const response = await api.post(`/admin/exercises/${exerciseId}/verify`);
      if (response.data.success) {
        fetchExerciseDetail(); // Refresh the data
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  const deleteExercise = async () => {
    if (!confirm('Are you sure you want to delete this exercise? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await api.delete(`/admin/exercises/${exerciseId}`);
      if (response.data.success) {
        router.push(getBackUrl());
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };
  
  const startEditing = (field: string, value: any) => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: value || '' });
  };
  
  const cancelEditing = () => {
    setEditingField(null);
    setEditValues({});
  };
  
  const saveField = async (field: string) => {
    setIsSaving(true);
    try {
      const response = await api.put(`/admin/exercises/${exerciseId}`, {
        [field]: editValues[field]
      });
      if (response.data.success) {
        fetchExerciseDetail(); // Refresh data
        setEditingField(null);
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const assignToUser = async (userId: number) => {
    setAssigningToUser(userId);
    try {
      const response = await api.post(`/admin/exercises/${exerciseId}/assign-to-user`, {
        user_id: userId
      });
      if (response.data.success) {
        fetchExerciseDetail(); // Refresh the data
      }
    } catch (error) {
      console.error('Error assigning exercise to user:', error);
    } finally {
      setAssigningToUser(null);
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading exercise details...</div>;
  }

  if (!data || !data.exercise) {
    return <div className="text-gray-500 dark:text-gray-400">Exercise not found</div>;
  }
  
  const exercise = data.exercise;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push(getBackUrl())}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Exercises
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={toggleVerification}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !exercise.created_by
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {!exercise.created_by ? 'Make Custom' : 'Make System'}
          </button>
          <button
            onClick={deleteExercise}
            className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete Exercise
          </button>
        </div>
      </div>

      {/* Exercise Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                {editingField === 'name' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="text-2xl font-bold px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                      autoFocus
                    />
                    <button
                      onClick={() => saveField('name')}
                      disabled={isSaving}
                      className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-gray-600 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{exercise.name}</h2>
                    <button
                      onClick={() => startEditing('name', exercise.name)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-1">
                  {!exercise.created_by ? (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      <CheckCircle className="h-3 w-3" />
                      System
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                      <XCircle className="h-3 w-3" />
                      Custom
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</p>
              {editingField === 'category' ? (
                <div className="flex items-center gap-2">
                  <select
                    value={editValues.category}
                    onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                    className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">None</option>
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="sports">Sports</option>
                    <option value="mobility">Mobility</option>
                  </select>
                  <button
                    onClick={() => saveField('category')}
                    disabled={isSaving}
                    className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-1 text-gray-600 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="text-gray-900 dark:text-gray-300 flex items-center gap-1">
                  <Tag className="h-4 w-4 text-gray-400" />
                  {exercise.category || 'Uncategorized'}
                  <button
                    onClick={() => startEditing('category', exercise.category)}
                    className="ml-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </p>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Primary Muscle</p>
              {editingField === 'primary_muscle_group' ? (
                <div className="flex items-center gap-2">
                  <select
                    value={editValues.primary_muscle_group || ''}
                    onChange={(e) => setEditValues({ ...editValues, primary_muscle_group: e.target.value })}
                    className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Select muscle...</option>
                    {muscleGroups.map((group) => (
                      <option key={group.id} value={group.name}>{group.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => saveField('primary_muscle_group')}
                    disabled={isSaving}
                    className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-1 text-gray-600 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <p className="text-gray-900 dark:text-gray-300">{exercise.primary_muscle_group || 'Not specified'}</p>
                  <button
                    onClick={() => startEditing('primary_muscle_group', exercise.primary_muscle_group)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Equipment</p>
              {editingField === 'equipment' ? (
                <div className="space-y-2">
                  {!showNewEquipment ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={editValues.equipment || ''}
                        onChange={(e) => setEditValues({ ...editValues, equipment: e.target.value })}
                        className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="">Select equipment...</option>
                        {equipment.map((item) => (
                          <option key={item.id} value={item.name}>{item.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowNewEquipment(true)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                        title="Add new equipment"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => saveField('equipment')}
                        disabled={isSaving}
                        className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          cancelEditing();
                          setShowNewEquipment(false);
                          setNewEquipmentName('');
                        }}
                        className="p-1 text-gray-600 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newEquipmentName}
                        onChange={(e) => setNewEquipmentName(e.target.value)}
                        placeholder="New equipment name..."
                        className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        autoFocus
                      />
                      <button
                        onClick={createNewEquipment}
                        disabled={isCreatingEquipment || !newEquipmentName.trim()}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {isCreatingEquipment ? 'Creating...' : 'Create'}
                      </button>
                      <button
                        onClick={() => {
                          setShowNewEquipment(false);
                          setNewEquipmentName('');
                        }}
                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <p className="text-gray-900 dark:text-gray-300">{exercise.equipment || 'None'}</p>
                  <button
                    onClick={() => startEditing('equipment', exercise.equipment)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created</p>
              <p className="text-gray-900 dark:text-gray-300 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                {exercise.created_at ? format(new Date(exercise.created_at), 'MMM d, yyyy') : 'Unknown'}
              </p>
            </div>
          </div>
          
          {/* Secondary Muscle Groups */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Secondary Muscles</p>
            {editingField === 'secondary_muscle_groups' ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {muscleGroups.map((group) => {
                    const isSelected = (editValues.secondary_muscle_groups || []).includes(group.name);
                    return (
                      <button
                        key={group.id}
                        onClick={() => {
                          const current = editValues.secondary_muscle_groups || [];
                          if (isSelected) {
                            setEditValues({
                              ...editValues,
                              secondary_muscle_groups: current.filter((g: string) => g !== group.name)
                            });
                          } else {
                            setEditValues({
                              ...editValues,
                              secondary_muscle_groups: [...current, group.name]
                            });
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {group.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => saveField('secondary_muscle_groups')}
                    disabled={isSaving}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 inline mr-1" />
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 inline mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  {exercise.secondary_muscle_groups && exercise.secondary_muscle_groups.length > 0 ? (
                    exercise.secondary_muscle_groups.map((muscle: string) => (
                      <span key={muscle} className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {muscle}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">None specified</span>
                  )}
                </div>
                <button
                  onClick={() => startEditing('secondary_muscle_groups', exercise.secondary_muscle_groups || [])}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          
          {/* Creator Info */}
          {exercise.creator ? (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Created by</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {exercise.creator.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <button
                    onClick={() => router.push(`/admin/users/${exercise.creator?.id}`)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                  >
                    {exercise.creator.name}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{exercise.creator.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Created by</p>
              <p className="text-gray-700 dark:text-gray-300">Gymwolf System</p>
            </div>
          )}
        </div>
      </div>

      {/* Media Section */}
      <MediaSection 
        exercise={exercise} 
        exerciseId={exerciseId} 
        onUpdate={fetchExerciseDetail} 
      />

      {/* Video Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exercise Video</h3>
            {!editingField && (
              <button
                onClick={() => startEditing('video_url', exercise.video_url)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Edit2 className="h-4 w-4" />
                {exercise.video_url ? 'Edit Video URL' : 'Add Video URL'}
              </button>
            )}
          </div>
          
          {editingField === 'video_url' ? (
            <div className="space-y-3">
              <input
                type="url"
                value={editValues.video_url || ''}
                onChange={(e) => setEditValues({ ...editValues, video_url: e.target.value })}
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveField('video_url')}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Save Video URL
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : exercise.video_url ? (
            <>
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={getEmbedUrl(exercise.video_url)}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Video URL: <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  {exercise.video_url}
                </a>
              </p>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No video URL set for this exercise</p>
            </div>
          )}
        </div>
      </div>

      {/* Description & Instructions */}
      {(exercise.description || exercise.instructions) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6">
            {exercise.description && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{exercise.description}</p>
              </div>
            )}
            
            {exercise.instructions && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Instructions</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{exercise.instructions}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage Stats */}
      {data.stats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <Activity className="h-10 w-10 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Uses</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {data.stats.total_uses || 0}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Users</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {data.stats.unique_users || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Used</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {data.stats.last_used ? format(new Date(data.stats.last_used), 'MMM d, yyyy') : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Users */}
      {data.recent_users && data.recent_users.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Users ({data.recent_users.length})
              </h3>
              <button
                onClick={() => setShowRecentUsers(!showRecentUsers)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showRecentUsers ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            
            {showRecentUsers && (
              <div className="space-y-3">
                {data.recent_users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>{user.email}</p>
                        <p className="mt-1">
                          Used {user.workout_count} time{user.workout_count !== 1 ? 's' : ''} • 
                          Last: {format(new Date(user.last_used), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm"
                      >
                        View User
                      </button>
                      {!exercise.created_by && (
                        <button
                          onClick={() => assignToUser(user.id)}
                          disabled={assigningToUser === user.id}
                          className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {assigningToUser === user.id ? 'Assigning...' : 'Make Custom for User'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      {data.recent_workouts && data.recent_workouts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Workouts</h3>
            
            <div className="space-y-3">
              {data.recent_workouts.map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {workout.name || 'Untitled Workout'}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {workout.user.name}
                      </span>
                      <span>{format(new Date(workout.date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/workouts/${workout.id}`)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm"
                  >
                    View Workout
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