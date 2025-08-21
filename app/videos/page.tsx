'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'

interface Video {
  id: number
  title: string
  duration: string
  durationSeconds: number
  thumbnail: string
  category: string
  categoryId: number
  language: {
    id: number
    name: string
    abbr: string
    flag: string | null
  } | null
  languageId: number | null
  trainer: {
    id: number
    name: string
    slug: string
    avatar: string | null
  } | null
  trainers?: {
    id: number
    name: string
  }[]
  views: number
  commentCount?: number
  isPremium: boolean
  isFree: boolean
  openForSubscribers: boolean
  playbackUrl: string | null
  vimeoId: string | null
}

function formatDuration(seconds: number) {
  if (seconds >= 3600) {
    // Format as HH:mm:ss for videos over 60 minutes
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  } else {
    // Format as mm:ss for videos under 60 minutes
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }
}

interface Category {
  id: number
  name: string
  image: string | null
}

interface Language {
  id: number
  name: string
  abbr: string
  flag: string | null
}

export default function VideosPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<string>('')
  const [selectedEquipment, setSelectedEquipment] = useState<string>('')
  const [selectedSort, setSelectedSort] = useState<string>('newest')
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const isFavorites = searchParams.get('favorites') === 'true'
  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    setOffset(0)
    fetchVideos(true)
  }, [selectedCategory, selectedLanguage, selectedDuration, selectedEquipment, selectedSort, searchQuery])

  const fetchVideos = async (reset = false) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        limit: '30',
        offset: reset ? '0' : offset.toString(),
        sort: selectedSort
      })
      
      if (searchQuery) {
        params.set('q', searchQuery)
      }
      
      if (selectedCategory) {
        params.set('category', selectedCategory.toString())
      }
      
      if (selectedDuration) {
        params.set('duration', selectedDuration)
      }
      
      if (selectedEquipment) {
        params.set('equipment', selectedEquipment)
      }
      
      if (selectedLanguage) {
        params.set('language', selectedLanguage.toString())
      }
      
      const response = await fetch(`/api/videos?${params}`)
      const data = await response.json()
      
      if (data.videos) {
        if (reset) {
          setVideos(data.videos)
          setOffset(30)
        } else {
          setVideos(prev => [...prev, ...data.videos])
          setOffset(prev => prev + 30)
        }
        setHasMore(data.hasMore)
        
        // Set categories if not already set
        if (data.categories && categories.length === 0) {
          setCategories(data.categories)
        }
        
        // Set languages if not already set
        if (data.languages && languages.length === 0) {
          setLanguages(data.languages)
        }
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    router.push(`/videos?${params.toString()}`)
  }

  return (
    <div className="bg-[#2c313a] text-white pb-12">
      {/* Page Header */}
      <div className="bg-[#3e4551] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {isFavorites ? 'Lemmikud' : 'Videod'}
          </h1>
          <p className="text-gray-300">
            {isFavorites 
              ? 'Sinu salvestatud lemmik videod' 
              : 'Avasta uusi treeningvideosid'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        {/* Search Bar */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Otsi videosid või treenereid..."
              className="w-full px-4 py-3 pr-10 bg-[#3e4551] border border-[#4d5665] rounded-lg focus:outline-none focus:border-[#40b236] transition-colors"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        
        {/* Filters */}
        {!isFavorites && (
          <div className="mb-6 space-y-4">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-[#40b236] text-white'
                      : 'bg-[#3e4551] hover:bg-[#4d5665]'
                  }`}
                >
                  Kõik
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                      selectedCategory === category.id
                        ? 'bg-[#40b236] text-white'
                        : 'bg-[#3e4551] hover:bg-[#4d5665]'
                    }`}
                  >
                    {category.name.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
            
            {/* Advanced Filters */}
            <div className="flex flex-wrap gap-4 justify-center">
              {/* Duration Filter */}
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="px-3 py-2 bg-[#3e4551] border border-[#4d5665] rounded-lg text-white focus:outline-none focus:border-[#40b236] transition-colors"
              >
                <option value="">Kõik pikkused</option>
                <option value="short">Lühikesed (0-20 min)</option>
                <option value="medium">Keskmised (20-45 min)</option>
                <option value="long">Pikad (45+ min)</option>
              </select>
              
              {/* Equipment Filter */}
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="px-3 py-2 bg-[#3e4551] border border-[#4d5665] rounded-lg text-white focus:outline-none focus:border-[#40b236] transition-colors"
              >
                <option value="">Kõik varustused</option>
                <option value="dumbbells">Hantlid</option>
                <option value="resistance_bands">Vastupanuribad</option>
                <option value="mat">Matt</option>
                <option value="bodyweight">Kehakaalu treening</option>
                <option value="kettlebell">Kettlebell</option>
                <option value="barbell">Kangid</option>
              </select>
              
              {/* Language Filter */}
              {languages.length > 0 && (
                <select
                  value={selectedLanguage || ''}
                  onChange={(e) => setSelectedLanguage(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 bg-[#3e4551] border border-[#4d5665] rounded-lg text-white focus:outline-none focus:border-[#40b236] transition-colors"
                >
                  <option value="">Kõik keeled</option>
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name.charAt(0).toUpperCase() + lang.name.slice(1)}
                    </option>
                  ))}
                </select>
              )}
              
              {/* Sort Filter */}
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="px-3 py-2 bg-[#3e4551] border border-[#4d5665] rounded-lg text-white focus:outline-none focus:border-[#40b236] transition-colors"
              >
                <option value="newest">Uusimad</option>
                <option value="oldest">Vanimad</option>
                <option value="popular">Populaarsemad</option>
                <option value="most-commented">Enim kommenteeritud</option>
                <option value="longest">Pikimad</option>
                <option value="shortest">Lühimad</option>
              </select>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
          </div>
        )}
        
        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-semibold">
              {isFavorites 
                ? 'Sul pole veel ühtegi lemmik videot' 
                : 'Videosid ei leitud'}
            </p>
            {isFavorites && (
              <Link 
                href="/videos"
                className="inline-block mt-4 text-[#40b236] hover:text-[#60cc56] transition-colors"
              >
                Avasta videosid
              </Link>
            )}
          </div>
        )}

        {/* Videos Grid */}
        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div 
                key={video.id} 
                className="bg-[#3e4551] rounded-lg overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <Link href={`/videos/${video.id}`} className="block">
                  <div className="relative aspect-video bg-[#4d5665] overflow-hidden">
                    {video.thumbnail ? (
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onLoad={() => console.log('Image loaded:', video.thumbnail)}
                        onError={(e) => {
                          console.log('Image failed to load:', video.thumbnail)
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.src = '/images/video-placeholder.png'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-20 h-20 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-30 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                        <div className="bg-[#40b236] rounded-full p-4">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    {video.isPremium && (
                      <div className="absolute top-2 left-2 bg-[#40b236] text-white px-2 py-1 rounded text-xs font-medium">
                        Premium
                      </div>
                    )}
                    {video.language && (
                      <div className="absolute top-2 right-2 text-2xl" title={video.language.name.charAt(0).toUpperCase() + video.language.name.slice(1)}>
                        {video.language.abbr === 'en' && '🇬🇧'}
                        {video.language.abbr === 'est' && '🇪🇪'}
                        {video.language.abbr === 'ru' && '🇷🇺'}
                        {video.language.abbr === 'lat' && '🇱🇻'}
                        {video.language.abbr === 'lt' && '🇱🇹'}
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-sm">
                      {formatDuration(video.durationSeconds || 0)}
                    </div>
                  </div>
                </Link>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[#60cc56] font-medium capitalize">
                      {video.category.replace('_', ' ')}
                    </span>
                    {/* Show main trainer */}
                    {video.trainer && (
                      <Link 
                        href={`/profile/${video.trainer.slug}`}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {video.trainer.name}
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      {video.views > 1000 ? `${(video.views / 1000).toFixed(1)}k` : video.views}
                    </span>
                    {video.commentCount !== undefined && video.commentCount > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {video.commentCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Load More Button */}
        {!loading && hasMore && videos.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => fetchVideos(false)}
              className="px-6 py-3 bg-[#40b236] hover:bg-[#60cc56] text-white font-medium rounded-lg transition-colors"
            >
              Laadi rohkem videosid
            </button>
          </div>
        )}
      </div>
    </div>
  )
}