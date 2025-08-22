'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, UserCheck, Search, Edit, Trash2, Shield, Mail, Calendar, Activity, PlayCircle, Eye, EyeOff, Lock, Unlock, Trophy, BookOpen, RotateCcw, BarChart } from 'lucide-react'
import VideoViewsTable from '@/components/Admin/VideoViewsTable'

interface User {
  id: number
  email: string
  name: string | null
  isAdmin: boolean
  trainerUnlocked: boolean
  createdAt: string
  lastLogin: string | null
  totalVideoViews: number
  isDeleted: boolean
}

interface Trainer {
  id: number
  slug: string
  name: string
  videosCount: number
  videoViews: number
  createdAt: string
}

interface Video {
  id: number
  title: string
  duration: number
  views: number
  openForFree: boolean
  openForSubscribers: boolean
  hidden: boolean
  createdAt: string
  trainer?: {
    id: number
    name: string
    slug: string
  }
  category?: {
    id: number
    name: string
  }
  user?: {
    id: number
    name: string | null
    email: string
  }
}

interface Challenge {
  id: number
  name: string
  description: string
  path: string
  beginDate: string | null
  endDate: string | null
  challengeVisible: number
  isSubscriptionNeeded: number
  maxTeam: number
  minTeam: number
  user?: {
    id: number
    name: string | null
    email: string
  }
}

