import { useRef, useCallback, useEffect } from 'react'

interface VideoTrackingOptions {
  videoId: number
  duration?: number
  onTimeUpdate?: (currentTime: number, watchedTime: number) => void
}

export function useVideoTracking({ videoId, duration, onTimeUpdate }: VideoTrackingOptions) {
  const watchedTimeRef = useRef(0)
  const lastUpdateTimeRef = useRef(0)
  const trackingIntervalRef = useRef<NodeJS.Timeout>()
  const lastSentTimeRef = useRef(0)
  const isPlayingRef = useRef(false)

  // Track video time and send periodic updates
  const trackTime = useCallback(async (watchTimeSeconds: number) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          watchTimeSeconds,
          totalDuration: duration,
          isComplete: duration ? watchTimeSeconds >= duration * 0.95 : false
        })
      })

      if (!response.ok) {
        console.error('Failed to track video time')
      }
    } catch (error) {
      console.error('Error tracking video time:', error)
    }
  }, [videoId, duration])

  // Start tracking when video plays
  const handlePlay = useCallback(() => {
    isPlayingRef.current = true
    lastUpdateTimeRef.current = Date.now()
    
    // Start periodic tracking (every 30 seconds)
    trackingIntervalRef.current = setInterval(() => {
      if (isPlayingRef.current) {
        const now = Date.now()
        const timeSinceLastUpdate = (now - lastUpdateTimeRef.current) / 1000
        watchedTimeRef.current += timeSinceLastUpdate
        lastUpdateTimeRef.current = now
        
        // Send update every 30 seconds of watch time
        if (watchedTimeRef.current - lastSentTimeRef.current >= 30) {
          trackTime(Math.round(watchedTimeRef.current))
          lastSentTimeRef.current = watchedTimeRef.current
        }
        
        // Call optional callback
        onTimeUpdate?.(watchedTimeRef.current, watchedTimeRef.current)
      }
    }, 5000) // Check every 5 seconds
  }, [trackTime, onTimeUpdate])

  // Pause tracking when video pauses
  const handlePause = useCallback(() => {
    isPlayingRef.current = false
    
    // Update watched time up to pause point
    if (lastUpdateTimeRef.current > 0) {
      const now = Date.now()
      const timeSinceLastUpdate = (now - lastUpdateTimeRef.current) / 1000
      watchedTimeRef.current += timeSinceLastUpdate
    }
    
    // Send current watched time
    if (watchedTimeRef.current > lastSentTimeRef.current) {
      trackTime(Math.round(watchedTimeRef.current))
      lastSentTimeRef.current = watchedTimeRef.current
    }
  }, [trackTime])

  // Handle video end
  const handleEnded = useCallback(() => {
    isPlayingRef.current = false
    
    // Update watched time and mark as complete
    if (lastUpdateTimeRef.current > 0) {
      const now = Date.now()
      const timeSinceLastUpdate = (now - lastUpdateTimeRef.current) / 1000
      watchedTimeRef.current += timeSinceLastUpdate
    }
    
    // Final tracking update
    trackTime(Math.round(watchedTimeRef.current))
  }, [trackTime])

  // Handle seeking (user jumps to different position)
  const handleSeeking = useCallback(() => {
    // Reset timer on seek to prevent inflated watch times
    lastUpdateTimeRef.current = Date.now()
  }, [])

  // Handle time update from video element
  const handleTimeUpdate = useCallback((currentTime: number) => {
    // Optional: could track actual playback position vs watched time
    onTimeUpdate?.(currentTime, watchedTimeRef.current)
  }, [onTimeUpdate])

  // Handle page visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlayingRef.current) {
        // Tab became hidden, pause tracking
        isPlayingRef.current = false
        
        // Clear interval to stop tracking
        if (trackingIntervalRef.current) {
          clearInterval(trackingIntervalRef.current)
        }
        
        // Update watched time up to this point
        if (lastUpdateTimeRef.current > 0) {
          const now = Date.now()
          const timeSinceLastUpdate = (now - lastUpdateTimeRef.current) / 1000
          watchedTimeRef.current += timeSinceLastUpdate
        }
        
        // Send current watched time
        if (watchedTimeRef.current > lastSentTimeRef.current) {
          trackTime(Math.round(watchedTimeRef.current))
          lastSentTimeRef.current = watchedTimeRef.current
        }
      } else if (!document.hidden && !isPlayingRef.current) {
        // Tab became visible again - but don't auto-resume tracking
      }
    }

    const handleWindowBlur = () => {
      if (isPlayingRef.current) {
        handleVisibilityChange()
      }
    }

    const handleWindowFocus = () => {
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', handleWindowFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [trackTime])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
      }
      
      // Send final update on unmount if there's unwatched time
      if (watchedTimeRef.current > lastSentTimeRef.current) {
        trackTime(Math.round(watchedTimeRef.current))
      }
    }
  }, [trackTime])

  // Reset tracking for new video
  useEffect(() => {
    watchedTimeRef.current = 0
    lastSentTimeRef.current = 0
    lastUpdateTimeRef.current = 0
    isPlayingRef.current = false
    
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current)
    }
  }, [videoId])

  return {
    handlePlay,
    handlePause,
    handleEnded,
    handleSeeking,
    handleTimeUpdate,
    getWatchedTime: () => watchedTimeRef.current
  }
}