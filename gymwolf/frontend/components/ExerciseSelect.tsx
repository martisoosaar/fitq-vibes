'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Award, User, Users, TrendingUp } from 'lucide-react';

interface Exercise {
  id: number;
  name: string;
  category: string;
  primary_muscle_group?: string;
  created_by?: number | null;
}

interface ExerciseSelectProps {
  exercises: Exercise[];
  value: number;
  onChange: (exerciseId: number) => void;
  currentUserId?: number;
  recentlyUsedIds?: number[];
}

export default function ExerciseSelect({ exercises, value, onChange, currentUserId, recentlyUsedIds = [] }: ExerciseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedExercise = exercises.find(ex => ex.id === value);

  useEffect(() => {
    // Backend already filters for verified and own exercises, 
    // so we just use all exercises that come from backend
    let filtered = [...exercises];

    // Apply search filter if search term exists
    if (searchTerm) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.primary_muscle_group?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort exercises with multi-level priority
    filtered.sort((a, b) => {
      const aRecentIndex = recentlyUsedIds.indexOf(a.id);
      const bRecentIndex = recentlyUsedIds.indexOf(b.id);
      const aIsFrequent = aRecentIndex !== -1;
      const bIsFrequent = bRecentIndex !== -1;
      
      // Priority 1: Frequently used exercises (sorted by frequency/recency)
      if (aIsFrequent && bIsFrequent) {
        return aRecentIndex - bRecentIndex; // Lower index = more frequent
      }
      if (aIsFrequent && !bIsFrequent) return -1;
      if (!aIsFrequent && bIsFrequent) return 1;
      
      // Priority 2: User's own exercises (if any)
      if (currentUserId) {
        const aIsOwn = a.created_by === currentUserId;
        const bIsOwn = b.created_by === currentUserId;
        if (aIsOwn && !bIsOwn) return -1;
        if (!aIsOwn && bIsOwn) return 1;
      }
      
      // Priority 3: Verified exercises
      if (!a.created_by && b.created_by) return -1;
      if (a.created_by && !b.created_by) return 1;
      
      // Priority 4: Alphabetical
      return a.name.localeCompare(b.name);
    });

    setFilteredExercises(filtered);
  }, [searchTerm, exercises, currentUserId, recentlyUsedIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (exerciseId: number) => {
    onChange(exerciseId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getExerciseIcon = (exercise: Exercise) => {
    if (!exercise.created_by) {
      return <Award className="h-4 w-4 text-green-600" title="Verified exercise" />;
    } else if (exercise.created_by === currentUserId) {
      return <User className="h-4 w-4 text-blue-600" title="Your exercise" />;
    }
    return null; // Should not happen with our filter
  };

  // Group exercises for better display
  let groupedExercises: Record<string, Exercise[]>;
  
  if (recentlyUsedIds.length > 0 && !searchTerm) {
    // Show frequently used first, then others
    const frequentlyUsed = filteredExercises.filter(ex => 
      recentlyUsedIds.includes(ex.id)
    );
    const others = filteredExercises.filter(ex => 
      !recentlyUsedIds.includes(ex.id)
    );
    
    console.log('Frequently used IDs:', recentlyUsedIds.slice(0, 10));
    console.log('Found frequently used exercises:', frequentlyUsed.length);
    console.log('Frequently used exercises:', frequentlyUsed.slice(0, 5));
    
    groupedExercises = {};
    if (frequentlyUsed.length > 0) {
      groupedExercises['Frequently Used'] = frequentlyUsed; // Show all frequently used, not just top 10
    }
    if (others.length > 0) {
      groupedExercises['All Exercises'] = others;
    }
  } else if (!searchTerm) {
    // Group by category when no search and no frequently used
    groupedExercises = filteredExercises.reduce((acc, exercise) => {
      const category = exercise.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(exercise);
      return acc;
    }, {} as Record<string, Exercise[]>);
  } else {
    // During search, show flat list to preserve sorting
    groupedExercises = { 'Search Results': filteredExercises };
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedExercise && getExerciseIcon(selectedExercise)}
            <span className="block truncate">
              {selectedExercise?.name || 'Select an exercise'}
            </span>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-96 overflow-hidden">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exercises..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {Object.keys(groupedExercises).length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                No exercises found
              </div>
            ) : (
              Object.entries(groupedExercises).map(([category, categoryExercises]) => (
                <div key={category}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700">
                    {category}
                  </div>
                  {categoryExercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => handleSelect(exercise.id)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none ${
                        exercise.id === value ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                      } dark:text-white`}
                    >
                      <div className="flex items-center gap-2">
                        {getExerciseIcon(exercise)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium dark:text-white">{exercise.name}</span>
                            {recentlyUsedIds.includes(exercise.id) && (
                              <TrendingUp className="h-3 w-3 text-orange-500" title="Frequently used" />
                            )}
                          </div>
                          {exercise.primary_muscle_group && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {exercise.primary_muscle_group}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}