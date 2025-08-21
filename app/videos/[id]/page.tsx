'use client'

import { useState, useEffect, useRef, useMemo, memo } from 'react'
// import { useVimeoPlayer } from '../../../hooks/useVimeoPlayer'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Eye, Clock, Dumbbell, Volume2, Info, Share2, ChevronLeft, Lock } from 'lucide-react'
// Removed video tracking import
import { useAuth } from '../../../contexts/AuthContext'

interface Video {
  id: number
  title: string
  description: string
  duration: string
  durationSeconds: number
  category: string
  categoryId: number
  thumbnail: string
  views: number
  language: {
    id: number
    languageName: string
    languageAbbr: string
    languageFlag: string | null
  } | null
  trainer: {
    id: number
    name: string
    slug: string
    avatar: string | null
  } | null
  trainers: {
    id: number
    name: string
    avatar: string | null
    slug: string
  }[]
  user: {
    id: number
    name: string
    avatar: string | null
    description: string | null
  }
  isPremium: boolean
  isFree: boolean
  openForSubscribers: boolean
  openForTickets: boolean
  singleTicketPrice: number
  playbackUrl: string | null
  vimeoId: string | null
  iframe: string | null
  videoLanguage: string | null
  equipment: string | null
  keywords: string | null
  energyConsumption: number | null
  createdAt: string
  relatedVideos: {
    id: number
    title: string
    duration: string
    thumbnail: string
    category: string
    trainer: {
      name: string
      slug: string
    } | null
    views: number
  }[]
}

interface Comment {
  id: number
  user: {
    name: string
    avatar?: string
  }
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  
  if (h > 0) {
    return `${h}h ${m}min`
  }
  return `${m}min ${s}s`
}


