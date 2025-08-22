'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Camera, Save, User } from 'lucide-react'

interface UserProfile {
  id: number
  email: string
  name: string
  avatar?: string
  profileDesc?: string
  birthday?: string
  sex?: string
  height?: number
  weight?: number
  country?: string
  timezone?: string
  weeklyNews: boolean
  monthlyNews: boolean
}

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchProfile()
    }
  }, [user, authLoading])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const token = localStorage.getItem('accessToken')
      const formData = new FormData()
      
      if (profile) {
        formData.append('name', profile.name)
        formData.append('profileDesc', profile.profileDesc || '')
        formData.append('birthday', profile.birthday || '')
        formData.append('sex', profile.sex || '')
        formData.append('height', profile.height?.toString() || '')
        formData.append('weight', profile.weight?.toString() || '')
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData
      })

      if (response.ok) {
        setMessage('Profiil uuendatud!')
        setTimeout(() => setMessage(''), 3000)
        if (avatarFile) {
          setAvatarFile(null)
          await fetchProfile()
        }
      } else {
        setMessage('Profiili uuendamine ebaõnnestus')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage('Profiili uuendamine ebaõnnestus')
    } finally {
      setSaving(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#2c313a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#2c313a] flex items-center justify-center">
        <p className="text-white">Profiili laadimine ebaõnnestus</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#2c313a] text-white pb-12">
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <h1 className="text-3xl font-bold mb-8">Seaded</h1>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[#4d5665]">
          <Link 
            href="/settings"
            className="pb-3 px-1 border-b-2 border-[#40b236] text-[#40b236] font-medium"
          >
            Profiil
          </Link>
          <Link 
            href="/settings/payment"
            className="pb-3 px-1 border-b-2 border-transparent hover:text-[#40b236] transition-colors"
          >
            Maksevahendid
          </Link>
          <Link 
            href="/settings/subscription"
            className="pb-3 px-1 border-b-2 border-transparent hover:text-[#40b236] transition-colors"
          >
            Tellimus
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-[#3e4551] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#40b236]" />
              Profiilipilt
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#4d5665] overflow-hidden">
                  {avatarPreview || profile.avatar ? (
                    <img 
                      src={avatarPreview || profile.avatar} 
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-[#40b236] rounded-full p-2 cursor-pointer hover:bg-[#60cc56] transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-sm text-gray-400">
                <p>Lae üles uus pilt</p>
                <p>JPG, PNG või GIF. Max 5MB.</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-[#3e4551] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#40b236]" />
              Isikuandmed
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nimi</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full px-4 py-2 bg-[#2c313a] rounded-lg border border-[#4d5665] focus:outline-none focus:border-[#40b236]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 bg-[#2c313a] rounded-lg border border-[#4d5665] opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sünnipäev</label>
                <input
                  type="date"
                  value={profile.birthday?.split('T')[0] || ''}
                  onChange={(e) => setProfile({...profile, birthday: e.target.value})}
                  className="w-full px-4 py-2 bg-[#2c313a] rounded-lg border border-[#4d5665] focus:outline-none focus:border-[#40b236]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sugu</label>
                <select
                  value={profile.sex || ''}
                  onChange={(e) => setProfile({...profile, sex: e.target.value})}
                  className="w-full px-4 py-2 bg-[#2c313a] rounded-lg border border-[#4d5665] focus:outline-none focus:border-[#40b236]"
                >
                  <option value="">Vali sugu</option>
                  <option value="male">Mees</option>
                  <option value="female">Naine</option>
                  <option value="other">Muu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pikkus (cm)</label>
                <input
                  type="number"
                  value={profile.height || ''}
                  onChange={(e) => setProfile({...profile, height: parseInt(e.target.value) || undefined})}
                  className="w-full px-4 py-2 bg-[#2c313a] rounded-lg border border-[#4d5665] focus:outline-none focus:border-[#40b236]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kaal (kg)</label>
                <input
                  type="number"
                  value={profile.weight || ''}
                  onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value) || undefined})}
                  className="w-full px-4 py-2 bg-[#2c313a] rounded-lg border border-[#4d5665] focus:outline-none focus:border-[#40b236]"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Kirjeldus</label>
              <textarea
                value={profile.profileDesc || ''}
                onChange={(e) => setProfile({...profile, profileDesc: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 bg-[#2c313a] rounded-lg border border-[#4d5665] focus:outline-none focus:border-[#40b236] resize-none"
                placeholder="Räägi endast..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            {message && (
              <p className={`text-sm ${message.includes('ebaõnnestus') ? 'text-red-500' : 'text-green-500'}`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto px-6 py-3 bg-[#40b236] hover:bg-[#60cc56] disabled:bg-gray-600 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Salvestamine...' : 'Salvesta muudatused'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}