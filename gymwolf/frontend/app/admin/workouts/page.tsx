'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Search, Calendar, User, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface Workout {
  id: number;
  user_id: number;
  name: string;
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
    exercises?: Array<{
      id: number;
    }>;
  }>;
}

export default function AdminWorkoutsPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWorkouts = async (page: number, search: string, date: string, isFromSearch = false) => {
    if (isFromSearch) {
      setIsSearching(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      });
      
      if (search) {
        params.append('search', search);
      }
      
      if (date) {
        // Use the same date for both from and to to filter for specific date
        params.append('from_date', date);
        params.append('to_date', date);
      }

      const response = await api.get(`/admin/workouts?${params}`);
      setWorkouts(response.data.data.data || []);
      setTotalPages(response.data.data.last_page || 1);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWorkouts(1, '', '', false);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '' || dateFilter !== '') {
        setCurrentPage(1);
        fetchWorkouts(1, searchTerm, dateFilter, true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, dateFilter]);

  // Page change
  useEffect(() => {
    if (currentPage > 1) {
      fetchWorkouts(currentPage, searchTerm, dateFilter, false);
    }
  }, [currentPage]);

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading workouts...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Management</h2>
        {isSearching && (
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            Searching...
          </div>
        )}
      </div>
      
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search workouts by name or user..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Workouts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Workout
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Exercises
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {workouts.map((workout) => (
              <tr key={workout.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {workout.name || 'Untitled Workout'}
                    </div>
                    {workout.notes && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {workout.notes}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {workout.user?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {workout.user?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {format(new Date(workout.created_at), 'MMM d, yyyy')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(workout.created_at), 'h:mm a')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900 dark:text-gray-300">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    {workout.duration_minutes ? `${workout.duration_minutes} min` : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900 dark:text-gray-300">
                    <Activity className="h-4 w-4 text-gray-400 mr-1" />
                    {workout.segments?.reduce((total, segment) => 
                      total + (segment.exercises?.length || 0), 0
                    ) || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => router.push(`/admin/workouts/${workout.id}`)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
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
        
        {workouts.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">No workouts found</p>
            {(searchTerm || dateFilter) && (
              <div className="text-sm">
                {dateFilter && (
                  <p>No workouts on {format(new Date(dateFilter), 'MMMM d, yyyy')}</p>
                )}
                {searchTerm && (
                  <p>No results for "{searchTerm}"</p>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('');
                  }}
                  className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}