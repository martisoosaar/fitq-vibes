'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ArrowLeft, Save, X } from 'lucide-react';

interface Exercise {
  id: number;
  name: string;
  category: string;
  primary_muscle_group: string | null;
  secondary_muscle_groups: string | null;
  equipment: string | null;
  instructions: string | null;
  created_by: number | null;
}

const muscleGroups = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
  'Abs', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Traps', 'Lats'
];

const equipmentOptions = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight',
  'Kettlebell', 'Resistance Bands', 'Medicine Ball', 'EZ Bar',
  'Smith Machine', 'Other'
];

export default function EditExercisePage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params.id as string;
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'strength',
    primary_muscle_group: '',
    equipment: '',
    instructions: ''
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
    } else {
      fetchExercise();
    }
  }, [exerciseId]);

  const fetchExercise = async () => {
    try {
      const response = await api.get(`/exercises/${exerciseId}`);
      if (response.data.success) {
        const ex = response.data.data;
        setExercise(ex);
        setFormData({
          name: ex.name || '',
          category: ex.category || 'strength',
          primary_muscle_group: ex.primary_muscle_group || '',
          equipment: ex.equipment || '',
          instructions: ex.instructions || ''
        });
        
        // Check if user owns this exercise
        const userResponse = await api.get('/user');
        if (userResponse.data.user && ex.created_by !== userResponse.data.user.id) {
          setError('You can only edit your own custom exercises');
        }
      }
    } catch (error: any) {
      console.error('Error fetching exercise:', error);
      setError('Failed to load exercise');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await api.put(`/exercises/${exerciseId}`, formData);
      if (response.data.success) {
        router.back();
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      alert('Failed to update exercise');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading exercise...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Exercise</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* Exercise Name */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Exercise Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          {/* Primary Muscle Group */}
          <div className="mb-6">
            <label htmlFor="muscle" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Muscle Group
            </label>
            <select
              id="muscle"
              value={formData.primary_muscle_group}
              onChange={(e) => setFormData({...formData, primary_muscle_group: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select muscle group</option>
              {muscleGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Equipment */}
          <div className="mb-6">
            <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 mb-2">
              Equipment
            </label>
            <select
              id="equipment"
              value={formData.equipment}
              onChange={(e) => setFormData({...formData, equipment: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select equipment</option>
              {equipmentOptions.map(eq => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
              placeholder="Describe how to perform this exercise..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSaving}
            >
              <X className="h-4 w-4 inline mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSaving}
            >
              <Save className="h-4 w-4 inline mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}