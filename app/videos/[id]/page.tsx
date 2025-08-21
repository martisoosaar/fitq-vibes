'use client'

import { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react'
import { useVimeoPlayer } from '../../../hooks/useVimeoPlayer'
import { useVimeoPlayerSimple } from '../../../hooks/useVimeoPlayerSimple'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Eye, Clock, Dumbbell, Volume2, Info, Share2, ChevronLeft, Lock } from 'lucide-react'
import WatchTimeDisplay from '../../../components/Video/WatchTimeDisplay'
import ResumeModal from '../../../components/Video/ResumeModal'
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

// Memoized Vimeo iframe component to prevent re-renders
const VimeoIframe = memo(({ iframeHtml, videoId }: { iframeHtml: string, videoId: number }) => {
  const iframeRef = useRef<HTMLDivElement>(null)
  
  // Ensure the iframe has the API enabled
  let modifiedHtml = iframeHtml
    .replace(/width="\d+"/, 'width="100%"')
    .replace(/height="\d+"/, 'height="100%"')
    .replace('<iframe', '<iframe id="vimeo-player"')
  
  // Add api=1 parameter if not present
  if (!modifiedHtml.includes('api=1')) {
    modifiedHtml = modifiedHtml.replace(
      /src="([^"]+)"/,
      (match, url) => {
        const separator = url.includes('?') ? '&' : '?'
        return `src="${url}${separator}api=1"`
      }
    )
  }
  
  return (
    <div 
      ref={iframeRef}
      className="w-full h-full"
      key={`iframe-${videoId}`}
      dangerouslySetInnerHTML={{ 
        __html: modifiedHtml
      }}
    />
  )
})

