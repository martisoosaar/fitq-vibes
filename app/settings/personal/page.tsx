'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Camera, User } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the crop modal to avoid SSR issues
const ImageCropModal = dynamic(() => import('@/components/ImageCropModal'), {
  ssr: false
})

interface PersonalInfo {
  name: string
  email: string
  birthDay: string
  birthMonth: string
  birthYear: string
  sex: string
  height: string
  weight: string
  avatar?: string
}

export default function PersonalSettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<PersonalInfo>({
    name: '',
    email: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    sex: '',
    height: '',
    weight: ''
  })
  const [errors, setErrors] = useState<Partial<PersonalInfo>>({})
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [showCropModal, setShowCropModal] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null)
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchUserData()
    }
  }, [user, authLoading])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      
      if (response.ok) {
        const data = await response.json()
        
        // Parse birthday if it exists
        let birthDay = ''
        let birthMonth = ''
        let birthYear = ''
        if (data.birthday) {
          const date = new Date(data.birthday)
          birthDay = date.getDate().toString()
          birthMonth = (date.getMonth() + 1).toString().padStart(2, '0')
          birthYear = date.getFullYear().toString()
        }
        
        setFormData({
          name: data.name || '',
          email: data.email || '',
          birthDay,
          birthMonth,
          birthYear,
          sex: data.sex || '',
          height: data.height?.toString() || '',
          weight: data.weight?.toString() || '',
          avatar: data.avatar
        })
      } else {
        console.error('Failed to fetch profile, status:', response.status)
        const errorText = await response.text()
        console.error('Error:', errorText)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
    setSuccess(false)
  }

  const validateForm = () => {
    const newErrors: Partial<PersonalInfo> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nimi on kohustuslik'
    }
    
    if (formData.birthDay && (parseInt(formData.birthDay) < 1 || parseInt(formData.birthDay) > 31)) {
      newErrors.birthDay = 'Vigane päev'
    }
    
    if (formData.birthMonth && (parseInt(formData.birthMonth) < 1 || parseInt(formData.birthMonth) > 12)) {
      newErrors.birthMonth = 'Vigane kuu'
    }
    
    if (formData.birthYear && (parseInt(formData.birthYear) < 1900 || parseInt(formData.birthYear) > new Date().getFullYear())) {
      newErrors.birthYear = 'Vigane aasta'
    }
    
    if (formData.height && (parseInt(formData.height) < 50 || parseInt(formData.height) > 300)) {
      newErrors.height = 'Vigane pikkus'
    }
    
    if (formData.weight && (parseInt(formData.weight) < 20 || parseInt(formData.weight) > 500)) {
      newErrors.weight = 'Vigane kaal'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const formDataToSend = new FormData()
      
      formDataToSend.append('name', formData.name)
      formDataToSend.append('sex', formData.sex || '')
      formDataToSend.append('height', formData.height || '')
      formDataToSend.append('weight', formData.weight || '')
      
      // Combine birthday parts
      if (formData.birthDay && formData.birthMonth && formData.birthYear) {
        const birthday = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`
        formDataToSend.append('birthday', birthday)
      }
      
      // Add cropped avatar if there's one
      if (croppedImageBlob) {
        formDataToSend.append('avatar', croppedImageBlob, 'avatar.jpg')
      }
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formDataToSend
      })
      
      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        // Reload data to show updated avatar
        await fetchUserData()
      } else {
        console.error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        setTempImageUrl(imageUrl)
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (blob: Blob) => {
    setCroppedImageBlob(blob)
    // Create preview URL from blob
    const url = URL.createObjectURL(blob)
    setFormData(prev => ({ ...prev, avatar: url }))
    setShowCropModal(false)
    setTempImageUrl(null)
  }

  const handleCropCancel = () => {
    setShowCropModal(false)
    setTempImageUrl(null)
    // Reset file input
    const avatarInput = document.getElementById('avatar-upload') as HTMLInputElement
    if (avatarInput) {
      avatarInput.value = ''
    }
  }

  if (loading || authLoading) {
    return (
      <div className="bg-[#3e4551] rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#3e4551] rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Isiklikud andmed</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#4d5665] overflow-hidden">
              {formData.avatar ? (
                <img 
                  src={formData.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-[#40b236] rounded-full cursor-pointer hover:bg-[#60cc56] transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input 
                id="avatar-upload"
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="font-semibold">{formData.name || 'Kasutaja'}</p>
            <p className="text-sm text-gray-400">Muuda profiilipilti</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Nimi *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 bg-[#2c313a] border rounded-lg focus:outline-none focus:border-[#40b236] transition-colors ${
              errors.name ? 'border-red-500' : 'border-[#4d5665]'
            }`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            readOnly
            className="w-full px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">E-maili muutmiseks võta ühendust toega</p>
        </div>

        {/* Birth Date */}
        <fieldset>
          <legend className="block text-sm font-medium mb-2">Sünnipäev</legend>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <input
                name="birthDay"
                type="text"
                placeholder="Päev"
                maxLength={2}
                value={formData.birthDay}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 bg-[#2c313a] border rounded-lg focus:outline-none focus:border-[#40b236] transition-colors ${
                  errors.birthDay ? 'border-red-500' : 'border-[#4d5665]'
                }`}
              />
              {errors.birthDay && <p className="text-red-500 text-xs mt-1">{errors.birthDay}</p>}
            </div>
            <div>
              <input
                name="birthMonth"
                type="text"
                placeholder="Kuu"
                maxLength={2}
                value={formData.birthMonth}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 bg-[#2c313a] border rounded-lg focus:outline-none focus:border-[#40b236] transition-colors ${
                  errors.birthMonth ? 'border-red-500' : 'border-[#4d5665]'
                }`}
              />
              {errors.birthMonth && <p className="text-red-500 text-xs mt-1">{errors.birthMonth}</p>}
            </div>
            <div>
              <input
                name="birthYear"
                type="text"
                placeholder="Aasta"
                maxLength={4}
                value={formData.birthYear}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 bg-[#2c313a] border rounded-lg focus:outline-none focus:border-[#40b236] transition-colors ${
                  errors.birthYear ? 'border-red-500' : 'border-[#4d5665]'
                }`}
              />
              {errors.birthYear && <p className="text-red-500 text-xs mt-1">{errors.birthYear}</p>}
            </div>
          </div>
        </fieldset>

        {/* Sex, Height and Weight */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="sex" className="block text-sm font-medium mb-2">
              Sugu
            </label>
            <select
              id="sex"
              name="sex"
              value={formData.sex}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg focus:outline-none focus:border-[#40b236] transition-colors"
            >
              <option value="">Vali</option>
              <option value="male">Mees</option>
              <option value="female">Naine</option>
              <option value="other">Muu</option>
            </select>
          </div>
          <div>
            <label htmlFor="height" className="block text-sm font-medium mb-2">
              Pikkus (cm)
            </label>
            <input
              id="height"
              name="height"
              type="text"
              maxLength={3}
              value={formData.height}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-[#2c313a] border rounded-lg focus:outline-none focus:border-[#40b236] transition-colors ${
                errors.height ? 'border-red-500' : 'border-[#4d5665]'
              }`}
            />
            {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
          </div>
          <div>
            <label htmlFor="weight" className="block text-sm font-medium mb-2">
              Kaal (kg)
            </label>
            <input
              id="weight"
              name="weight"
              type="text"
              maxLength={3}
              value={formData.weight}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-[#2c313a] border rounded-lg focus:outline-none focus:border-[#40b236] transition-colors ${
                errors.weight ? 'border-red-500' : 'border-[#4d5665]'
              }`}
            />
            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
            Andmed salvestatud!
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-[#40b236] hover:bg-[#60cc56] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {loading ? 'Salvestamine...' : 'Salvesta'}
        </button>
      </form>

      {/* Image Crop Modal */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}