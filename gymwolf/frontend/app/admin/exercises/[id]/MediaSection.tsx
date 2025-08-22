'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Save, X, Plus, Trash2, Video, Image, Upload } from 'lucide-react';
import api from '@/lib/api';

interface MediaSectionProps {
  exercise: any;
  exerciseId: string;
  onUpdate: () => void;
}

export default function MediaSection({ exercise, exerciseId, onUpdate }: MediaSectionProps) {
  const [mediaTab, setMediaTab] = useState<'images' | 'video'>('images');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editingVideo, setEditingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(exercise.video_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveVideoUrl = async () => {
    setIsSaving(true);
    try {
      const response = await api.put(`/admin/exercises/${exerciseId}`, {
        video_url: videoUrl
      });
      if (response.data.success) {
        onUpdate();
        setEditingVideo(false);
      }
    } catch (error) {
      console.error('Error updating video URL:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getImages = () => {
    try {
      if (typeof exercise.image_url === 'string' && exercise.image_url.startsWith('[')) {
        return JSON.parse(exercise.image_url);
      }
      return exercise.image_url ? [exercise.image_url] : [];
    } catch (e) {
      return exercise.image_url ? [exercise.image_url] : [];
    }
  };

  const images = getImages();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isImage && isValidSize;
    });
    
    // Limit to 4 images total
    const remainingSlots = 4 - images.length;
    setSelectedFiles(validFiles.slice(0, remainingSlots));
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    
    selectedFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    
    try {
      const response = await api.post(`/admin/exercises/${exerciseId}/upload-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        onUpdate();
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (position: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const response = await api.delete(`/admin/exercises/${exerciseId}/delete-image`, {
        data: { position }
      });
      
      if (response.data.success) {
        onUpdate();
        setCurrentImageIndex(0);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Media</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setMediaTab('images')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mediaTab === 'images'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Image className="h-4 w-4 inline mr-2" />
              Images ({images.length}/4)
            </button>
            <button
              onClick={() => setMediaTab('video')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mediaTab === 'video'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Video className="h-4 w-4 inline mr-2" />
              Video URL
            </button>
          </div>
        </div>

        {mediaTab === 'images' ? (
          <div>
            {/* Image Upload Section */}
            {images.length < 4 && (
              <div className="mb-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFiles.length > 0 ? (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selected files ({selectedFiles.length}):
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedFiles.map((file, index) => (
                          <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={uploadImages}
                        disabled={isUploading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Images'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFiles([]);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 text-center"
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload images (max {4 - images.length} more)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      JPG, PNG or GIF up to 5MB each
                    </p>
                  </button>
                )}
              </div>
            )}

            {/* Image Display */}
            {images.length > 0 ? (
              <div>
                {images.length > 1 ? (
                  <div className="relative">
                    <div className="flex justify-center items-center">
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                        className="absolute left-4 z-10 p-2 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                      </button>
                      
                      <div className="text-center">
                        <img 
                          src={`http://localhost:8001${images[currentImageIndex]}`}
                          alt={`Position ${currentImageIndex + 1}`}
                          className="max-w-full h-auto rounded-lg mx-auto"
                          style={{ maxHeight: '400px' }}
                        />
                        <div className="mt-4">
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            Position {currentImageIndex + 1} of {images.length}
                          </p>
                          <button
                            onClick={() => deleteImage(currentImageIndex)}
                            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            <Trash2 className="h-3 w-3 inline mr-1" />
                            Delete This Image
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                        className="absolute right-4 z-10 p-2 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>
                    
                    <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      {images.map((img: string, index: number) => (
                        <div key={index} className="relative">
                          <button
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative rounded-lg overflow-hidden transition-all ${
                              index === currentImageIndex 
                                ? 'ring-2 ring-blue-600 scale-105' 
                                : 'opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img 
                              src={`http://localhost:8001${img}`}
                              alt={`Position ${index + 1}`}
                              className="w-24 h-24 object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 text-center">
                              Position {index + 1}
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <img 
                      src={`http://localhost:8001${images[0]}`}
                      alt={exercise.name}
                      className="max-w-full h-auto rounded-lg mx-auto"
                      style={{ maxHeight: '400px' }}
                    />
                    <button
                      onClick={() => deleteImage(0)}
                      className="mt-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      <Trash2 className="h-3 w-3 inline mr-1" />
                      Delete Image
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No images uploaded yet</p>
                <p className="text-sm mt-2">Use the upload area above to add images</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {editingVideo ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video URL (YouTube, Vimeo, etc.)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveVideoUrl}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingVideo(false);
                      setVideoUrl(exercise.video_url || '');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 inline mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {exercise.video_url ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Video URL:</p>
                      <a 
                        href={exercise.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {exercise.video_url}
                      </a>
                    </div>
                    <button
                      onClick={() => {
                        setEditingVideo(true);
                        setVideoUrl(exercise.video_url);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 className="h-4 w-4 inline mr-2" />
                      Edit Video URL
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No video URL set</p>
                    <button
                      onClick={() => setEditingVideo(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 inline mr-2" />
                      Add Video URL
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}