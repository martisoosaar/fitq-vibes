'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Upload, Crop as CropIcon, RotateCw, FlipHorizontal, Save, X, Loader2 } from 'lucide-react';

interface ImageUploadEditorProps {
  currentImageUrl?: string;
  onSave: (file: File) => Promise<void>;
  aspectRatio?: number; // e.g., 16/9, 1 for square
  maxWidth?: number;
  maxHeight?: number;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function ImageUploadEditor({
  currentImageUrl,
  onSave,
  aspectRatio = 16 / 9,
  maxWidth = 1200,
  maxHeight = 800,
}: ImageUploadEditorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }, [aspectRatio]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlip = () => {
    setFlipH((prev) => !prev);
  };

  const getCroppedImg = async (): Promise<File | null> => {
    if (!completedCrop || !canvasRef.current || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to desired output size
    let outputWidth = completedCrop.width * scaleX;
    let outputHeight = completedCrop.height * scaleY;

    // Limit to max dimensions
    if (outputWidth > maxWidth) {
      const scale = maxWidth / outputWidth;
      outputWidth = maxWidth;
      outputHeight = outputHeight * scale;
    }
    if (outputHeight > maxHeight) {
      const scale = maxHeight / outputHeight;
      outputHeight = maxHeight;
      outputWidth = outputWidth * scale;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.imageSmoothingQuality = 'high';

    // Apply transformations
    ctx.save();
    
    // Handle rotation and flip
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw the cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputWidth,
      outputHeight
    );

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], selectedFile?.name || 'image.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(file);
          } else {
            resolve(null);
          }
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const croppedFile = await getCroppedImg();
      if (croppedFile) {
        await onSave(croppedFile);
        setIsEditing(false);
        setSelectedFile(null);
        setPreviewUrl('');
        setCrop(undefined);
        setRotation(0);
        setFlipH(false);
      }
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setCrop(undefined);
    setRotation(0);
    setFlipH(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {!isEditing ? (
        <div className="space-y-4">
          {/* Current Image Preview */}
          {currentImageUrl && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={currentImageUrl}
                alt="Current challenge"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Current Image
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-5 w-5" />
              {currentImageUrl ? 'Change Image' : 'Upload Image'}
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Image
                </h3>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Editor Tools */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  Rotate
                </button>
                <button
                  type="button"
                  onClick={handleFlip}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <FlipHorizontal className="h-4 w-4" />
                  Flip
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <CropIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Drag to crop
                  </span>
                </div>
              </div>
            </div>

            {/* Image Editor */}
            <div className="p-4">
              <div className="max-w-full overflow-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                >
                  <img
                    ref={imgRef}
                    alt="Crop preview"
                    src={previewUrl}
                    onLoad={onImageLoad}
                    style={{
                      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                </ReactCrop>
              </div>
            </div>

            {/* Hidden canvas for processing */}
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Image
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}