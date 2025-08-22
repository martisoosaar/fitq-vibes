'use client'

import { useEffect, useState, useRef } from 'react'
import { Clock } from 'lucide-react'

interface WatchTimeDisplayProps {
  isPlaying: boolean
  onTimeUpdate?: (watchedSeconds: number) => void
  onReset?: boolean
  currentVideoTime?: number  // Current position in video
  videoDuration?: number     // Total video duration
  initialWatchTime?: number  // Initial watch time for resuming
}

export default function WatchTimeDisplay({ 
  isPlaying, 
  onTimeUpdate,
  onReset = false,
  currentVideoTime = 0,
  videoDuration = 0,
  initialWatchTime = 0
}: WatchTimeDisplayProps) {
  const [watchedSeconds, setWatchedSeconds] = useState(initialWatchTime)
  const intervalRef = useRef<NodeJS.Timeout>()
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const lastInitialTimeRef = useRef<number>(initialWatchTime)
  
  // Debug prop changes
  useEffect(() => {
    console.log('⏱️ WatchTimeDisplay received isPlaying:', isPlaying)
  }, [isPlaying])

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (isPlaying) {
      // Don't start timer if already at video duration
      if (videoDuration > 0 && watchedSeconds >= videoDuration) {
        console.log('⏱️ Watch time already at video duration, not starting timer')
        return
      }
      
      // Start tracking time
      lastUpdateTimeRef.current = Date.now()
      
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const timeDiff = (now - lastUpdateTimeRef.current) / 1000
        lastUpdateTimeRef.current = now
        
        setWatchedSeconds(prev => {
          let newTime = prev + timeDiff
          // Cap watch time to video duration if duration is known
          if (videoDuration > 0) {
            newTime = Math.min(newTime, videoDuration)
            // Stop timer if we've reached the duration
            if (newTime >= videoDuration && intervalRef.current) {
              clearInterval(intervalRef.current)
              console.log('⏱️ Reached video duration, stopping watch timer')
            }
          }
          return newTime
        })
      }, 100) // Update every 100ms for smooth display
    } else {
      // Stop tracking
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, videoDuration, watchedSeconds])

  // Call onTimeUpdate when watchedSeconds changes
  useEffect(() => {
    if (onTimeUpdate && watchedSeconds > 0) {
      onTimeUpdate(watchedSeconds)
    }
  }, [watchedSeconds, onTimeUpdate])

  // Reset timer when video changes or on demand
  useEffect(() => {
    if (onReset) {
      // Only reset if we're not resuming (initialWatchTime would be > 0 when resuming)
      if (initialWatchTime === 0) {
        setWatchedSeconds(0)
        lastUpdateTimeRef.current = Date.now()
      }
    }
  }, [onReset, initialWatchTime])
  
  // Update watched seconds when initial watch time changes (for resume)
  useEffect(() => {
    // Only update if initialWatchTime has actually changed
    if (initialWatchTime !== lastInitialTimeRef.current) {
      console.log('⏱️ Initial watch time changed from', lastInitialTimeRef.current, 'to:', initialWatchTime)
      if (initialWatchTime > 0) {
        console.log('⏱️ Setting watch time to:', initialWatchTime)
        setWatchedSeconds(initialWatchTime)
        lastUpdateTimeRef.current = Date.now() // Reset the timer reference
      } else if (initialWatchTime === 0 && lastInitialTimeRef.current > 0) {
        // Reset to 0 when explicitly set to 0
        setWatchedSeconds(0)
        lastUpdateTimeRef.current = Date.now()
      }
      lastInitialTimeRef.current = initialWatchTime
    }
  }, [initialWatchTime])

  return (
    <div className="bg-[#3e4551] rounded-lg p-4 mb-4">
      {/* Watched time display */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#40b236]" />
          <span className="text-gray-400 text-sm">Vaadatud aeg:</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-xl tabular-nums">
            {formatTime(watchedSeconds)}
          </span>
          {isPlaying && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
      
      {/* Video position display */}
      <div className="flex items-center justify-between border-t border-gray-600 pt-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#40b236]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-400 text-sm">Video positsioon:</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg tabular-nums">
            {formatTime(currentVideoTime)}
          </span>
          {videoDuration > 0 && (
            <span className="text-gray-500 text-sm">
              / {formatTime(videoDuration)}
            </span>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      {videoDuration > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-[#40b236] h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentVideoTime / videoDuration) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">
              {Math.round((currentVideoTime / videoDuration) * 100)}% vaadatud
            </span>
            <span className="text-xs text-gray-500">
              Kokku vaadatud: {Math.round((watchedSeconds / videoDuration) * 100)}%
            </span>
          </div>
        </div>
      )}
      
    </div>
  )
}