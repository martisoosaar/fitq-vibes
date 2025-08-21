'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Star, Users, Award, Calendar, MapPin, 
  Mail, Phone, Globe, Facebook, Instagram, Youtube,
  Play, Lock, Clock, CheckCircle, MessageCircle,
  TrendingUp, Target, Activity, Heart, Twitter
} from 'lucide-react'
import { FaTiktok } from 'react-icons/fa'

interface UserProfile {
  id: string
  username: string
  name: string
  avatar: string
  bio: string
  location?: {
    name: string
    code: string
  }
  email?: string
  phone?: string
  website?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    youtube?: string
    tiktok?: string
    twitter?: string
  }
  isTrainer: boolean
  isVerified: boolean
  joinedDate: string
  stats: {
    totalWorkouts?: number
    totalMinutes?: number
    currentStreak?: number
    achievements?: number
    followers?: number
    following?: number
    rating?: number
    reviewsCount?: number
    studentsCount?: number
    videosCount?: number
    programsCount?: number
  }
  specialties?: string[]
  certifications?: string[]
  experience?: string
  priceRange?: string
  languages?: string[]
}

interface Video {
  id: string
  title: string
  thumbnail: string
  duration: string
  views: number
  isPremium: boolean
  category: string
  isMainTrainer?: boolean
  isAdditionalTrainer?: boolean
}

interface Program {
  id: string
  title: string
  description: string
  duration: string
  level: string
  price: number
  enrolledCount: number
  rating: number
  image: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedDate: string
}

