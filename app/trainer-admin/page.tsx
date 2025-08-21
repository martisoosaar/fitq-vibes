'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Play, Edit, Eye, Clock, Calendar, Users } from 'lucide-react'

interface Video {
  id: number
  title: string
  duration: number
  views: number
  totalWatchTime: number
  thumbnail: string | null
  vimeoId: string | null
  createdAt: string
  isOwner: boolean // true if this trainer owns it, false if they're co-trainer
}

interface VideoStats {
  totalWatchTimeSeconds: number
  uniqueViewersCount: number
}

export default function TrainerVideosPage() {
  const { user } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [stats, setStats] = useState<VideoStats>({ totalWatchTimeSeconds: 0, uniqueViewersCount: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'owned' | 'cotrainer'>('all')

  useEffect(() => {
    fetchVideos()
  }, [user])

  const fetchVideos = async () => {
    if (!user) return
    
    try {
      console.log('Fetching trainer videos for user:', user.email)
      const response = await fetch('/api/trainer/videos')
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Received data:', data)
        setVideos(data.videos || data)
        if (data.stats) {
          setStats(data.stats)
        }
      } else {
        const error = await response.json()
        console.error('API error:', error)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} min`
  }

  const formatTotalWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    
    if (days > 0) {
      return `${days}p ${remainingHours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} min`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('et-EE', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const filteredVideos = videos.filter(video => {
    if (filter === 'owned') return video.isOwner
    if (filter === 'cotrainer') return !video.isOwner
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
          <p className="mt-4 text-gray-300">Laen videosid...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-[#3e4551] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Videoid kokku</p>
              <p className="text-2xl font-bold">{videos.length}</p>
            </div>
            <Play className="h-8 w-8 text-[#40b236]" />
          </div>
        </div>
        <div className="bg-[#3e4551] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Vaatamisi kokku</p>
              <p className="text-2xl font-bold">
                {videos.reduce((sum, v) => sum + v.views, 0)}
              </p>
            </div>
            <Eye className="h-8 w-8 text-[#40b236]" />
          </div>
        </div>
        <div className="bg-[#3e4551] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Vaatamisaeg kokku</p>
              <p className="text-xl font-bold">
                {formatTotalWatchTime(stats.totalWatchTimeSeconds)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-[#40b236]" />
          </div>
        </div>
        <div className="bg-[#3e4551] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unikaalseid vaatajaid</p>
              <p className="text-2xl font-bold">
                {stats.uniqueViewersCount}
              </p>
            </div>
            <Users className="h-8 w-8 text-[#40b236]" />
          </div>
        </div>
        <div className="bg-[#3e4551] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Minu videoid</p>
              <p className="text-2xl font-bold">
                {videos.filter(v => v.isOwner).length}
              </p>
            </div>
            <Users className="h-8 w-8 text-[#40b236]" />
          </div>
        </div>
        <div className="bg-[#3e4551] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Kaastreenerina</p>
              <p className="text-2xl font-bold">
                {videos.filter(v => !v.isOwner).length}
              </p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters and actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-[#40b236] text-white'
                : 'bg-[#3e4551] text-gray-300 hover:bg-[#4d5665]'
            }`}
          >
            Kõik videod
          </button>
          <button
            onClick={() => setFilter('owned')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'owned'
                ? 'bg-[#40b236] text-white'
                : 'bg-[#3e4551] text-gray-300 hover:bg-[#4d5665]'
            }`}
          >
            Minu videod
          </button>
          <button
            onClick={() => setFilter('cotrainer')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'cotrainer'
                ? 'bg-[#40b236] text-white'
                : 'bg-[#3e4551] text-gray-300 hover:bg-[#4d5665]'
            }`}
          >
            Kaastreenerina
          </button>
        </div>
        <button className="bg-[#40b236] hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Lisa video
        </button>
      </div>

      {/* Videos table */}
      {filteredVideos.length === 0 ? (
        <div className="bg-[#3e4551] rounded-lg p-8 text-center">
          <p className="text-gray-400">
            {filter === 'owned' 
              ? 'Sul pole veel ühtegi enda videot.'
              : filter === 'cotrainer'
              ? 'Sa pole ühegi video kaastreener.'
              : 'Videoid ei leitud.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#3e4551] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#4d5665]">
                <th className="text-left p-4 text-gray-400 font-medium">Video</th>
                <th className="text-left p-4 text-gray-400 font-medium">Vaatamisi</th>
                <th className="text-left p-4 text-gray-400 font-medium">Vaatamisaeg</th>
                <th className="text-left p-4 text-gray-400 font-medium">Kestus</th>
                <th className="text-left p-4 text-gray-400 font-medium">Lisatud</th>
                <th className="text-left p-4 text-gray-400 font-medium">Staatus</th>
                <th className="text-right p-4 text-gray-400 font-medium">Tegevused</th>
              </tr>
            </thead>
            <tbody>
              {filteredVideos.map((video) => (
                <tr key={video.id} className="border-b border-[#4d5665] hover:bg-[#4d5665] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-12 bg-[#2c313a] rounded overflow-hidden flex-shrink-0">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{video.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span>{video.views}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatTotalWatchTime(video.totalWatchTime || 0)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(video.createdAt)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {video.isOwner ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#40b236]/20 text-[#40b236]">
                        Omanik
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-400">
                        Kaastreener
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/videos/${video.id}`}
                        className="p-2 rounded hover:bg-[#525a6b] transition-colors"
                        title="Vaata videot"
                      >
                        <Eye className="h-4 w-4 text-gray-400" />
                      </Link>
                      {video.isOwner && (
                        <button
                          className="p-2 rounded hover:bg-[#525a6b] transition-colors"
                          title="Muuda videot"
                        >
                          <Edit className="h-4 w-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}