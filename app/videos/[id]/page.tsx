'use client'

import { useState, useEffect, useRef } from 'react'
import { useVimeoPlayer } from '../../../hooks/useVimeoPlayer'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Eye, Clock, Dumbbell, Volume2, Info, Share2, ChevronLeft, Lock } from 'lucide-react'
import { useVideoTracking } from '../../../hooks/useVideoTracking'
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

function formatTimePosition(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
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
  console.log('🎬 VideoPage component rendered')
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const { user, isLoading: authLoading } = useAuth()
  
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Video tracking
  const videoTracking = useVideoTracking({
    videoId: parseInt(params.id as string),
    duration: video?.durationSeconds,
    onTimeUpdate: (currentTime, watchedTime) => {
      // Optional: could show progress or other UI updates
    }
  })
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTabHidden, setIsTabHidden] = useState(false)
  const [showMusicList, setShowMusicList] = useState(false)
  const [pausedPosition, setPausedPosition] = useState<number>(0)
  const iframeRef = useRef<HTMLDivElement>(null)
  const [vimeoTime, setVimeoTime] = useState<number>(0)
  
  // Use Vimeo Player API for iframe videos
  console.log('🎬 Setting up Vimeo Player hook, video?.iframe:', !!video?.iframe)
  const vimeoPlayer = useVimeoPlayer({
    enabled: !!video?.iframe,
    onPlay: () => {
      console.log('🎬 Vimeo play detected')
      setIsPlaying(true)
      videoTracking.handlePlay()
    },
    onPause: () => {
      console.log('🎬 Vimeo pause detected')
      setIsPlaying(false)
      videoTracking.handlePause()
    },
    onTimeUpdate: (seconds) => {
      console.log('🎬 Vimeo timeupdate:', seconds)
      setVimeoTime(seconds)
    },
    onEnded: () => {
      console.log('🎬 Vimeo video ended')
      setIsPlaying(false)
      videoTracking.handleEnded()
    }
  })

  // Sync isPlaying state with Vimeo player state
  useEffect(() => {
    if (video?.iframe && vimeoPlayer.isReady) {
      setIsPlaying(vimeoPlayer.isPlaying)
    }
  }, [vimeoPlayer.isPlaying, vimeoPlayer.isReady, video?.iframe])
  
  // Debug log for isTabHidden changes
  useEffect(() => {
    console.log('🎬 isTabHidden changed to:', isTabHidden)
  }, [isTabHidden])

  // Debug log for isPlaying changes
  useEffect(() => {
    console.log('🎬 isPlaying changed to:', isPlaying)
  }, [isPlaying])

  useEffect(() => {
    console.log('🎬 VideoPage useEffect triggered, params.id:', params.id)
    fetchVideo()
    fetchComments()
    // Reset tab hidden state on page load
    setIsTabHidden(false)
  }, [params.id])

  // Start tracking for iframe videos automatically (only on initial load)
  useEffect(() => {
    if (video?.iframe && !isTabHidden && !pausedPosition) {
      console.log('🎬 Starting automatic tracking for iframe video on initial load')
      // For iframe videos, assume they start playing automatically
      setIsPlaying(true)
      videoTracking.handlePlay()
      
      // Also check Vimeo player state after a delay
      setTimeout(async () => {
        if (vimeoPlayer.isReady) {
          try {
            const isPaused = await vimeoPlayer.getPaused()
            console.log('🎬 Initial Vimeo paused state check:', isPaused)
            setIsPlaying(!isPaused)
          } catch (e) {
            console.log('🎬 Could not check initial Vimeo state')
          }
        }
      }, 2000)
    }
  }, [video?.iframe]) // Remove isTabHidden from dependencies to prevent re-triggering

  // Store vimeoTime in a ref to avoid dependency issues
  const vimeoTimeRef = useRef(vimeoTime)
  useEffect(() => {
    vimeoTimeRef.current = vimeoTime
  }, [vimeoTime])
  
  // Store vimeoPlayer.isReady in a ref to avoid dependency issues
  const vimeoPlayerReadyRef = useRef(vimeoPlayer.isReady)
  useEffect(() => {
    vimeoPlayerReadyRef.current = vimeoPlayer.isReady
  }, [vimeoPlayer.isReady])

  // Handle page visibility changes for video element
  useEffect(() => {
    console.log('🎬 Setting up visibility change listeners, video?.iframe:', !!video?.iframe, 'vimeoPlayer.isReady:', vimeoPlayerReadyRef.current)
    
    const handleVisibilityChange = async () => {
      console.log('🎬 Visibility change detected, document.hidden:', document.hidden, 'isPlaying:', isPlaying)
      
      if (document.hidden) {
        console.log('🎬 Tab hidden - checking if we need to pause video, isPlaying:', isPlaying)
        
        // Get actual position based on video type
        let currentPosition = 0
        
        if (videoRef.current && !videoRef.current.paused) {
          // HTML5 video - use native currentTime
          currentPosition = videoRef.current.currentTime
          console.log('🎬 HTML5 video - saving position:', currentPosition)
          videoRef.current.pause()
        } else if (video?.iframe) {
          // Vimeo iframe - try to get position from player API or use state
          console.log('🎬 Vimeo player state - isReady:', vimeoPlayerReadyRef.current, 'vimeoTimeRef:', vimeoTimeRef.current)
          
          // Always try to pause if we have a Vimeo player
          if (vimeoPlayerReadyRef.current) {
            try {
              // Get current position first
              currentPosition = await vimeoPlayer.getCurrentTime()
              console.log('🎬 Vimeo video - actual position from API:', currentPosition)
              
              // Check if video is actually playing
              const isPaused = await vimeoPlayer.getPaused()
              console.log('🎬 Vimeo player isPaused before pause:', isPaused)
              
              // Always try to pause, even if already paused
              await vimeoPlayer.pause()
              console.log('🎬 Vimeo pause command sent')
              
              // Verify pause worked
              const isPausedAfter = await vimeoPlayer.getPaused()
              console.log('🎬 Vimeo player isPaused after pause:', isPausedAfter)
              
              // Set playing state based on actual status
              setIsPlaying(false)
            } catch (error) {
              console.error('🎬 Failed to pause Vimeo:', error)
              // Use current time from ref if API fails
              currentPosition = vimeoTimeRef.current
              console.log('🎬 Using vimeoTime from ref after error:', currentPosition)
            }
          } else {
            // Player not ready, use time from state
            currentPosition = vimeoTimeRef.current
            console.log('🎬 Vimeo player not ready, using vimeoTime from ref:', currentPosition)
            // Still try to set playing to false
            setIsPlaying(false)
          }
        } else {
          // Final fallback
          currentPosition = videoTracking.getWatchedTime()
          console.log('🎬 Final fallback - using tracking time:', currentPosition)
        }
        
        setPausedPosition(currentPosition)
        
        // Pause tracking
        videoTracking.handlePause()
        setIsPlaying(false)
        setIsTabHidden(true)
        console.log('🎬 Set isTabHidden to true, paused at:', currentPosition)
      } else {
        // Tab became visible again
        console.log('🎬 Tab visible')
        setIsTabHidden(prevHidden => {
          if (prevHidden) {
            console.log('🎬 Was hidden, now showing overlay for resume')
            // Keep overlay visible until user clicks resume
            return true
          }
          return prevHidden
        })
      }
    }

    // Add window blur/focus listeners for better cross-browser support
    const handleWindowBlur = () => {
      if (!document.hidden) {
        console.log('🎬 Window lost focus - triggering visibility change')
        handleVisibilityChange()
      }
    }

    const handleWindowFocus = () => {
      console.log('🎬 Window gained focus')
    }

    // Add page hide/show listeners for better mobile support
    const handlePageHide = () => {
      console.log('🎬 Page hide - pausing video')
      handleVisibilityChange()
    }

    const handlePageShow = () => {
      console.log('🎬 Page show')
    }

    console.log('🎬 Adding event listeners for tab switching')
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('pageshow', handlePageShow)
    console.log('🎬 Event listeners added successfully')
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', handleWindowFocus)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [videoTracking.handlePause, videoTracking.getWatchedTime, video?.iframe])

  // Debug effect to log state changes
  useEffect(() => {
    console.log('🎬 State changed - video:', !!video, 'iframe:', !!video?.iframe, 'vimeoReady:', vimeoPlayer.isReady, 'isPlaying:', isPlaying, 'isTabHidden:', isTabHidden)
  }, [video, video?.iframe, vimeoPlayer.isReady, isPlaying, isTabHidden])

  const fetchVideo = async () => {
    try {
      setLoading(true)
      console.log('🎬 Fetching video data for ID:', params.id)
      const response = await fetch(`/api/videos/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Video not found')
      }
      
      const data = await response.json()
      console.log('🎬 Video data loaded:', {
        id: data.id,
        title: data.title,
        iframe: !!data.iframe,
        vimeoId: data.vimeoId,
        isFree: data.isFree,
        isPremium: data.isPremium
      })
      setVideo(data)
    } catch (err: any) {
      console.error('🎬 Failed to fetch video:', err)
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
    console.log('Like clicked')
  }

  const handleFavorite = async () => {
    // TODO: Implement favorite functionality
    console.log('Favorite clicked')
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return
    
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
                          .replace(/autopause=0/, 'autopause=1&amp;autoplay=0')
                          .replace(/allow="([^"]*)"/, 'allow="$1; autopause"')
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
                        setIsTabHidden(false)
                        videoTracking.handlePlay()
                      }}
                      onPause={() => {
                        setIsPlaying(false)
                        videoTracking.handlePause()
                      }}
                      onEnded={() => {
                        setIsPlaying(false)
                        videoTracking.handleEnded()
                      }}
                      onSeeking={videoTracking.handleSeeking}
                      onTimeUpdate={(e) => {
                        const currentTime = (e.target as HTMLVideoElement).currentTime
                        videoTracking.handleTimeUpdate(currentTime)
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

                  {/* Tab Hidden Overlay - always present but conditionally visible */}
                  <div 
                    className={`absolute inset-0 bg-[#3e4551] bg-opacity-95 rounded-lg flex items-center justify-center transition-opacity duration-300 z-50 ${
                      isTabHidden ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4">⏸️</div>
                      <p className="text-xl mb-2">Video peatati tab-ist lahkumisel</p>
                      <p className="text-lg mb-4 text-gray-300">
                        Peatatud kohal: <span className="font-bold text-[#40b236]">{formatTimePosition(pausedPosition)}</span>
                      </p>
                      <button
                        onClick={async () => {
                          console.log('🎬 Resume video button clicked')
                          console.log('🎬 Resuming from position:', pausedPosition)
                          console.log('🎬 Video iframe exists:', !!video?.iframe)
                          console.log('🎬 Vimeo player ready:', vimeoPlayer.isReady)
                          
                          // First hide the overlay
                          setIsTabHidden(false)
                          
                          if (video?.iframe && vimeoPlayer.isReady) {
                            // Use Vimeo Player API to set position and resume
                            console.log('🎬 Using Vimeo Player API to resume at:', pausedPosition)
                            
                            if (pausedPosition > 0) {
                              // Set the video time using Vimeo API
                              await vimeoPlayer.setVideoTime(pausedPosition)
                              console.log('🎬 Set Vimeo video time to:', pausedPosition)
                            }
                            
                            // Play the video
                            await vimeoPlayer.play()
                            setIsPlaying(true)
                            videoTracking.handlePlay()
                            console.log('🎬 Vimeo video resumed via API')
                            
                          } else if (videoRef.current) {
                            // HTML5 video logic
                            setTimeout(() => {
                              if (videoRef.current && pausedPosition > 0) {
                                console.log('🎬 Setting HTML5 video currentTime to:', pausedPosition)
                                videoRef.current.currentTime = pausedPosition
                                
                                setTimeout(() => {
                                  if (videoRef.current) {
                                    console.log('🎬 Attempting to resume HTML5 playback')
                                    videoRef.current.play()
                                      .then(() => {
                                        console.log('🎬 HTML5 video resumed successfully')
                                        setIsPlaying(true)
                                        videoTracking.handlePlay()
                                      })
                                      .catch((error) => {
                                        console.log('🎬 Auto-play failed, user interaction required:', error)
                                      })
                                  }
                                }, 100)
                              } else if (videoRef.current) {
                                // Play from beginning if no saved position
                                console.log('🎬 Playing HTML5 video from beginning')
                                videoRef.current.play()
                                  .then(() => {
                                    console.log('🎬 HTML5 video started successfully')
                                    setIsPlaying(true)
                                    videoTracking.handlePlay()
                                  })
                                  .catch((error) => {
                                    console.log('🎬 Auto-play failed, user interaction required:', error)
                                  })
                              }
                            }, 50)
                          } else {
                            console.log('🎬 No video element found to resume')
                          }
                        }}
                        className="px-6 py-3 bg-[#40b236] hover:bg-[#60cc56] text-white font-semibold rounded-lg transition-colors"
                      >
                        Jätka vaatamist
                      </button>
                      
                      {/* Test button for debugging */}
                      <button
                        onClick={() => {
                          console.log('🎬 Test button clicked - simulating tab switch')
                          document.dispatchEvent(new Event('visibilitychange'))
                        }}
                        className="mt-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Test Tab Switch
                      </button>
                      
                      {/* Test button for manual pause */}
                      <button
                        onClick={async () => {
                          console.log('🎬 Manual pause button clicked')
                          if (video?.iframe && vimeoPlayer.isReady) {
                            try {
                              console.log('🎬 Attempting manual pause via Vimeo API')
                              await vimeoPlayer.pause()
                              console.log('🎬 Manual pause successful')
                            } catch (error) {
                              console.error('🎬 Manual pause failed:', error)
                            }
                          } else {
                            console.log('🎬 Cannot pause - iframe:', !!video?.iframe, 'player ready:', vimeoPlayer.isReady)
                          }
                        }}
                        className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Manual Pause
                      </button>
                      
                      {/* Test button for checking player state */}
                      <button
                        onClick={async () => {
                          console.log('🎬 Check player state button clicked')
                          console.log('🎬 Video iframe exists:', !!video?.iframe)
                          console.log('🎬 Vimeo player ready:', vimeoPlayer.isReady)
                          console.log('🎬 Vimeo player isPlaying:', vimeoPlayer.isPlaying)
                          console.log('🎬 Local isPlaying state:', isPlaying)
                          
                          if (video?.iframe && vimeoPlayer.isReady) {
                            try {
                              const isPaused = await vimeoPlayer.getPaused()
                              console.log('🎬 Vimeo player isPaused:', isPaused)
                            } catch (error) {
                              console.error('🎬 Failed to get paused state:', error)
                            }
                          }
                        }}
                        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Check Player State
                      </button>
                      
                      {/* Test button for forcing tab switch */}
                      <button
                        onClick={() => {
                          console.log('🎬 Force tab switch button clicked')
                          // Force document.hidden to true
                          Object.defineProperty(document, 'hidden', {
                            writable: true,
                            value: true
                          })
                          // Dispatch visibility change event
                          document.dispatchEvent(new Event('visibilitychange'))
                          console.log('🎬 Forced tab switch - document.hidden:', document.hidden)
                        }}
                        className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Force Tab Switch
                      </button>
                      
                      {/* Test button for checking iframe */}
                      <button
                        onClick={() => {
                          console.log('🎬 Check iframe button clicked')
                          const iframe = document.querySelector('iframe[src*="vimeo.com"]')
                          console.log('🎬 Found iframe:', !!iframe)
                          if (iframe) {
                            console.log('🎬 Iframe src:', iframe.src)
                            console.log('🎬 Iframe allow:', iframe.allow)
                          }
                        }}
                        className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Check Iframe
                      </button>
                      
                      {/* Test button for checking all states */}
                      <button
                        onClick={() => {
                          console.log('🎬 Check all states button clicked')
                          console.log('🎬 Video data:', {
                            id: video?.id,
                            title: video?.title,
                            iframe: !!video?.iframe,
                            vimeoId: video?.vimeoId,
                            isFree: video?.isFree,
                            isPremium: video?.isPremium
                          })
                          console.log('🎬 Vimeo player state:', {
                            isReady: vimeoPlayer.isReady,
                            isPlaying: vimeoPlayer.isPlaying,
                            currentTime: vimeoPlayer.currentTime
                          })
                          console.log('🎬 Local state:', {
                            isPlaying,
                            isTabHidden,
                            pausedPosition
                          })
                        }}
                        className="mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Check All States
                      </button>
                      
                      {/* Test button for checking event listeners */}
                      <button
                        onClick={() => {
                          console.log('🎬 Check event listeners button clicked')
                          console.log('🎬 Document hidden:', document.hidden)
                          console.log('🎬 Document visibilityState:', document.visibilityState)
                          console.log('🎬 Window focused:', document.hasFocus())
                          
                          // Test if we can dispatch events
                          const testEvent = new Event('visibilitychange')
                          document.dispatchEvent(testEvent)
                          console.log('🎬 Dispatched test visibilitychange event')
                        }}
                        className="mt-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Check Event Listeners
                      </button>
                      
                      {/* Test button for checking iframe autopause */}
                      <button
                        onClick={() => {
                          console.log('🎬 Check iframe autopause button clicked')
                          const iframe = document.querySelector('iframe[src*="vimeo.com"]')
                          if (iframe) {
                            console.log('🎬 Iframe src:', iframe.src)
                            console.log('🎬 Iframe allow:', iframe.allow)
                            
                            // Check if autopause is enabled
                            const hasAutopause = iframe.src.includes('autopause=1')
                            console.log('🎬 Has autopause in src:', hasAutopause)
                            
                            // Check if autopause is in allow attribute
                            const allowAutopause = iframe.allow?.includes('autopause')
                            console.log('🎬 Has autopause in allow:', allowAutopause)
                          } else {
                            console.log('🎬 No Vimeo iframe found')
                          }
                        }}
                        className="mt-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Check Iframe Autopause
                      </button>
                    </div>
                  </div>
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