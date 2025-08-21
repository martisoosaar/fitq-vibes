import { useEffect, useRef, useState } from 'react'
import Player from '@vimeo/player'

interface UseVimeoPlayerOptions {
  onPlay?: () => void
  onPause?: () => void
  onTimeUpdate?: (seconds: number) => void
  onEnded?: () => void
  enabled?: boolean
}

export function useVimeoPlayer(options?: UseVimeoPlayerOptions) {
  const playerRef = useRef<Player | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Store callbacks in refs to avoid dependency changes
  const onPlayRef = useRef(options?.onPlay)
  const onPauseRef = useRef(options?.onPause)
  const onTimeUpdateRef = useRef(options?.onTimeUpdate)
  const onEndedRef = useRef(options?.onEnded)
  
  // Update refs when callbacks change
  useEffect(() => {
    onPlayRef.current = options?.onPlay
    onPauseRef.current = options?.onPause
    onTimeUpdateRef.current = options?.onTimeUpdate
    onEndedRef.current = options?.onEnded
  }, [options?.onPlay, options?.onPause, options?.onTimeUpdate, options?.onEnded])

  useEffect(() => {
    if (!options?.enabled) {
      return
    }

    // Try multiple times to find iframe directly in DOM
    let attempts = 0
    const maxAttempts = 20
    let retryTimer: NodeJS.Timeout
    
    const tryInit = () => {
      attempts++
      // Search for iframe directly in DOM like the old Vue code
      const iframe = document.querySelector('iframe[src*="vimeo.com"]') as HTMLIFrameElement
      if (iframe) {
      }
      
      if (!iframe && attempts < maxAttempts) {
        // Try again after delay
        retryTimer = setTimeout(tryInit, 500)
        return
      }
      
      if (!iframe) {
        return
      }

      // Check if player already exists
      if (playerRef.current) {
        return
      }

      try {
        const player = new Player(iframe)
        playerRef.current = player

        // Get duration
        player.getDuration().then(dur => {
          setDuration(dur)
        })

        // Set up event listeners
        player.on('play', () => {
          setIsPlaying(true)
          onPlayRef.current?.()
        })

        player.on('pause', () => {
          setIsPlaying(false)
          onPauseRef.current?.()
        })

        player.on('loaded', () => {
        })

        player.on('ready', () => {
        })

        player.on('timeupdate', (data) => {
          setCurrentTime(data.seconds)
          onTimeUpdateRef.current?.(data.seconds)
        })

        player.on('ended', () => {
          setIsPlaying(false)
          onEndedRef.current?.()
        })

        player.ready().then(() => {
          setIsReady(true)
        })
      } catch (error) {
        // console.error('🎬 Failed to initialize Vimeo player:', error)
      }
    }
    
    // Start trying to initialize
    const timer = setTimeout(tryInit, 100)

    return () => {
      clearTimeout(timer)
      clearTimeout(retryTimer)
      if (playerRef.current) {
        playerRef.current.off('play')
        playerRef.current.off('pause')
        playerRef.current.off('timeupdate')
        playerRef.current.off('ended')
        playerRef.current = null
        setIsReady(false)
        setIsPlaying(false)
      }
    }
  }, [options?.enabled]) // Re-run when enabled changes

  const getCurrentTime = async (): Promise<number> => {
    if (!playerRef.current) return 0
    try {
      const seconds = await playerRef.current.getCurrentTime()
      return seconds
    } catch {
      return 0
    }
  }

  const getPaused = async (): Promise<boolean> => {
    if (!playerRef.current) {
      return true
    }
    try {
      const isPaused = await playerRef.current.getPaused()
      return isPaused
    } catch (error) {
      // console.error('🎬 Vimeo: Failed to get paused state:', error)
      return true
    }
  }

  const setVideoTime = async (seconds: number) => {
    if (!playerRef.current) return
    try {
      await playerRef.current.setCurrentTime(seconds)
    } catch (error) {
      // console.error('🎬 Vimeo: Failed to set time:', error)
    }
  }

  const play = async () => {
    if (!playerRef.current) return
    try {
      await playerRef.current.play()
      setIsPlaying(true)
    } catch (error) {
      // console.error('🎬 Vimeo: Failed to play:', error)
    }
  }

  const pause = async () => {
    if (!playerRef.current) {
      return
    }
    try {
      await playerRef.current.pause()
      // Double-check if video is actually paused
      const isPaused = await playerRef.current.getPaused()
      setIsPlaying(!isPaused)
    } catch (error) {
      // console.error('🎬 Vimeo: Failed to pause:', error)
      setIsPlaying(false)
    }
  }

  return {
    player: playerRef.current,
    currentTime,
    duration,
    isReady,
    isPlaying,
    getCurrentTime,
    getPaused,
    setVideoTime,
    play,
    pause
  }
}