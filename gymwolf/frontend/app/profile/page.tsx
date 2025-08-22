'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { ArrowLeft, Save, User, Mail, Ruler, Weight } from 'lucide-react';

interface UserProfile {
  bio?: string;
  avatar_url?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  unit_system: 'metric' | 'imperial';
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    unit_system: 'metric'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
    } else {
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      if (response.data.data) {
        const userData = response.data.data;
        // Extract profile data from the user object
        setProfile({
          bio: userData.profile?.bio || '',
          height_cm: userData.profile?.height_cm || null,
          weight_kg: userData.profile?.weight_kg || null,
          unit_system: userData.profile?.unit_system || 'metric',
          avatar_url: userData.profile?.avatar_url || null
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.put('/profile', profile);
      if (response.data.success) {
        setToastMessage('Profile updated successfully!');
        setToastType('success');
        setShowToast(true);
        // Refresh profile data to get the latest
        fetchProfile();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setToastMessage('Failed to update profile');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* User Info */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <User className="h-5 w-5" />
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-300 rounded-md">{user?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-300 rounded-md">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Physical Stats */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Physical Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Ruler className="inline h-4 w-4 mr-1" />
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.height_cm || ''}
                    onChange={(e) => setProfile({...profile, height_cm: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 180"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Weight className="inline h-4 w-4 mr-1" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={profile.weight_kg || ''}
                    onChange={(e) => setProfile({...profile, weight_kg: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 75"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Tell us about your fitness journey..."
              />
            </div>

            {/* Unit System */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit System
              </label>
              <select
                value={profile.unit_system}
                onChange={(e) => setProfile({...profile, unit_system: e.target.value as 'metric' | 'imperial'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="metric">Metric (kg, cm)</option>
                <option value="imperial">Imperial (lbs, inches)</option>
              </select>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
      
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <Footer />
    </div>
  );
}