function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Täna'
  if (days === 1) return 'Eile'
  if (days < 7) return `${days} päeva tagasi`
  if (days < 30) return `${Math.floor(days / 7)} nädala tagasi`
  if (days < 365) return `${Math.floor(days / 30)} kuu tagasi`
  return `${Math.floor(days / 365)} aasta tagasi`
}

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const { user, isLoading: authLoading } = useAuth()
  
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Removed all video tracking code
  
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [showMusicList, setShowMusicList] = useState(false)
  const iframeRef = useRef<HTMLDivElement>(null)
  
  // Removed Vimeo Player hook to simplify

  

  useEffect(() => {
    fetchVideo()
    fetchComments()
  }, [params.id])

  // Removed auto-play tracking for iframe videos

  // Removed vimeoTime and vimeoPlayer refs

  // Removed all tab visibility tracking


  const fetchVideo = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/videos/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Video not found')
      }
      
      const data = await response.json()
      setVideo(data)
    } catch (err: any) {
      setError(err.message || 'Video laadimine ebaõnnestus')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/videos/${params.id}/comments`, {
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      } else {
        console.error('Failed to fetch comments')
        setComments([])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      setComments([])
    }
  }

  const handleLike = async () => {
    // TODO: Implement like functionality
  }

  const handleFavorite = async () => {
    // TODO: Implement favorite functionality
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!user) {
      alert('Kommenteerimiseks pead olema sisse logitud')
      return
    }
    
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('Kommenteerimiseks pead olema sisse logitud')
        return
      }

      const response = await fetch(`/api/videos/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      })

      if (response.ok) {
        const newCommentData = await response.json()
        setComments([newCommentData, ...comments])
        setNewComment('')
      } else {
        alert('Kommentaari lisamine ebaõnnestus')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      alert('Kommentaari lisamine ebaõnnestus')
    }
  }

  const handleCommentLike = async (commentId: number) => {
    if (!user) {
      alert("Like'imiseks pead olema sisse logitud")
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setComments(comments.map(c => 
          c.id === commentId 
            ? { ...c, isLiked: data.liked, likes: data.likes }
            : c
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#2c313a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-[#2c313a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {error || 'Video ei leitud'}
          </h2>
          <Link 
            href="/videos"
            className="text-[#40b236] hover:text-[#60cc56] transition-colors"
          >
            ← Tagasi videote juurde
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#2c313a] text-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 p-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Back Button */}
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Tagasi
            </button>

            {/* Video Player Container */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
              {!user ? (
                // Show login overlay if user is not authenticated
                <div className="w-full h-full flex items-center justify-center bg-[#3e4551] relative">
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{
                      backgroundImage: video.thumbnail ? `url(${video.thumbnail})` : 'none'
                    }}
                  />
                  <div className="relative z-10 text-center p-8">
                    <div className="bg-black/70 rounded-lg p-8 max-w-md">
                      <Lock className="w-16 h-16 mx-auto mb-4 text-[#40b236]" />
                      <h3 className="text-2xl font-bold mb-4">Logi sisse</h3>
                      <p className="text-gray-300 mb-6">
                        Video vaatamiseks peate olema sisse logitud
                      </p>
                      <Link
                        href="/login"
                        className="inline-block px-6 py-3 bg-[#40b236] hover:bg-[#60cc56] text-white font-semibold rounded-lg transition-colors"
                      >
                        Logi sisse
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                // Video content - keep structure stable regardless of overlay state
                <div className="w-full h-full relative">
                  {video.iframe ? (
                    <div 
                      ref={iframeRef}
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ 
                        __html: video.iframe
                          .replace(/width="\d+"/, 'width="100%"')
                          .replace(/height="\d+"/, 'height="100%"')
                      }}
                    />
                  ) : video.playbackUrl ? (
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      controls
                      poster={video.thumbnail}
                      onPlay={() => {
                        setIsPlaying(true)
                      }}
                      onPause={() => {
                        setIsPlaying(false)
                      }}
                      onEnded={() => {
                        setIsPlaying(false)
                      }}
                    >
                      <source src={video.playbackUrl} type="video/mp4" />
                      Teie brauser ei toeta video esitamist.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#3e4551]">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🎬</div>
                        <p className="text-xl">Video ei ole hetkel saadaval</p>
                        {video.vimeoId && (
                          <p className="text-sm text-gray-400 mt-2">Vimeo ID: {video.vimeoId}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Removed tab hidden overlay */}
                </div>
              )}

            </div>

            {/* Video Title and Actions */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl md:text-3xl font-bold flex-1">
                  {video.title}
                </h1>
                <div className="flex items-center gap-2">
                  {video.isPremium && (
                    <span className="px-3 py-1 bg-[#40b236] text-white text-sm rounded-lg">
                      Premium
                    </span>
                  )}
                  {video.isFree && (
                    <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg">
                      Tasuta
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-300">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {video.views} vaatamist
                </span>
                <span>•</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>
            </div>

            {/* Main Trainer Info */}
            {video.trainer ? (
              <div className="bg-[#3e4551] rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <Link 
                    href={`/profile/${video.trainer.slug}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#4d5665] flex items-center justify-center">
                      {video.trainer.avatar ? (
                        <img 
                          src={video.trainer.avatar.startsWith('/') ? video.trainer.avatar : `/${video.trainer.avatar}`} 
                          alt={video.trainer.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">👤</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{video.trainer.name}</p>
                    </div>
                  </Link>
                  <button
                    onClick={handleFavorite}
                    className="px-4 py-2 rounded-lg bg-[#4d5665] hover:bg-[#5d6775] text-white font-medium transition-colors"
                  >
                    Lisa lemmikutesse
                  </button>
                </div>
                
                {/* Additional Trainers */}
                {video.trainers && video.trainers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#4d5665]">
                    <p className="text-sm text-gray-400 mb-2">Videos osalevad:</p>
                    <div className="flex flex-wrap gap-2">
                      {video.trainers.map(trainer => (
                        <Link 
                          key={trainer.id} 
                          href={`/profile/${trainer.slug}`}
                          className="flex items-center gap-2 bg-[#4d5665] hover:bg-[#5d6775] px-3 py-1 rounded-lg transition-colors"
                        >
                          {trainer.avatar && (
                            <div className="w-5 h-5 rounded-full overflow-hidden">
                              <img 
                                src={trainer.avatar.startsWith('/') ? trainer.avatar : `/${trainer.avatar}`} 
                                alt={trainer.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="text-sm">{trainer.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Video Description */}
            <div className="bg-[#3e4551] rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Kirjeldus</h2>
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: video.description }}
              />
            </div>

            {/* Comments Section */}
            <div className="bg-[#3e4551] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                Kommentaarid ({comments.length})
              </h2>

              {/* Add Comment */}
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Lisa kommentaar..."
                  className="w-full px-4 py-3 bg-[#2c313a] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#40b236]"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-6 py-2 bg-[#40b236] hover:bg-[#60cc56] disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                  >
                    Postita
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-[#2c313a] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#4d5665] flex items-center justify-center flex-shrink-0">
                        {comment.user.avatar ? (
                          <img 
                            src={comment.user.avatar} 
                            alt={comment.user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{comment.user.name}</span>
                          <span className="text-sm text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-200 mb-2">{comment.content}</p>
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          <Heart 
                            className={`w-4 h-4 ${comment.isLiked ? 'fill-red-500 text-red-500' : ''}`}
                          />
                          <span>{comment.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Training Details */}
            <div className="bg-[#3e4551] rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Treeningu info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#40b236]" />
                  <div>
                    <p className="text-sm text-gray-400">Kestus</p>
                    <p className="font-medium">{video.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-[#40b236]" />
                  <div>
                    <p className="text-sm text-gray-400">Keel</p>
                    <p className="font-medium flex items-center gap-2">
                      {video.language ? (
                        <>
                          <span className="text-xl">
                            {video.language.languageAbbr === 'en' && '🇬🇧'}
                            {video.language.languageAbbr === 'est' && '🇪🇪'}
                            {video.language.languageAbbr === 'ru' && '🇷🇺'}
                            {video.language.languageAbbr === 'lat' && '🇱🇻'}
                            {video.language.languageAbbr === 'lt' && '🇱🇹'}
                          </span>
                          <span>{video.language.languageName.charAt(0).toUpperCase() + video.language.languageName.slice(1)}</span>
                        </>
                      ) : 'Määramata'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-5 h-5 text-[#40b236]" />
                  <div>
                    <p className="text-sm text-gray-400">Varustus</p>
                    <p className="font-medium">{video.equipment || 'Pole vaja'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-[#40b236]" />
                  <div>
                    <p className="text-sm text-gray-400">Kategooria</p>
                    <p className="font-medium capitalize">{video.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#40b236] text-lg">🔥</span>
                  <div>
                    <p className="text-sm text-gray-400">Energiakulu</p>
                    <p className="font-medium">{video.energyConsumption || 0} kcal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Music Copyrights */}
            {video.musicCopyrights && video.musicCopyrights.length > 0 && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#40b236] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-gray-300">Videos on kasutatud litsentseeritud muusikat</p>
                    <button 
                      onClick={() => setShowMusicList(!showMusicList)}
                      className="text-[#40b236] hover:text-green-500 text-sm font-medium mt-1 transition-colors flex items-center gap-1"
                    >
                      {showMusicList ? 'PEIDA LUGUDE NIMEKIRI' : 'VAATA LUGUDE NIMEKIRJA'}
                      <svg 
                        className={`w-4 h-4 transition-transform ${showMusicList ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {showMusicList && (
                  <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    {video.musicCopyrights.map((music, index) => (
                      <div key={music.id} className="bg-[#2c313a] rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500 text-sm">{index + 1}.</span>
                          <div className="flex-1">
                            <p className="font-medium text-white">{music.title}</p>
                            <p className="text-sm text-gray-400">{music.artist}</p>
                            {music.data && (() => {
                              try {
                                const data = JSON.parse(music.data)
                                return data.license && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {data.license} {data.year && `• ${data.year}`}
                                  </p>
                                )
                              } catch {
                                return null
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Related Videos */}
            {video.relatedVideos && video.relatedVideos.length > 0 && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Sarnased videod</h3>
                <div className="space-y-3">
                  {video.relatedVideos.map((relVideo) => (
                    <Link
                      key={relVideo.id}
                      href={`/videos/${relVideo.id}`}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <div className="flex gap-3">
                        <div className="w-24 h-14 bg-[#2c313a] rounded flex-shrink-0">
                          {relVideo.thumbnail && (
                            <img 
                              src={relVideo.thumbnail} 
                              alt={relVideo.title}
                              className="w-full h-full object-cover rounded"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{relVideo.title}</p>
                          <p className="text-xs text-gray-400">{relVideo.duration}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}