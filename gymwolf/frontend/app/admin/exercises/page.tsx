'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Search, Dumbbell, Tag, CheckCircle, XCircle, User, Image, Video, ImageOff } from 'lucide-react';
import { format } from 'date-fns';

interface Exercise {
  id: number;
  name: string;
  category: string;
  primary_muscle_group?: string;
  secondary_muscle_groups?: string[];
  equipment?: string;
  is_public: boolean;
  created_by?: number;
  created_at: string;
  image_url?: string;
  video_url?: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function AdminExercisesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  // Initialize filters from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>(
    (searchParams.get('verified') as 'all' | 'verified' | 'unverified') || 'all'
  );
  const [filterCategory, setFilterCategory] = useState<'all' | 'strength' | 'cardio' | 'sports' | 'mobility'>(
    (searchParams.get('category') as 'all' | 'strength' | 'cardio' | 'sports' | 'mobility') || 'all'
  );
  const [filterMedia, setFilterMedia] = useState<'all' | 'with_image' | 'without_image' | 'with_video' | 'without_video'>(
    (searchParams.get('media') as 'all' | 'with_image' | 'without_image' | 'with_video' | 'without_video') || 'all'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    if (filterVerified !== 'all') params.set('verified', filterVerified);
    if (filterCategory !== 'all') params.set('category', filterCategory);
    if (filterMedia !== 'all') params.set('media', filterMedia);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    
    // Update URL without triggering navigation
    window.history.replaceState({}, '', newUrl);
  }, [searchTerm, filterVerified, filterCategory, filterMedia, currentPage]);

  useEffect(() => {
    fetchExercises();
  }, [searchTerm, filterVerified, filterCategory, filterMedia, currentPage]);

  const fetchExercises = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '20',
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (filterVerified !== 'all') {
        params.append('type', filterVerified === 'verified' ? 'verified' : 'custom');
      }
      
      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      
      if (filterMedia !== 'all') {
        params.append('media', filterMedia);
      }

      const response = await api.get(`/admin/exercises?${params}`);
      setExercises(response.data.data.data || []);
      setTotalPages(response.data.data.last_page || 1);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVerification = async (exerciseId: number) => {
    try {
      const response = await api.post(`/admin/exercises/${exerciseId}/verify`);
      if (response.data.success) {
        fetchExercises(); // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  const deleteExercise = async (exerciseId: number) => {
    if (!confirm('Are you sure you want to delete this exercise?')) {
      return;
    }
    
    try {
      const response = await api.delete(`/admin/exercises/${exerciseId}`);
      if (response.data.success) {
        fetchExercises(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading exercises...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Exercise Management</h2>
      
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, category, muscle group, creator name or email..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterVerified('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterVerified === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterVerified('verified')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterVerified === 'verified'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              System
            </button>
            <button
              onClick={() => setFilterVerified('unverified')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterVerified === 'unverified'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Custom
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center mr-2">Category:</span>
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setFilterCategory('strength')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'strength'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Strength
          </button>
          <button
            onClick={() => setFilterCategory('cardio')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'cardio'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Cardio
          </button>
          <button
            onClick={() => setFilterCategory('sports')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'sports'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Sports
          </button>
          <button
            onClick={() => setFilterCategory('mobility')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'mobility'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Mobility
          </button>
        </div>
        
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center mr-2">Media:</span>
          <button
            onClick={() => setFilterMedia('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterMedia === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterMedia('with_image')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              filterMedia === 'with_image'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Image className="h-4 w-4" />
            With Image
          </button>
          <button
            onClick={() => setFilterMedia('without_image')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              filterMedia === 'without_image'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <ImageOff className="h-4 w-4" />
            No Image
          </button>
          <button
            onClick={() => setFilterMedia('with_video')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              filterMedia === 'with_video'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Video className="h-4 w-4" />
            With Video
          </button>
          <button
            onClick={() => setFilterMedia('without_video')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterMedia === 'without_video'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            No Video
          </button>
        </div>
      </div>

      {/* Exercises Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Exercise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Muscle Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Equipment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Media
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {exercises.map((exercise) => (
              <tr key={exercise.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    {exercise.image_url && exercise.image_url !== 'null' ? (
                      <Image className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" title="Has image" />
                    ) : exercise.video_url && exercise.video_url !== 'null' ? (
                      <Video className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" title="Has video" />
                    ) : (
                      <Dumbbell className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" title="No media" />
                    )}
                    <div className="text-sm font-medium text-gray-900 dark:text-white break-words max-w-xs">
                      {exercise.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900 dark:text-gray-300">
                    <Tag className="h-4 w-4 text-gray-400 mr-1" />
                    {exercise.category || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {exercise.primary_muscle_group || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {exercise.equipment || 'None'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {exercise.image_url && (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        <Image className="h-3 w-3" />
                        Image
                      </span>
                    )}
                    {exercise.video_url && (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                        <Video className="h-3 w-3" />
                        Video
                      </span>
                    )}
                    {!exercise.image_url && !exercise.video_url && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">No media</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {!exercise.created_by ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      System
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                      <XCircle className="h-4 w-4 mr-1" />
                      Custom
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {exercise.creator ? (
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-gray-300">{exercise.creator.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{exercise.creator.email}</div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">Gymwolf</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (searchTerm) params.set('search', searchTerm);
                        if (filterVerified !== 'all') params.set('verified', filterVerified);
                        if (filterCategory !== 'all') params.set('category', filterCategory);
                        if (filterMedia !== 'all') params.set('media', filterMedia);
                        if (currentPage > 1) params.set('page', currentPage.toString());
                        const queryString = params.toString();
                        router.push(`/admin/exercises/${exercise.id}${queryString ? `?${queryString}` : ''}`);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 whitespace-nowrap"
                    >
                      View
                    </button>
                    <button
                      onClick={() => toggleVerification(exercise.id)}
                      className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 whitespace-nowrap"
                    >
                      {!exercise.created_by ? 'Make Custom' : 'Make System'}
                    </button>
                    <button
                      onClick={() => deleteExercise(exercise.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {exercises.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No exercises found
          </div>
        )}
      </div>
    </div>
  );
}