interface Review {
  id: string
  authorName: string
  authorAvatar: string
  rating: number
  comment: string
  date: string
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'programs' | 'achievements' | 'reviews' | 'testimonials'>('overview')
  const [videos, setVideos] = useState<Video[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followStatus, setFollowStatus] = useState<string | null>(null)
  const [followLoading, setFollowLoading] = useState(false)
  const [showUnfollowButton, setShowUnfollowButton] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${username}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setProfile(null)
          setLoading(false)
          return
        }
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      
      const mappedProfile: UserProfile = {
        id: data.id,
        username: data.username,
        name: data.name,
        avatar: data.avatar || '/images/trainers/avatar.png',
        bio: data.bio,
        location: data.location,
        email: data.email,
        phone: undefined,
        website: undefined,
        socialMedia: data.socialMedia,
        isTrainer: data.isTrainer,
        isVerified: data.isVerified,
        joinedDate: new Date(data.joinedDate).toISOString().split('T')[0],
        stats: data.stats,
        specialties: undefined,
        certifications: undefined,
        experience: undefined,
        priceRange: undefined,
        languages: ['Eesti']
      }

      setProfile(mappedProfile)
      
      // Set follower/following counts from API
      setFollowersCount(data.stats.followers || 0)
      setFollowingCount(data.stats.following || 0)
      setIsFollowing(data.isFollowing || false)
      setFollowStatus(data.followStatus || null)
      
      // Show unfollow button if already following a trainer
      if (data.isFollowing && data.isTrainer && data.followStatus === 'active') {
        setShowUnfollowButton(true)
      }

      // Set real videos from API
      if (data.isTrainer && data.videos) {
        setVideos(data.videos.map((v: any) => ({
          id: v.id.toString(),
          title: v.title,
          thumbnail: v.thumbnail,
          duration: v.duration,
          views: v.views,
          isPremium: v.isPremium,
          category: v.category,
          isMainTrainer: v.isMainTrainer,
          isAdditionalTrainer: v.isAdditionalTrainer
        })))

        // Set programs from API
        if (data.programs) {
          setPrograms(data.programs.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            duration: p.unitsCount ? `${p.unitsCount} ${p.unitLength === 'DAY' ? 'päeva' : 'nädalat'}` : 'N/A',
            level: p.status === 'PUBLISHED' ? 'Aktiivne' : 'Mustand',
            price: 29.99, // Default price
            enrolledCount: p.enrolledCount || 0,
            rating: 4.5 + Math.random() * 0.5, // Mock rating
            image: p.picture || '/images/program-placeholder.jpg'
          })))
        }

        setReviews([
          {
            id: '1',
            authorName: 'Liisa Kask',
            authorAvatar: '/images/avatar-2.jpg',
            rating: 5,
            comment: 'Maria on suurepärane treener! Väga motiveeriv ja professionaalne. Soovitan!',
            date: '2024-01-10'
          },
          {
            id: '2',
            authorName: 'Jaan Tamm',
            authorAvatar: '/images/avatar-3.jpg',
            rating: 5,
            comment: 'Parimad treeningud! Selged juhised ja alati positiivne energia.',
            date: '2024-01-05'
          }
        ])
      } else {
        // Mock achievements for regular user
        setAchievements([
          {
            id: '1',
            title: '100 treeningut',
            description: 'Oled sooritanud 100 treeningut',
            icon: '🏆',
            earnedDate: '2024-01-15'
          },
          {
            id: '2',
            title: '30-päevane järjestus',
            description: 'Treenisid 30 päeva järjest',
            icon: '🔥',
            earnedDate: '2024-01-01'
          },
          {
            id: '3',
            title: 'Varajane lind',
            description: '20 treeningut enne kella 7',
            icon: '🌅',
            earnedDate: '2023-12-20'
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleFollow = async () => {
    if (followLoading) return
    
    setFollowLoading(true)
    try {
      const action = isFollowing ? 'unfollow' : 'follow'
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followingId: parseInt(profile?.id || '0'),
          action
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (action === 'follow') {
          setIsFollowing(true)
          setFollowStatus(data.status)
          setFollowersCount(prev => prev + 1)
          
          // Show unfollow button after delay for trainers
          if (data.status === 'active' && profile?.isTrainer) {
            setTimeout(() => {
              setShowUnfollowButton(true)
            }, 2000)
          }
        } else {
          setIsFollowing(false)
          setFollowStatus(null)
          setShowUnfollowButton(false)
          setFollowersCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Follow action failed:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleContact = () => {
    router.push(`/messenger#${username}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2c313a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#2c313a] text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p>Kasutajat ei leitud</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#2c313a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" />
          Tagasi
        </Link>

        {/* Profile Header */}
        <div className="bg-[#3e4551] rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#4d5665] overflow-hidden">
                <img 
                  src={profile.avatar.startsWith('http') || profile.avatar.startsWith('/') 
                    ? profile.avatar 
                    : `/${profile.avatar}`} 
                  alt={profile.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 mb-4">
                <div className="min-w-0 w-full sm:w-auto">
                  <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 flex-wrap">
                    {profile.name}
                    {profile.isVerified && (
                      <CheckCircle className="w-6 h-6 text-blue-400" />
                    )}
                  </h1>
                  <p className="text-gray-400 text-sm sm:text-base break-all">@{profile.username}</p>
                  {profile.isTrainer && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-[#40b236] text-white text-xs rounded">Treener</span>
                      {profile.stats.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm sm:text-base">{profile.stats.rating.toFixed(1)}</span>
                          <span className="text-gray-400 text-sm">({profile.stats.reviewsCount})</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {profile.isTrainer && (
                    <button
                      onClick={handleContact}
                      className="px-3 sm:px-4 py-2 bg-[#4d5665] hover:bg-[#5d6775] rounded-lg font-medium transition-colors flex items-center gap-2 text-sm sm:text-base"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Võta ühendust</span>
                      <span className="sm:hidden">Sõnum</span>
                    </button>
                  )}
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
                      followLoading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : showUnfollowButton
                        ? 'bg-red-500 hover:bg-red-600'
                        : isFollowing
                        ? 'bg-[#40b236] hover:bg-[#60cc56]'
                        : 'bg-[#40b236] hover:bg-[#60cc56]'
                    }`}
                  >
                    {followLoading 
                      ? '...'
                      : showUnfollowButton
                      ? 'Eemalda jälgimine'
                      : isFollowing
                      ? (followStatus === 'pending' ? 'Taotlus saadetud' : 'Jälgin')
                      : 'Jälgi'}
                  </button>
                </div>
              </div>

              <p className="text-gray-300 mb-4 text-sm sm:text-base break-words">{profile.bio}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm">
                {profile.isTrainer ? (
                  <>
                    <div>
                      <span className="font-bold text-base sm:text-lg">{profile.stats.videosCount}</span>
                      <span className="text-gray-400 ml-1">videot</span>
                    </div>
                    <div>
                      <span className="font-bold text-base sm:text-lg">{profile.stats.programsCount}</span>
                      <span className="text-gray-400 ml-1">programmi</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="font-bold text-lg">{profile.stats.totalWorkouts}</span>
                      <span className="text-gray-400 ml-1">treeningut</span>
                    </div>
                    <div>
                      <span className="font-bold text-lg">{profile.stats.currentStreak}</span>
                      <span className="text-gray-400 ml-1">päeva järjest</span>
                    </div>
                    <div>
                      <span className="font-bold text-lg">{profile.stats.achievements}</span>
                      <span className="text-gray-400 ml-1">saavutust</span>
                    </div>
                  </>
                )}
                <div>
                  <span className="font-bold text-base sm:text-lg">{followersCount}</span>
                  <span className="text-gray-400 ml-1">jälgijat</span>
                </div>
                <div>
                  <span className="font-bold text-base sm:text-lg">{followingCount}</span>
                  <span className="text-gray-400 ml-1">jälgib</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {profile.isTrainer && (
          <div className="bg-[#3e4551] rounded-lg p-1 mb-6 flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-[#40b236] text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Ülevaade
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-3 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'videos'
                  ? 'bg-[#40b236] text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">Videod ({profile.stats.videosCount})</span>
              <span className="sm:hidden">Videod</span>
            </button>
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-3 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'programs'
                  ? 'bg-[#40b236] text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">Programmid ({profile.stats.programsCount})</span>
              <span className="sm:hidden">Programmid</span>
            </button>
            <Link
              href={`/profile/${username}/testimonials`}
              className={`px-3 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap inline-block ${
                activeTab === 'testimonials'
                  ? 'bg-[#40b236] text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">Arvustused ({profile.stats.reviewsCount})</span>
              <span className="sm:hidden">Arvustused</span>
            </Link>
          </div>
        )}

        {/* Content based on tab or user type */}
        {profile.isTrainer ? (
          <>
            {/* Trainer Overview */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* About */}
                  <div className="bg-[#3e4551] rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Minust</h2>
                    <p className="text-gray-300 mb-4 text-sm sm:text-base break-words">{profile.bio}</p>
                    
                    {profile.specialties && (
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">Spetsialiseerumine</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.specialties.map((specialty, index) => (
                            <span key={index} className="px-3 py-1 bg-[#2c313a] rounded-full text-sm">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.certifications && (
                      <div>
                        <h3 className="font-semibold mb-2">Sertifikaadid</h3>
                        <ul className="space-y-1 text-gray-300">
                          {profile.certifications.map((cert, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-[#40b236]" />
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Recent Videos */}
                  <div className="bg-[#3e4551] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">Viimased videod</h2>
                      <button 
                        onClick={() => setActiveTab('videos')}
                        className="text-[#40b236] hover:text-[#60cc56] transition-colors"
                      >
                        Vaata kõiki
                      </button>
                    </div>
                    <div className="grid gap-4">
                      {videos.slice(0, 3).map((video) => (
                        <Link 
                          key={video.id}
                          href={`/videos/${video.id}`}
                          className="flex gap-3 sm:gap-4 hover:bg-[#4d5665] p-2 rounded-lg transition-colors"
                        >
                          <div className="relative w-24 h-16 sm:w-32 sm:h-20 bg-[#2c313a] rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={video.thumbnail} 
                              alt={video.title} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.onerror = null
                                target.src = '/images/video-placeholder.png'
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-80" />
                            </div>
                            {video.isPremium && (
                              <div className="absolute top-1 right-1 bg-yellow-500 p-1 rounded">
                                <Lock className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium mb-1 text-sm sm:text-base line-clamp-2">{video.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {video.duration}
                              </span>
                              <span className="hidden sm:inline">{video.views} vaatamist</span>
                              <span className="sm:hidden">{video.views}</span>
                              {video.isAdditionalTrainer && (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                                  Kaastreener
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="bg-[#3e4551] rounded-lg p-4 sm:p-6">
                    <h3 className="font-bold mb-4 text-sm sm:text-base">Kontaktinfo</h3>
                    <div className="space-y-3 text-xs sm:text-sm">
                      {profile.location && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="w-4 h-4" />
                          <span className="flex items-center gap-2">
                            <img 
                              src={`https://flagcdn.com/24x18/${profile.location.code.toLowerCase()}.png`}
                              alt={profile.location.name}
                              className="w-6 h-4"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                            {profile.location.name === 'Estonia' ? 'Eesti' : profile.location.name}
                          </span>
                        </div>
                      )}
                      {profile.email && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Mail className="w-4 h-4" />
                          {profile.email}
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Phone className="w-4 h-4" />
                          {profile.phone}
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Globe className="w-4 h-4" />
                          {profile.website}
                        </div>
                      )}
                    </div>

                    {profile.socialMedia && (
                      <div className="mt-4 pt-4 border-t border-[#4d5665]">
                        <h4 className="text-sm font-semibold mb-3 text-gray-300">Sotsiaalmeedia</h4>
                        <div className="flex gap-2 flex-wrap">
                          {profile.socialMedia.facebook && (
                            <a href={profile.socialMedia.facebook.startsWith('http') 
                                ? profile.socialMedia.facebook 
                                : `https://facebook.com/${profile.socialMedia.facebook}`} 
                               target="_blank"
                               rel="noopener noreferrer"
                               className="p-2 bg-[#2c313a] rounded-lg hover:bg-[#4d5665] transition-colors">
                              <Facebook className="w-5 h-5" />
                            </a>
                          )}
                          {profile.socialMedia.instagram && (
                            <a href={profile.socialMedia.instagram.startsWith('http')
                                ? profile.socialMedia.instagram
                                : `https://instagram.com/${profile.socialMedia.instagram}`} 
                               target="_blank"
                               rel="noopener noreferrer"
                               className="p-2 bg-[#2c313a] rounded-lg hover:bg-[#4d5665] transition-colors">
                              <Instagram className="w-5 h-5" />
                            </a>
                          )}
                          {profile.socialMedia.youtube && (
                            <a href={profile.socialMedia.youtube.startsWith('http')
                                ? profile.socialMedia.youtube
                                : `https://youtube.com/${profile.socialMedia.youtube}`} 
                               target="_blank"
                               rel="noopener noreferrer"
                               className="p-2 bg-[#2c313a] rounded-lg hover:bg-[#4d5665] transition-colors">
                              <Youtube className="w-5 h-5" />
                            </a>
                          )}
                          {profile.socialMedia.tiktok && (
                            <a href={profile.socialMedia.tiktok.startsWith('http')
                                ? profile.socialMedia.tiktok
                                : `https://tiktok.com/@${profile.socialMedia.tiktok}`} 
                               target="_blank"
                               rel="noopener noreferrer"
                               className="p-2 bg-[#2c313a] rounded-lg hover:bg-[#4d5665] transition-colors">
                              <FaTiktok className="w-5 h-5" />
                            </a>
                          )}
                          {profile.socialMedia.twitter && (
                            <a href={profile.socialMedia.twitter.startsWith('http')
                                ? profile.socialMedia.twitter
                                : `https://twitter.com/${profile.socialMedia.twitter}`} 
                               target="_blank"
                               rel="noopener noreferrer"
                               className="p-2 bg-[#2c313a] rounded-lg hover:bg-[#4d5665] transition-colors">
                              <Twitter className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="bg-[#3e4551] rounded-lg p-6">
                    <h3 className="font-bold mb-4">Lisainfo</h3>
                    <div className="space-y-3 text-sm">
                      {profile.experience && (
                        <div>
                          <span className="text-gray-400">Kogemus:</span>
                          <span className="ml-2">{profile.experience}</span>
                        </div>
                      )}
                      {profile.priceRange && (
                        <div>
                          <span className="text-gray-400">Hinnavahemik:</span>
                          <span className="ml-2">{profile.priceRange}</span>
                        </div>
                      )}
                      {profile.languages && (
                        <div>
                          <span className="text-gray-400">Keeled:</span>
                          <span className="ml-2">{profile.languages.join(', ')}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400">Liitus:</span>
                        <span className="ml-2">
                          {new Date(profile.joinedDate).toLocaleDateString('et-EE', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {videos.map((video) => (
                  <Link 
                    key={video.id}
                    href={`/videos/${video.id}`}
                    className="bg-[#3e4551] rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform"
                  >
                    <div className="relative aspect-video bg-[#2c313a]">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.src = '/images/video-placeholder.png'
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                        <Play className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      </div>
                      {video.isPremium && (
                        <div className="absolute top-2 right-2 bg-yellow-500 p-1.5 rounded">
                          <Lock className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-medium mb-2 text-sm sm:text-base line-clamp-2">{video.title}</h3>
                      <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-400 gap-2">
                        <span>{video.category}</span>
                        <span>{video.views} vaatamist</span>
                      </div>
                      {video.isAdditionalTrainer && (
                        <div className="mt-2">
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                            Kaastreener
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Programs Tab */}
            {activeTab === 'programs' && (
              <div>
                {programs.length === 0 ? (
                  <div className="bg-[#3e4551] rounded-lg p-8 text-center">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Programmid puuduvad</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {programs.map((program) => (
                      <Link 
                        key={program.id}
                        href={`/programs/${program.id}`}
                        className="bg-[#3e4551] rounded-lg overflow-hidden hover:ring-2 hover:ring-[#40b236] transition-all"
                      >
                        <div className="relative aspect-video bg-[#2c313a]">
                          <img 
                            src={program.image} 
                            alt={program.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.onerror = null
                              target.src = '/images/program-placeholder.png'
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                          </div>
                          <div className="absolute top-2 left-2 bg-[#40b236] px-2 py-1 rounded text-xs text-white font-bold">
                            PROGRAMM
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                            {program.duration}
                          </div>
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="font-medium mb-2 text-sm sm:text-base line-clamp-2">{program.title}</h3>
                          <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2">{program.description}</p>
                          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-400 gap-2">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{program.enrolledCount} osalejat</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>{program.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-[#4d5665]">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-[#40b236]">{program.price}€</span>
                              <span className="text-xs text-gray-400">{program.level}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-[#3e4551] rounded-lg p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#4d5665] overflow-hidden flex-shrink-0">
                        <img src={review.authorAvatar} alt={review.authorName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                          <h4 className="font-semibold text-sm sm:text-base">{review.authorName}</h4>
                          <span className="text-xs sm:text-sm text-gray-400">
                            {new Date(review.date).toLocaleDateString('et-EE')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-gray-300 text-sm sm:text-base">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Regular User Profile */
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Activity Stats */}
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Aktiivsus</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-[#2c313a] rounded-lg">
                    <Activity className="w-8 h-8 text-[#40b236] mx-auto mb-2" />
                    <div className="text-2xl font-bold">{profile.stats.totalWorkouts}</div>
                    <div className="text-sm text-gray-400">Treeningut</div>
                  </div>
                  <div className="text-center p-4 bg-[#2c313a] rounded-lg">
                    <Clock className="w-8 h-8 text-[#40b236] mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {Math.floor((profile.stats.totalMinutes || 0) / 60)}h
                    </div>
                    <div className="text-sm text-gray-400">Treeningaega</div>
                  </div>
                  <div className="text-center p-4 bg-[#2c313a] rounded-lg">
                    <TrendingUp className="w-8 h-8 text-[#40b236] mx-auto mb-2" />
                    <div className="text-2xl font-bold">{profile.stats.currentStreak}</div>
                    <div className="text-sm text-gray-400">Päeva järjest</div>
                  </div>
                  <div className="text-center p-4 bg-[#2c313a] rounded-lg">
                    <Award className="w-8 h-8 text-[#40b236] mx-auto mb-2" />
                    <div className="text-2xl font-bold">{profile.stats.achievements}</div>
                    <div className="text-sm text-gray-400">Saavutust</div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Viimased saavutused</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-4 bg-[#2c313a] rounded-lg">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(achievement.earnedDate).toLocaleDateString('et-EE')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h3 className="font-bold mb-4">Info</h3>
                <div className="space-y-3 text-sm">
                  {profile.location && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    Liitus {new Date(profile.joinedDate).toLocaleDateString('et-EE', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </div>
                </div>
              </div>

              {/* Favorite Trainers */}
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h3 className="font-bold mb-4">Lemmiktreenerid</h3>
                <div className="space-y-3">
                  <Link href="/profile/maria-magi" className="flex items-center gap-3 hover:bg-[#4d5665] p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#4d5665] overflow-hidden">
                      <img src="/images/avatar-1.jpg" alt="Maria Mägi" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Maria Mägi</p>
                      <p className="text-xs text-gray-400">156 õpilast</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}