interface Program {
  id: number
  title: string
  shortDescription: string
  picture: string | null
  urlSlug: string | null
  status: string
  unitLength: string
  languageId: number
  commentsEnabled: boolean
  feedbackEnabled: boolean
  createdAt: string
  trainer?: {
    id: number
    name: string | null
    email: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'users' | 'trainers' | 'videos' | 'challenges' | 'programs' | 'video-views'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 100,
    totalCount: 0,
    totalPages: 0
  })

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAdmin && activeTab === 'users' && users.length === 0) {
      fetchUsers()
    } else if (isAdmin && activeTab === 'trainers' && trainers.length === 0) {
      fetchTrainers()
    } else if (isAdmin && activeTab === 'videos' && videos.length === 0) {
      fetchVideos()
    } else if (isAdmin && activeTab === 'challenges' && challenges.length === 0) {
      fetchChallenges()
    } else if (isAdmin && activeTab === 'programs' && programs.length === 0) {
      fetchPrograms()
    }
  }, [activeTab, isAdmin])

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.isAdmin) {
          setIsAdmin(true)
        } else {
          router.push('/dashboard')
        }
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to check admin access:', error)
      router.push('/dashboard')
    }
  }

  const fetchUsers = async (search = '', page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      params.append('page', page.toString())
      params.append('limit', '100')
      
      const url = `/api/admin/users?${params.toString()}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setUsersPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainers = async (search = '') => {
    setLoading(true)
    try {
      const url = search ? `/api/admin/trainers?search=${encodeURIComponent(search)}` : '/api/admin/trainers'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTrainers(data)
      }
    } catch (error) {
      console.error('Failed to fetch trainers:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAdmin = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentStatus })
      })
      
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to update admin status:', error)
    }
  }

  const toggleTrainerStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainerUnlocked: !currentStatus ? 1 : 0 })
      })
      
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to update trainer status:', error)
    }
  }

  const handleImpersonate = async (userId: number, userName: string) => {
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Open in new window
        const impersonateWindow = window.open(data.url, '_blank', 'width=1200,height=800')
        
        if (impersonateWindow) {
          // Optional: Show notification
          console.log(`Impersonating user: ${userName}`)
        } else {
          alert('Palun luba hüpikaknad, et kasutajana sisse logida')
        }
      } else {
        const error = await response.json()
        alert(`Viga: ${error.error || 'Failed to impersonate user'}`)
      }
    } catch (error) {
      console.error('Failed to impersonate:', error)
      alert('Kasutajana sisselogimine ebaõnnestus')
    }
  }

  const fetchVideos = async (search = '') => {
    setLoading(true)
    try {
      const url = search ? `/api/admin/videos?search=${encodeURIComponent(search)}` : '/api/admin/videos'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChallenges = async (search = '') => {
    setLoading(true)
    try {
      const url = search ? `/api/admin/challenges?search=${encodeURIComponent(search)}` : '/api/admin/challenges'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setChallenges(data)
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm('Kas oled kindel, et soovid selle kasutaja kustutada?')) return
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const restoreUser = async (userId: number) => {
    if (!confirm('Kas soovid kasutaja taastada?')) return
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restore: true })
      })
      
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to restore user:', error)
    }
  }

  const toggleVideoVisibility = async (videoId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: !currentStatus })
      })
      
      if (response.ok) {
        fetchVideos()
      }
    } catch (error) {
      console.error('Failed to update video visibility:', error)
    }
  }

  const toggleVideoAccess = async (videoId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openForFree: !currentStatus })
      })
      
      if (response.ok) {
        fetchVideos()
      }
    } catch (error) {
      console.error('Failed to update video access:', error)
    }
  }

  const deleteVideo = async (videoId: number) => {
    if (!confirm('Kas oled kindel, et soovid selle video kustutada?')) return
    
    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchVideos()
      }
    } catch (error) {
      console.error('Failed to delete video:', error)
    }
  }

  const toggleChallengeVisibility = async (challengeId: number, currentStatus: number) => {
    try {
      const response = await fetch(`/api/admin/challenges/${challengeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeVisible: currentStatus === 1 ? 0 : 1 })
      })
      
      if (response.ok) {
        fetchChallenges()
      }
    } catch (error) {
      console.error('Failed to update challenge visibility:', error)
    }
  }

  const deleteChallenge = async (challengeId: number) => {
    if (!confirm('Kas oled kindel, et soovid selle väljakutse kustutada?')) return
    
    try {
      const response = await fetch(`/api/admin/challenges/${challengeId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchChallenges()
      }
    } catch (error) {
      console.error('Failed to delete challenge:', error)
    }
  }

  const fetchPrograms = async (search = '') => {
    setLoading(true)
    try {
      const url = search ? `/api/admin/programs?search=${encodeURIComponent(search)}` : '/api/admin/programs'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setPrograms(data)
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProgramStatus = async (programId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'PUBLIC' ? 'DRAFT' : 'PUBLIC'
      const response = await fetch(`/api/admin/programs/${programId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        fetchPrograms()
      }
    } catch (error) {
      console.error('Failed to update program status:', error)
    }
  }

  const deleteProgram = async (programId: number) => {
    if (!confirm('Kas oled kindel, et soovid selle programmi kustutada?')) return
    
    try {
      const response = await fetch(`/api/admin/programs/${programId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchPrograms()
      }
    } catch (error) {
      console.error('Failed to delete program:', error)
    }
  }


  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#2c313a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#2c313a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-5 h-5" />
            Tagasi
          </Link>
          <h1 className="text-3xl font-bold">Admin paneel</h1>
        </div>

        {/* Tabs */}
        <div className="bg-[#3e4551] rounded-lg p-1 mb-6 inline-flex">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-[#40b236] text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Kasutajad
          </button>
          <button
            onClick={() => setActiveTab('trainers')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'trainers'
                ? 'bg-[#40b236] text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <UserCheck className="w-5 h-5 inline mr-2" />
            Treenerid
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'videos'
                ? 'bg-[#40b236] text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <PlayCircle className="w-5 h-5 inline mr-2" />
            Videod
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'challenges'
                ? 'bg-[#40b236] text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Trophy className="w-5 h-5 inline mr-2" />
            Väljakutsed
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'programs'
                ? 'bg-[#40b236] text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            Programmid
          </button>
          <button
            onClick={() => setActiveTab('video-views')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'video-views'
                ? 'bg-[#40b236] text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Eye className="w-5 h-5 inline mr-2" />
            Vaatamised
          </button>
        </div>

        {/* Search */}
        {activeTab !== 'video-views' && (
        <div className="bg-[#3e4551] rounded-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={
                activeTab === 'users' ? 'Otsi kasutajaid...' : 
                activeTab === 'trainers' ? 'Otsi treenereid...' :
                activeTab === 'videos' ? 'Otsi videoid...' :
                activeTab === 'challenges' ? 'Otsi väljakutseid...' :
                activeTab === 'programs' ? 'Otsi programme...' :
                'Otsi vaatamisi...'
              }
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value
                setSearchTerm(value)
                
                // Clear previous timeout
                if (searchTimeout) {
                  clearTimeout(searchTimeout)
                }
                
                // Set new timeout for search
                const timeout = setTimeout(() => {
                  if (activeTab === 'users') {
                    fetchUsers(value)
                  } else if (activeTab === 'trainers') {
                    fetchTrainers(value)
                  } else if (activeTab === 'videos') {
                    fetchVideos(value)
                  } else if (activeTab === 'challenges') {
                    fetchChallenges(value)
                  } else if (activeTab === 'programs') {
                    fetchPrograms(value)
                  }
                }, 300) // 300ms debounce
                
                setSearchTimeout(timeout)
              }}
              className="w-full bg-[#2c313a] text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40b236]"
            />
          </div>
        </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
          </div>
        ) : (
          <>
            {activeTab === 'users' ? (
              <div className="bg-[#3e4551] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#2c313a]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nimi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Roll</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Liitus</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Viimati aktiivne</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vaatamisi</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Tegevused</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#4d5665]">
                      {users.map((user) => (
                        <tr key={user.id} className={`hover:bg-[#4d5665] transition-colors ${user.isDeleted ? 'bg-red-900/20' : ''}`}>
                          <td className="px-4 py-3 text-sm">{user.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">{user.name || '-'}</td>
                          <td className="px-4 py-3 text-sm">{user.email}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              {user.isDeleted && (
                                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Kustutatud</span>
                              )}
                              {!user.isDeleted && user.isAdmin && (
                                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">Admin</span>
                              )}
                              {!user.isDeleted && user.trainerUnlocked && (
                                <span className="px-2 py-1 bg-[#40b236] text-white text-xs rounded">Treener</span>
                              )}
                              {!user.isDeleted && !user.isAdmin && !user.trainerUnlocked && (
                                <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Kasutaja</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString('et-EE')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('et-EE') : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">{user.totalVideoViews}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex justify-end gap-2">
                              {user.isDeleted ? (
                                // Show restore button for deleted users
                                <button
                                  onClick={() => restoreUser(user.id)}
                                  className="p-1 rounded bg-green-500 hover:opacity-80"
                                  title="Taasta kasutaja"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              ) : (
                                // Show normal actions for active users
                                <>
                                  <button
                                    onClick={() => toggleAdmin(user.id, user.isAdmin)}
                                    className={`p-1 rounded ${user.isAdmin ? 'bg-red-500' : 'bg-gray-600'} hover:opacity-80`}
                                    title={user.isAdmin ? 'Eemalda admin' : 'Tee adminiks'}
                                  >
                                    <Shield className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => toggleTrainerStatus(user.id, user.trainerUnlocked)}
                                    className={`p-1 rounded ${user.trainerUnlocked ? 'bg-[#40b236]' : 'bg-gray-600'} hover:opacity-80`}
                                    title={user.trainerUnlocked ? 'Eemalda treeneri õigused' : 'Lisa treeneri õigused'}
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                  <Link
                                    href={`/profile/${user.name?.toLowerCase().replace(/\s+/g, '') || user.id}`}
                                    className="p-1 rounded bg-blue-500 hover:opacity-80"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                  {user.id !== 73 && (
                                    <button
                                      onClick={() => deleteUser(user.id)}
                                      className="p-1 rounded bg-red-500 hover:opacity-80"
                                      title="Kustuta kasutaja"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  {!user.isAdmin && (
                                    <button
                                      onClick={() => handleImpersonate(user.id, user.name || user.email)}
                                      className="p-1 rounded bg-purple-500 hover:opacity-80"
                                      title="Logi sisse selle kasutajana"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                      </svg>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {usersPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-[#2c313a]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        Näitan {((usersPagination.page - 1) * usersPagination.limit) + 1} - {Math.min(usersPagination.page * usersPagination.limit, usersPagination.totalCount)} kasutajat {usersPagination.totalCount}-st
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newPage = Math.max(1, usersPagination.page - 1)
                          setUsersPagination(prev => ({ ...prev, page: newPage }))
                          fetchUsers(searchTerm, newPage)
                        }}
                        disabled={usersPagination.page === 1}
                        className="px-3 py-1 rounded bg-[#3e4551] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4d5665]"
                      >
                        Eelmine
                      </button>
                      
                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, usersPagination.totalPages) }, (_, i) => {
                          let pageNum
                          if (usersPagination.totalPages <= 5) {
                            pageNum = i + 1
                          } else if (usersPagination.page <= 3) {
                            pageNum = i + 1
                          } else if (usersPagination.page >= usersPagination.totalPages - 2) {
                            pageNum = usersPagination.totalPages - 4 + i
                          } else {
                            pageNum = usersPagination.page - 2 + i
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => {
                                setUsersPagination(prev => ({ ...prev, page: pageNum }))
                                fetchUsers(searchTerm, pageNum)
                              }}
                              className={`px-3 py-1 rounded ${
                                pageNum === usersPagination.page
                                  ? 'bg-[#40b236] text-white'
                                  : 'bg-[#3e4551] text-white hover:bg-[#4d5665]'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>
                      
                      <button
                        onClick={() => {
                          const newPage = Math.min(usersPagination.totalPages, usersPagination.page + 1)
                          setUsersPagination(prev => ({ ...prev, page: newPage }))
                          fetchUsers(searchTerm, newPage)
                        }}
                        disabled={usersPagination.page === usersPagination.totalPages}
                        className="px-3 py-1 rounded bg-[#3e4551] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4d5665]"
                      >
                        Järgmine
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'trainers' ? (
              <div className="bg-[#3e4551] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#2c313a]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nimi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Slug</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Videod</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vaatamisi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Liitus</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Tegevused</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#4d5665]">
                      {trainers.map((trainer) => (
                        <tr key={trainer.id} className="hover:bg-[#4d5665] transition-colors">
                          <td className="px-4 py-3 text-sm">{trainer.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">{trainer.name}</td>
                          <td className="px-4 py-3 text-sm">{trainer.slug}</td>
                          <td className="px-4 py-3 text-sm">{trainer.videosCount}</td>
                          <td className="px-4 py-3 text-sm">{trainer.videoViews}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {new Date(trainer.createdAt).toLocaleDateString('et-EE')}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/profile/${trainer.slug}`}
                                className="p-1 rounded bg-blue-500 hover:opacity-80"
                                title="Vaata profiili"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'videos' ? (
              <div className="bg-[#3e4551] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#2c313a]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pealkiri</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Treener</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Kategooria</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Kestus</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vaatamisi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Staatus</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Tegevused</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#4d5665]">
                      {videos.map((video) => (
                        <tr key={video.id} className="hover:bg-[#4d5665] transition-colors">
                          <td className="px-4 py-3 text-sm">{video.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <div className="max-w-xs truncate" title={video.title}>
                              {video.title}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {video.trainer ? (
                              <Link 
                                href={`/profile/${video.trainer.slug}`}
                                className="text-[#40b236] hover:underline"
                              >
                                {video.trainer.name}
                              </Link>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">{video.category?.name || '-'}</td>
                          <td className="px-4 py-3 text-sm">{formatDuration(video.duration)}</td>
                          <td className="px-4 py-3 text-sm">{video.views || 0}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              {video.openForFree && (
                                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Tasuta</span>
                              )}
                              {video.openForSubscribers && !video.openForFree && (
                                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">Tellimus</span>
                              )}
                              {video.hidden && (
                                <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Peidetud</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => toggleVideoVisibility(video.id, video.hidden)}
                                className={`p-1 rounded ${video.hidden ? 'bg-gray-600' : 'bg-green-500'} hover:opacity-80`}
                                title={video.hidden ? 'N\u00e4ita video' : 'Peida video'}
                              >
                                {video.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => toggleVideoAccess(video.id, video.openForFree)}
                                className={`p-1 rounded ${video.openForFree ? 'bg-green-500' : 'bg-gray-600'} hover:opacity-80`}
                                title={video.openForFree ? 'Muuda tasuliseks' : 'Muuda tasuta'}
                              >
                                {video.openForFree ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                              <Link
                                href={`/videos/${video.id}`}
                                className="p-1 rounded bg-blue-500 hover:opacity-80"
                                title="Vaata videot"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => deleteVideo(video.id)}
                                className="p-1 rounded bg-red-500 hover:opacity-80"
                                title="Kustuta video"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'challenges' ? (
              <div className="bg-[#3e4551] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#2c313a]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nimi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Algus</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Lõpp</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Meeskond</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Staatus</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Tegevused</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#4d5665]">
                      {challenges.map((challenge) => (
                        <tr key={challenge.id} className="hover:bg-[#4d5665] transition-colors">
                          <td className="px-4 py-3 text-sm">{challenge.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <div className="max-w-xs truncate" title={challenge.name || ''}>
                              {challenge.name || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {challenge.beginDate ? new Date(challenge.beginDate).toLocaleDateString('et-EE') : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {challenge.endDate ? new Date(challenge.endDate).toLocaleDateString('et-EE') : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {challenge.minTeam}-{challenge.maxTeam}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              {challenge.isSubscriptionNeeded === 1 && (
                                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">Tellimus</span>
                              )}
                              {challenge.challengeVisible === 0 && (
                                <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Peidetud</span>
                              )}
                              {challenge.challengeVisible === 1 && challenge.isSubscriptionNeeded === 0 && (
                                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Avalik</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => toggleChallengeVisibility(challenge.id, challenge.challengeVisible)}
                                className={`p-1 rounded ${challenge.challengeVisible === 1 ? 'bg-green-500' : 'bg-gray-600'} hover:opacity-80`}
                                title={challenge.challengeVisible === 1 ? 'Peida väljakutse' : 'Näita väljakutset'}
                              >
                                {challenge.challengeVisible === 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <Link
                                href={`/challenges/${challenge.path || challenge.id}`}
                                className="p-1 rounded bg-blue-500 hover:opacity-80"
                                title="Vaata väljakutset"
                              >
                                <Trophy className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => deleteChallenge(challenge.id)}
                                className="p-1 rounded bg-red-500 hover:opacity-80"
                                title="Kustuta väljakutse"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'programs' ? (
              <div className="bg-[#3e4551] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#2c313a]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pealkiri</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Treener</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Keel</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Ühik</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Staatus</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Tegevused</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#4d5665]">
                      {programs.map((program) => (
                        <tr key={program.id} className="hover:bg-[#4d5665] transition-colors">
                          <td className="px-4 py-3 text-sm">{program.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <div className="max-w-xs truncate" title={program.title}>
                              {program.title}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {program.trainer?.name || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {program.languageId === 1 ? 'EN' : 'ET'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {program.unitLength === 'DAY' ? 'Päev' : 'Nädal'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              {program.status === 'PUBLIC' && (
                                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Avalik</span>
                              )}
                              {program.status === 'DRAFT' && (
                                <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Mustand</span>
                              )}
                              {program.status === 'PRIVATE' && (
                                <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">Privaatne</span>
                              )}
                              {program.status === 'LIMITED_ACCESS' && (
                                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">Piiratud</span>
                              )}
                              {program.commentsEnabled && (
                                <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded">💬</span>
                              )}
                              {program.feedbackEnabled && (
                                <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded">⭐</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => toggleProgramStatus(program.id, program.status)}
                                className={`p-1 rounded ${program.status === 'PUBLIC' ? 'bg-green-500' : 'bg-gray-600'} hover:opacity-80`}
                                title={program.status === 'PUBLIC' ? 'Muuda mitteavalikuks' : 'Muuda avalikuks'}
                              >
                                {program.status === 'PUBLIC' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <Link
                                href={`/programs/${program.urlSlug || program.id}`}
                                className="p-1 rounded bg-blue-500 hover:opacity-80"
                                title="Vaata programmi"
                              >
                                <BookOpen className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => deleteProgram(program.id)}
                                className="p-1 rounded bg-red-500 hover:opacity-80"
                                title="Kustuta programm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
            
            {/* Video Views Tab */}
            {activeTab === 'video-views' && (
              <VideoViewsTable />
            )}
          </>
        )}
      </div>
    </div>
  )
}