VimeoIframe.displayName = 'VimeoIframe'

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const { user, isLoading: authLoading } = useAuth()
  
  console.log('🎥 VideoPage rendered, user:', user?.id, 'authLoading:', authLoading)
  
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Removed all video tracking code
  
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTimerPlaying, setIsTimerPlaying] = useState(false) // Separate state for timer
  const [showMusicList, setShowMusicList] = useState(false)
  const [watchedTime, setWatchedTime] = useState(0)
  
  // Debug watchedTime changes
  useEffect(() => {
    console.log('⏱️ watchedTime state changed to:', watchedTime)
  }, [watchedTime])
  const [resetWatch, setResetWatch] = useState(false)
  const [videoPosition, setVideoPosition] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [viewId, setViewId] = useState<number | null>(null)
  const [lastSavedTime, setLastSavedTime] = useState(0)
  const [shouldResume, setShouldResume] = useState(false)
  const [resumePosition, setResumePosition] = useState(0)
  const [resumeWatchTime, setResumeWatchTime] = useState(0)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [resumeData, setResumeData] = useState<{
    viewId: number
    playheadPosition: number
    watchTimeSeconds: number
    updatedAt?: string
  } | null>(null)
  
  // Check if user has access to watch the video
  const hasAccess = useMemo(() => {
    if (!video) return false
    if (video.isFree) return true
    if (!user) return false
    if (video.openForSubscribers && user) return true
    // For now, allow access to all logged-in users for testing
    // TODO: Add proper subscription check
    return !!user
  }, [video, user])
  
  // Use Vimeo Player hook for iframe videos
  const vimeoPlayer = useVimeoPlayer({
    enabled: !!video?.iframe,
    onPlay: () => {
      console.log('VIMEO: Play event triggered')
      setIsPlaying(true)
      setIsTimerPlaying(true) // Start timer
    },
    onPause: () => {
      console.log('VIMEO: Pause event triggered')
      setIsPlaying(false)
      setIsTimerPlaying(false) // Stop timer
    },
    onEnded: () => {
      console.log('VIMEO: Ended event triggered')
      setIsPlaying(false)
      setIsTimerPlaying(false) // Stop timer
    },
    onTimeUpdate: (seconds) => {
      // We track our own watched time, not video position
    }
  })
  
  // Also use simple Vimeo detector as fallback
  const simpleVimeo = useVimeoPlayerSimple({
    enabled: !!video?.iframe, // Enable immediately for iframe videos
    onPlay: () => {
      console.log('SIMPLE: Play detected!')
      setIsTimerPlaying(true)
    },
    onPause: () => {
      console.log('SIMPLE: Pause detected!')
      setIsTimerPlaying(false)
    },
    onTimeUpdate: (seconds, duration) => {
      // Only log every 10 seconds to avoid spam
      if (Math.floor(seconds) % 10 === 0 && Math.floor(seconds) !== Math.floor(videoPosition)) {
        console.log('SIMPLE: Time update received:', seconds.toFixed(1), '/', duration.toFixed(1))
      }
      setVideoPosition(seconds)
      if (duration > 0) {
        setVideoDuration(duration)
      }
    }
  })

  

  useEffect(() => {
    console.log('🔄 Main useEffect triggered for video:', params.id)
    fetchVideo()
    fetchComments()
    // Reset watch timer when video changes
    setWatchedTime(0)
    setResetWatch(true)
    setTimeout(() => setResetWatch(false), 100)
    setViewId(null)
    setLastSavedTime(0)
    setHasCheckedSession(false) // Reset session check for new video
    setSessionReady(false)
    setShouldResume(false)
    setResumePosition(0)
    setResumeWatchTime(0)
    setShowResumeModal(false)
    setResumeData(null)
  }, [params.id])
  
  // Check for resumable session when page loads
  const [hasCheckedSession, setHasCheckedSession] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  
  useEffect(() => {
    // Check for existing session when video and user are ready
    if (!hasCheckedSession && video && user && hasAccess) {
      console.log('🔍 Checking for existing viewing session')
      checkForExistingSession()
      setHasCheckedSession(true)
    }
  }, [hasCheckedSession, video?.id, user?.id, hasAccess])
  
  // Start new session when play is clicked (if no existing session)
  useEffect(() => {
    // Only start session when video is playing and session is ready
    if (isTimerPlaying && sessionReady && !viewId && video && user && hasAccess) {
      console.log('🎬 Video started playing, initiating new viewing session')
      startViewingSession(false)
    }
  }, [isTimerPlaying, sessionReady, viewId, video?.id, user?.id, hasAccess])
  
  // Save progress when leaving page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (viewId) {
        updateViewProgress()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Save final progress when component unmounts
      if (viewId) {
        updateViewProgress()
      }
    }
  }, [viewId, watchedTime, videoPosition])
  
  // Handle tab/window visibility changes
  const [wasPlayingBeforeHidden, setWasPlayingBeforeHidden] = useState(false)
  const [isTabSwitchResume, setIsTabSwitchResume] = useState(false)
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (user switched tab/window)
        console.log('👁️ Page hidden, pausing video')
        
        // Remember if video was playing
        if (isTimerPlaying) {
          setWasPlayingBeforeHidden(true)
          // Pause the video
          setIsTimerPlaying(false)
          
          // Save progress
          if (viewId) {
            updateViewProgress()
          }
          
          // Pause Vimeo player if it exists
          const iframe = document.querySelector('iframe[src*="vimeo"]') as HTMLIFrameElement
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
              JSON.stringify({ method: 'pause' }),
              '*'
            )
          }
          
          // Pause HTML5 video if it exists
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause()
          }
        }
      } else {
        // Page is visible again
        console.log('👁️ Page visible again')
        
        // If video was playing before and user has an active session, show resume modal
        if (wasPlayingBeforeHidden && viewId) {
          setWasPlayingBeforeHidden(false)
          
          // Show resume modal with current position
          setResumeData({
            viewId: viewId,
            playheadPosition: videoPosition,
            watchTimeSeconds: watchedTime,
            updatedAt: new Date().toISOString()
          })
          setIsTabSwitchResume(true)
          setShowResumeModal(true)
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isTimerPlaying, viewId, videoPosition, watchedTime, wasPlayingBeforeHidden])

  // Sync isPlaying state for Vimeo player
  useEffect(() => {
    if (video?.iframe && vimeoPlayer.isReady) {
      console.log('🎬 Vimeo player state sync:', {
        vimeoIsPlaying: vimeoPlayer.isPlaying,
        isReady: vimeoPlayer.isReady,
        currentIsPlaying: isPlaying
      })
      setIsPlaying(vimeoPlayer.isPlaying)
    }
  }, [vimeoPlayer.isPlaying, vimeoPlayer.isReady, video?.iframe])
  
  // Debug isPlaying changes
  useEffect(() => {
    console.log('🎮 isPlaying state changed to:', isPlaying)
  }, [isPlaying])
  
  // Debug timer playing state
  useEffect(() => {
    console.log('⏰ isTimerPlaying state changed to:', isTimerPlaying)
  }, [isTimerPlaying])
  
  // Handle video resume when player is ready
  useEffect(() => {
    if (shouldResume && resumePosition > 0) {
      console.log('🔄 Attempting to resume video at position:', resumePosition)
      
      // For Vimeo player
      if (video?.iframe && simpleVimeo.isReady) {
        console.log('📺 Vimeo player is ready, seeking to:', resumePosition)
        // Use postMessage to seek
        const iframe = document.querySelector('iframe[src*="vimeo"]') as HTMLIFrameElement
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            JSON.stringify({ method: 'setCurrentTime', value: resumePosition }),
            '*'
          )
          // Clear the resume flag after seeking
          setShouldResume(false)
        }
      }
      // For HTML5 video
      else if (video?.playbackUrl && videoRef.current && videoRef.current.readyState >= 2) {
        console.log('📺 HTML5 video ready, seeking to:', resumePosition)
        videoRef.current.currentTime = resumePosition
        setShouldResume(false)
      }
    }
  }, [shouldResume, resumePosition, video, simpleVimeo.isReady, videoRef.current?.readyState])

  // Handle watch time update
  const handleWatchTimeUpdate = (seconds: number) => {
    setWatchedTime(seconds)
    
    // Save progress every 10 seconds
    if (seconds - lastSavedTime >= 10) {
      console.log('⏰ Time to save progress:', seconds, 'last saved:', lastSavedTime, 'viewId:', viewId)
      if (viewId) {
        updateViewProgress()
        setLastSavedTime(seconds)
      } else {
        console.log('❌ Cannot save progress - no viewId set')
      }
    }
  }
  
  // Check for existing session on page load
  const checkForExistingSession = async () => {
    if (!user || !video) return
    
    console.log('🔍 Checking for existing session for video:', video.id)
    
    try {
      const response = await fetch(`/api/videos/${video.id}/view/check`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Session check result:', data)
        
        if (data.hasResumableSession && data.playheadPosition > 0) {
          // Show modal for resumable session
          setResumeData({
            viewId: data.viewId,
            playheadPosition: data.playheadPosition,
            watchTimeSeconds: data.watchTimeSeconds,
            updatedAt: data.updatedAt
          })
          setShowResumeModal(true)
        } else {
          // No resumable session, ready to start new one when play is clicked
          setSessionReady(true)
        }
      } else {
        // Error checking session, allow new session
        setSessionReady(true)
      }
    } catch (error) {
      console.error('Error checking for existing session:', error)
      setSessionReady(true)
    }
  }
  
  // Start or resume viewing session
  const startViewingSession = async (forceNewSession = false) => {
    if (!user || !video) return
    
    console.log('🎬 Starting viewing session for video:', video.id, 'user:', user.id)
    
    try {
      const response = await fetch(`/api/videos/${video.id}/view/start`, {
        method: 'POST',
        credentials: 'include', // Use cookies for auth
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ forceNew: forceNewSession })
      })
      
      console.log('🎬 Start session response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🎬 Session started:', data)
        
        // Just set the session ID - modal check was already done on page load
        setViewId(data.viewId)
        if (!forceNewSession && data.watchTimeSeconds > 0) {
          // Resume with existing watch time
          setWatchedTime(data.watchTimeSeconds)
          setLastSavedTime(data.watchTimeSeconds)
        }
      } else {
        const errorText = await response.text()
        console.error('Failed to start session:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error starting viewing session:', error)
    }
  }
  
  // Update viewing progress
  const updateViewProgress = async (forceComplete: boolean = false) => {
    if (!viewId || !user || !video) return
    
    console.log('📊 Updating progress - viewId:', viewId, 'watched:', watchedTime, 'position:', videoPosition)
    
    try {
      // Check if video should be marked as complete
      let isComplete = forceComplete
      if (videoDuration > 0) {
        const percentageWatched = (videoPosition / videoDuration) * 100
        
        if (videoDuration > 300) { // More than 5 minutes
          isComplete = isComplete || percentageWatched >= 90
        } else { // 5 minutes or less
          isComplete = isComplete || percentageWatched >= 80
        }
      }
      
      // Cap watch time and playhead to not exceed video duration
      const videoDurationSeconds = video.durationSeconds || videoDuration || 0
      const cappedWatchTime = Math.min(Math.round(watchedTime), videoDurationSeconds)
      const cappedPlayhead = Math.min(videoPosition, videoDurationSeconds)
      
      if (watchedTime > videoDurationSeconds && videoDurationSeconds > 0) {
        console.warn(`Watch time (${watchedTime}s) exceeds video duration (${videoDurationSeconds}s). Capping to duration.`)
      }
      
      const updateData = {
        viewId,
        watchTimeSeconds: cappedWatchTime,
        playheadPosition: cappedPlayhead,
        isComplete
      }
      
      console.log('📊 Sending update:', updateData)
      
      const response = await fetch(`/api/videos/${video.id}/view/update`, {
        method: 'POST',
        credentials: 'include', // Use cookies for auth
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      console.log('📊 Update response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Update successful:', data)
        if (data.isComplete) {
          console.log('✅ Video marked as complete')
          // Reset viewing session if complete
          setViewId(null)
        }
      } else {
        const errorText = await response.text()
        console.error('Failed to update progress:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error updating view progress:', error)
    }
  }
  
  // Handle resume modal actions
  const handleResumeVideo = async () => {
    if (!resumeData) return
    
    console.log('📺 User chose to resume from position:', resumeData.playheadPosition, 'with watch time:', resumeData.watchTimeSeconds)
    
    // Reopen the existing session
    try {
      const response = await fetch(`/api/videos/${video.id}/view/resume`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ viewId: resumeData.viewId })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📺 Session resumed:', data)
        
        setViewId(data.viewId)
        setShouldResume(true)
        setResumePosition(data.playheadPosition)
        console.log('📺 Setting watched time to:', data.watchTimeSeconds)
        setWatchedTime(data.watchTimeSeconds) // Continue watch time from saved position
        setLastSavedTime(data.watchTimeSeconds)
        // Force reset to false after setting watch time
        setResetWatch(false)
        setShowResumeModal(false)
        setResumeData(null)
        setIsTabSwitchResume(false)
        setSessionReady(true) // Ready to continue tracking
        
        // Auto-play the video after resuming
        setTimeout(() => {
          console.log('▶️ Auto-playing video after resume')
          
          // For Vimeo player
          const iframe = document.querySelector('iframe[src*="vimeo"]') as HTMLIFrameElement
          if (iframe && iframe.contentWindow) {
            // First seek to position, then play
            iframe.contentWindow.postMessage(
              JSON.stringify({ method: 'setCurrentTime', value: data.playheadPosition }),
              '*'
            )
            setTimeout(() => {
              iframe.contentWindow.postMessage(
                JSON.stringify({ method: 'play' }),
                '*'
              )
            }, 500)
          }
          
          // For HTML5 video
          if (videoRef.current) {
            videoRef.current.currentTime = data.playheadPosition
            videoRef.current.play()
          }
          
          // Start the timer
          setIsTimerPlaying(true)
        }, 500)
      }
    } catch (error) {
      console.error('Error resuming session:', error)
      // Fallback: use local data
      setViewId(resumeData.viewId)
      setShouldResume(true)
      setResumePosition(resumeData.playheadPosition)
      setWatchedTime(resumeData.watchTimeSeconds)
      setLastSavedTime(resumeData.watchTimeSeconds)
      setShowResumeModal(false)
      setResumeData(null)
      setIsTabSwitchResume(false)
      setSessionReady(true)
      
      // Auto-play even in fallback
      setTimeout(() => {
        console.log('▶️ Auto-playing video after resume (fallback)')
        
        const iframe = document.querySelector('iframe[src*="vimeo"]') as HTMLIFrameElement
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            JSON.stringify({ method: 'setCurrentTime', value: resumeData.playheadPosition }),
            '*'
          )
          setTimeout(() => {
            iframe.contentWindow.postMessage(
              JSON.stringify({ method: 'play' }),
              '*'
            )
          }, 500)
        }
        
        if (videoRef.current) {
          videoRef.current.currentTime = resumeData.playheadPosition
          videoRef.current.play()
        }
        
        setIsTimerPlaying(true)
      }, 500)
    }
  }
  
  const handleStartOver = async () => {
    console.log('🔄 User chose to start from beginning')
    setShowResumeModal(false)
    setResumeData(null)
    setIsTabSwitchResume(false)
    // Create a new session
    const response = await startViewingSession(true)
    setSessionReady(true) // Ready to start tracking
    
    // Auto-play the video from the beginning
    setTimeout(() => {
      console.log('▶️ Auto-playing video from beginning')
      
      // For Vimeo iframe
      const iframe = document.querySelector('iframe[src*="vimeo"]') as HTMLIFrameElement
      if (iframe && iframe.contentWindow) {
        // First set to beginning
        iframe.contentWindow.postMessage(
          JSON.stringify({ method: 'setCurrentTime', value: 0 }),
          '*'
        )
        // Then play
        setTimeout(() => {
          iframe.contentWindow.postMessage(
            JSON.stringify({ method: 'play' }),
            '*'
          )
        }, 500)
      }
      
      // For HTML5 video
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play()
      }
      
      // Start the timer
      setIsTimerPlaying(true)
    }, 500)
  }


  const fetchVideo = async () => {
    console.log('📹 Fetching video:', params.id)
    try {
      setLoading(true)
      const response = await fetch(`/api/videos/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Video not found')
      }
      
      const data = await response.json()
      console.log('📺 VIDEO DATA:', {
        id: data.id,
        hasIframe: !!data.iframe,
        iframeContent: data.iframe ? data.iframe.substring(0, 100) + '...' : null,
        hasPlaybackUrl: !!data.playbackUrl,
        playbackUrl: data.playbackUrl,
        isFree: data.isFree,
        openForSubscribers: data.openForSubscribers
      })
      console.log('📺 Setting video state with data:', data)
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
      {/* Resume Modal */}
      <ResumeModal
        isOpen={showResumeModal}
        onClose={() => {
          setShowResumeModal(false)
          setIsTabSwitchResume(false)
        }}
        onResume={handleResumeVideo}
        onStartOver={handleStartOver}
        playheadPosition={resumeData?.playheadPosition || 0}
        lastWatchedDate={resumeData?.updatedAt}
        isTabSwitch={isTabSwitchResume}
      />
      
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
                    <VimeoIframe iframeHtml={video.iframe} videoId={video.id} />
                  ) : video.playbackUrl ? (
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      controls
                      poster={video.thumbnail}
                      onPlay={() => {
                        console.log('🎥 HTML5 VIDEO: Play event triggered')
                        setIsPlaying(true)
                        setIsTimerPlaying(true) // Start timer
                      }}
                      onPause={() => {
                        console.log('🎥 HTML5 VIDEO: Pause event triggered')
                        setIsPlaying(false)
                        setIsTimerPlaying(false) // Stop timer
                      }}
                      onEnded={() => {
                        console.log('🎥 HTML5 VIDEO: Ended event triggered')
                        setIsPlaying(false)
                        setIsTimerPlaying(false) // Stop timer
                      }}
                      onLoadedMetadata={() => {
                        console.log('🎥 HTML5 VIDEO: Metadata loaded')
                      }}
                      onTimeUpdate={(e) => {
                        // Log only once per second to avoid spam
                        const currentTime = Math.floor(e.currentTarget.currentTime)
                        if (currentTime % 5 === 0 && currentTime > 0) {
                          console.log('🎥 HTML5 VIDEO: Time update', currentTime)
                        }
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

            {/* Watch Time Display for Mobile - Above video title */}
            <div className="lg:hidden">
              <WatchTimeDisplay 
                key={`timer-${viewId}-${watchedTime}`}
                isPlaying={isTimerPlaying}
                onTimeUpdate={handleWatchTimeUpdate}
                onReset={resetWatch}
                currentVideoTime={videoPosition}
                videoDuration={videoDuration}
                initialWatchTime={watchedTime}
              />
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
            {/* Resume notification */}
            {shouldResume && resumePosition > 0 && (
              <div className="bg-blue-600 rounded-lg p-4 mb-4">
                <p className="text-white text-sm">
                  📺 Video jätkub kohalt {Math.floor(resumePosition / 60)}:{Math.floor(resumePosition % 60).toString().padStart(2, '0')}
                </p>
                <button
                  onClick={() => setShouldResume(false)}
                  className="text-white/80 text-xs hover:text-white mt-1"
                >
                  Sulge teade
                </button>
              </div>
            )}
            
            
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