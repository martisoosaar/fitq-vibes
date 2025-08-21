'use client'

import { useState, useEffect } from 'react'
import { PlayCircle, Clock, User, Calendar, TrendingUp, Filter, ChevronDown, ChevronUp } from 'lucide-react'

interface VideoView {
  id: number
  videoId: number
  userId: number
  watchTimeSeconds: number
  createdAt: string
  video: {
    id: number
    title: string
    duration: number
    thumbnail: string | null
    category: string | null
    trainer?: {
      id: number
      name: string
      slug: string
    }
  }
  user: {
    id: number
    email: string
    name: string | null
    avatar: string | null
  }
}

interface VideoViewsStats {
  totalViews: number
  totalWatchTime: number
  averageWatchTime: number
  uniqueViewers: number
}

export default function VideoViewsTable() {
  const [views, setViews] = useState<VideoView[]>([])
  const [stats, setStats] = useState<VideoViewsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filterVideoId, setFilterVideoId] = useState<string>('')
  const [filterUserId, setFilterUserId] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'duration'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  useEffect(() => {
    fetchVideoViews()
  }, [filterVideoId, filterUserId])
  
  const fetchVideoViews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterVideoId) params.append('videoId', filterVideoId)
      if (filterUserId) params.append('userId', filterUserId)
      params.append('limit', '100')
      
      const response = await fetch(`/api/admin/video-views?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch video views')
      }
      
      const data = await response.json()
      setViews(data.views)
      setStats(data.stats)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  const calculateWatchPercentage = (watchTime: number, videoDuration: number): number => {
    if (!videoDuration) return 0
    return Math.min(Math.round((watchTime / videoDuration) * 100), 100)
  }
  
  // Sort views
  const sortedViews = [...views].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    } else {
      return sortOrder === 'desc' 
        ? b.watchTimeSeconds - a.watchTimeSeconds 
        : a.watchTimeSeconds - b.watchTimeSeconds
    }
  })
  
  if (loading) {
    return (
      <div className="bg-[#3e4551] rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#4d5665] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-[#4d5665] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-[#3e4551] rounded-lg p-6">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }
  
  return (
    <div className="bg-[#3e4551] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-[#40b236]" />
          Video vaatamised
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4d5665] hover:bg-[#5d6775] rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filtrid
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#4d5665] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Kokku vaatamisi</p>
            <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
          </div>
          <div className="bg-[#4d5665] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Kokku vaadatud</p>
            <p className="text-2xl font-bold text-white">{formatDuration(stats.totalWatchTime)}</p>
          </div>
          <div className="bg-[#4d5665] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Keskmine vaatamisaeg</p>
            <p className="text-2xl font-bold text-white">{formatDuration(stats.averageWatchTime)}</p>
          </div>
          <div className="bg-[#4d5665] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Unikaalsed vaatajad</p>
            <p className="text-2xl font-bold text-white">{stats.uniqueViewers}</p>
          </div>
        </div>
      )}
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-[#4d5665] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Video ID</label>
              <input
                type="text"
                value={filterVideoId}
                onChange={(e) => setFilterVideoId(e.target.value)}
                placeholder="Filtreeri video ID järgi"
                className="w-full px-3 py-2 bg-[#2c313a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40b236]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Kasutaja ID</label>
              <input
                type="text"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
                placeholder="Filtreeri kasutaja ID järgi"
                className="w-full px-3 py-2 bg-[#2c313a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40b236]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sorteeri</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-')
                  setSortBy(by as 'date' | 'duration')
                  setSortOrder(order as 'asc' | 'desc')
                }}
                className="w-full px-3 py-2 bg-[#2c313a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40b236]"
              >
                <option value="date-desc">Kuupäev (uuemad enne)</option>
                <option value="date-asc">Kuupäev (vanemad enne)</option>
                <option value="duration-desc">Vaatamisaeg (pikem enne)</option>
                <option value="duration-asc">Vaatamisaeg (lühem enne)</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#4d5665]">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Video</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Kasutaja</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Vaadatud</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Progress</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Kuupäev</th>
            </tr>
          </thead>
          <tbody>
            {sortedViews.map((view) => {
              const watchPercentage = calculateWatchPercentage(view.watchTimeSeconds, view.video.duration)
              
              return (
                <tr key={view.id} className="border-b border-[#4d5665] hover:bg-[#4d5665] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {view.video.thumbnail ? (
                        <img 
                          src={view.video.thumbnail} 
                          alt={view.video.title}
                          className="w-16 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-10 bg-[#2c313a] rounded flex items-center justify-center">
                          <PlayCircle className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{view.video.title}</p>
                        <p className="text-sm text-gray-400">
                          ID: {view.video.id}
                          {view.video.trainer && ` • ${view.video.trainer.name}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white">{view.user.name || view.user.email}</p>
                      <p className="text-xs text-gray-400">ID: {view.user.id}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-white">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatDuration(view.watchTimeSeconds)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-24">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>{watchPercentage}%</span>
                      </div>
                      <div className="h-2 bg-[#2c313a] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#40b236] transition-all"
                          style={{ width: `${watchPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDate(view.createdAt)}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {sortedViews.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Vaatamisi ei leitud
          </div>
        )}
      </div>
    </div>
  )
}