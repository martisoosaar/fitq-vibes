'use client'

import { useState, useRef, useEffect } from 'react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { X, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'

interface ImageCropModalProps {
  imageUrl: string
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
}

export default function ImageCropModal({ imageUrl, onCropComplete, onCancel }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 25,
    y: 25,
    width: 50,
    height: 50
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Generate cropped image
  const getCroppedImg = async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Set canvas size to desired crop size
    canvas.width = completedCrop.width
    canvas.height = completedCrop.height

    // Draw cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    )

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob)
        },
        'image/jpeg',
        0.95
      )
    })
  }

  const handleCropComplete = async () => {
    const croppedBlob = await getCroppedImg()
    if (croppedBlob) {
      onCropComplete(croppedBlob)
    }
  }

  const handleRotate = () => {
    setRotate((prev) => (prev + 90) % 360)
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
  }

  // Update preview whenever crop changes
  useEffect(() => {
    if (!imgRef.current || !previewCanvasRef.current || !completedCrop) return

    const image = imgRef.current
    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Set canvas size to 200x200 for preview
    canvas.width = 200
    canvas.height = 200

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw cropped image scaled to fit preview
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      200,
      200
    )

    ctx.restore()
  }, [completedCrop])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-[#2c313a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#3e4551] px-6 py-4 flex items-center justify-between border-b border-[#4d5665]">
          <h2 className="text-xl font-semibold text-white">Lõika profiilipilti</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Crop Area */}
            <div>
              <div className="bg-[#1a1e24] rounded-lg p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Vali piirkond</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleZoomOut}
                      className="p-2 bg-[#3e4551] hover:bg-[#4d5665] rounded transition-colors"
                      title="Vähenda"
                    >
                      <ZoomOut className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 bg-[#3e4551] hover:bg-[#4d5665] rounded transition-colors"
                      title="Suurenda"
                    >
                      <ZoomIn className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={handleRotate}
                      className="p-2 bg-[#3e4551] hover:bg-[#4d5665] rounded transition-colors"
                      title="Pööra 90°"
                    >
                      <RotateCw className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div className="relative overflow-auto max-h-[400px]" style={{ touchAction: 'none' }}>
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop
                  >
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt="Crop"
                      style={{
                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                      onLoad={(e) => {
                        const { width, height } = e.currentTarget
                        const aspectRatio = width / height
                        const size = Math.min(width, height) * 0.8
                        const x = (width - size) / 2 / width * 100
                        const y = (height - size) / 2 / height * 100
                        const cropSize = size / width * 100
                        
                        setCrop({
                          unit: '%',
                          x,
                          y,
                          width: cropSize,
                          height: cropSize / aspectRatio
                        })
                      }}
                    />
                  </ReactCrop>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <div className="bg-[#1a1e24] rounded-lg p-4">
                <div className="mb-4">
                  <span className="text-sm text-gray-400">Eelvaade</span>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <canvas
                      ref={previewCanvasRef}
                      className="rounded-full border-4 border-[#40b236]"
                      style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 text-center">
                    See on see, kuidas sinu profiilipilt näeb välja
                  </p>
                </div>
              </div>

              {/* Preset Aspects */}
              <div className="mt-4 bg-[#1a1e24] rounded-lg p-4">
                <div className="mb-3">
                  <span className="text-sm text-gray-400">Kiirvalikud</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setCrop({
                        unit: '%',
                        x: 25,
                        y: 25,
                        width: 50,
                        height: 50
                      })
                    }}
                    className="px-3 py-2 bg-[#3e4551] hover:bg-[#4d5665] rounded text-sm transition-colors"
                  >
                    1:1
                  </button>
                  <button
                    onClick={() => {
                      setCrop({
                        unit: '%',
                        x: 10,
                        y: 10,
                        width: 80,
                        height: 80
                      })
                    }}
                    className="px-3 py-2 bg-[#3e4551] hover:bg-[#4d5665] rounded text-sm transition-colors"
                  >
                    Suur
                  </button>
                  <button
                    onClick={() => {
                      setCrop({
                        unit: '%',
                        x: 35,
                        y: 35,
                        width: 30,
                        height: 30
                      })
                    }}
                    className="px-3 py-2 bg-[#3e4551] hover:bg-[#4d5665] rounded text-sm transition-colors"
                  >
                    Väike
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#3e4551] px-6 py-4 flex items-center justify-end gap-3 border-t border-[#4d5665]">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[#2c313a] hover:bg-[#4d5665] text-white rounded-lg transition-colors"
          >
            Tühista
          </button>
          <button
            onClick={handleCropComplete}
            className="px-4 py-2 bg-[#40b236] hover:bg-[#60cc56] text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Salvesta
          </button>
        </div>
      </div>
    </div>
  )
}