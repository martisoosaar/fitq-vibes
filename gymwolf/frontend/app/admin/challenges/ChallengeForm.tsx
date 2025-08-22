'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { ArrowLeft, Save, Trophy } from 'lucide-react';
import Link from 'next/link';

// Dynamically import to avoid SSR issues
const ImageUploadEditor = dynamic(() => import('@/components/ImageUploadEditor'), {
  ssr: false,
});

interface ChallengeFormProps {
  challengeId?: string;
  isNew?: boolean;
}

interface ChallengeData {
  title: string;
  description: string;
  rules: string;
  prizes: string;
  image_url: string;
  video_url: string;
  result_type: 'reps' | 'time';
  scoring_type: 'higher_better' | 'lower_better';
  result_unit: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export default function ChallengeForm({ challengeId, isNew = false }: ChallengeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  
  const [formData, setFormData] = useState<ChallengeData>({
    title: '',
    description: '',
    rules: '',
    prizes: '',
    image_url: '',
    video_url: '',
    result_type: 'reps',
    scoring_type: 'higher_better',
    result_unit: 'reps',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true,
  });

  useEffect(() => {
    if (!isNew && challengeId) {
      fetchChallenge();
    }
  }, [challengeId, isNew]);

  const fetchChallenge = async () => {
    try {
      const response = await api.get(`/admin/challenges/${challengeId}`);
      const challenge = response.data;
      
      // Check if challenge has results
      setHasResults(challenge.results && challenge.results.length > 0);
      
      setFormData({
        title: challenge.title,
        description: challenge.description,
        rules: challenge.rules || '',
        prizes: challenge.prizes || '',
        image_url: challenge.image_url || '',
        video_url: challenge.video_url || '',
        result_type: challenge.result_type,
        scoring_type: challenge.scoring_type,
        result_unit: challenge.result_unit || '',
        start_date: challenge.start_date.split('T')[0],
        end_date: challenge.end_date.split('T')[0],
        is_active: challenge.is_active,
      });
    } catch (error) {
      console.error('Error fetching challenge:', error);
      alert('Failed to load challenge');
      router.push('/admin/challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isNew) {
        await api.post('/admin/challenges', formData);
        alert('Challenge created successfully');
      } else {
        await api.put(`/admin/challenges/${challengeId}`, formData);
        alert('Challenge updated successfully');
      }
      router.push('/admin/challenges');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save challenge');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Update result unit when result type changes
  const handleResultTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'reps' | 'time';
    setFormData(prev => ({
      ...prev,
      result_type: value,
      result_unit: value === 'reps' ? 'reps' : 'seconds',
      scoring_type: value === 'reps' ? 'higher_better' : 'lower_better',
    }));
  };

  // Convert YouTube URL to embed format
  const convertToEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Already an embed URL
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const handleImageUpload = async (file: File) => {
    if (!challengeId && !isNew) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      if (!isNew && challengeId) {
        // Upload to existing challenge
        const response = await api.post(`/admin/challenges/${challengeId}/upload-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          setFormData(prev => ({
            ...prev,
            image_url: response.data.image_url,
          }));
        }
      } else {
        // For new challenges, we'll need to save the challenge first
        alert('Please save the challenge first before uploading an image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading challenge...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/challenges"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isNew ? 'Create New Challenge' : 'Edit Challenge'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isNew ? 'Set up a new fitness challenge' : 'Update challenge details'}
          </p>
        </div>
      </div>

      {/* Warning for challenges with results */}
      {hasResults && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ This challenge has existing results. You cannot change the result type or scoring type.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="e.g., Push-Up Challenge"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="Describe the challenge and what participants need to do..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rules
                </label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="List the rules and requirements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prizes
                </label>
                <textarea
                  name="prizes"
                  value={formData.prizes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="Describe the prizes for winners..."
                />
              </div>
            </div>
          </div>

          {/* Result Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Result Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Result Type *
                </label>
                <select
                  name="result_type"
                  value={formData.result_type}
                  onChange={handleResultTypeChange}
                  disabled={hasResults}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                >
                  <option value="reps">Repetitions/Count</option>
                  <option value="time">Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scoring Type *
                </label>
                <select
                  name="scoring_type"
                  value={formData.scoring_type}
                  onChange={handleChange}
                  disabled={hasResults}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                >
                  <option value="higher_better">Higher is Better</option>
                  <option value="lower_better">Lower is Better</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Result Unit
                </label>
                <input
                  type="text"
                  name="result_unit"
                  value={formData.result_unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="e.g., reps, seconds, meters"
                />
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {formData.result_type === 'reps' 
                ? 'Participants will submit a number (e.g., 50 reps)'
                : 'Participants will submit a time (e.g., 2:30 or 150 seconds)'}
              {' - '}
              {formData.scoring_type === 'higher_better'
                ? 'Higher values rank better'
                : 'Lower values rank better'}
            </p>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  min={formData.start_date}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Media (Optional)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Challenge Image
                </label>
                <ImageUploadEditor
                  currentImageUrl={formData.image_url}
                  onSave={handleImageUpload}
                  aspectRatio={16 / 9}
                  maxWidth={1200}
                  maxHeight={675}
                />
                {isNew && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Note: Save the challenge first before uploading an image
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  YouTube URLs will be automatically converted to embed format
                </p>
                
                {/* Video Preview */}
                {formData.video_url && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Video Preview:
                    </p>
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={convertToEmbedUrl(formData.video_url)}
                        title="Challenge Video Preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Challenge is active
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Only active challenges within their date range can accept submissions
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : (isNew ? 'Create Challenge' : 'Save Changes')}
          </button>
          <Link
            href="/admin/challenges"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}