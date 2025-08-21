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
    console.log('🎬 Vimeo Player hook effect triggered, enabled:', options?.enabled)
    if (!options?.enabled) {
      console.log('🎬 Vimeo Player hook not enabled, skipping')
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
      console.log(`🎬 Attempt ${attempts} - Looking for Vimeo iframe in DOM:`, !!iframe)
      if (iframe) {
        console.log('🎬 Found Vimeo iframe:', iframe.src)
      }
      
      if (!iframe && attempts < maxAttempts) {
        // Try again after delay
        retryTimer = setTimeout(tryInit, 500)
        return
      }
      
      if (!iframe) {
        console.log('🎬 No Vimeo iframe found after', maxAttempts, 'attempts')
        return
      }

      // Check if player already exists
      if (playerRef.current) {
        console.log('🎬 Vimeo player already exists, skipping init')
        return
      }

      try {
        console.log('🎬 Initializing Vimeo Player with iframe:', iframe)
        const player = new Player(iframe)
        playerRef.current = player

        // Get duration
        player.getDuration().then(dur => {
          setDuration(dur)
        })

        // Set up event listeners
        player.on('play', () => {
          console.log('🎬 Vimeo: Video started playing')
          setIsPlaying(true)
          onPlayRef.current?.()
        })

        player.on('pause', () => {
          console.log('🎬 Vimeo: Video paused')
          setIsPlaying(false)
          onPauseRef.current?.()
        })

        player.on('loaded', () => {
          console.log('🎬 Vimeo: Video loaded')
        })

        player.on('ready', () => {
          console.log('🎬 Vimeo: Player ready')
        })

        player.on('timeupdate', (data) => {
          setCurrentTime(data.seconds)
          onTimeUpdateRef.current?.(data.seconds)
        })

        player.on('ended', () => {
          console.log('🎬 Vimeo: Video ended')
          setIsPlaying(false)
          onEndedRef.current?.()
        })

        player.ready().then(() => {
          console.log('🎬 Vimeo Player ready')
          setIsReady(true)
        })
      } catch (error) {
        console.error('🎬 Failed to initialize Vimeo player:', error)
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
      console.log('🎬 Vimeo: No player available for getPaused')
      return true
    }
    try {
      const isPaused = await playerRef.current.getPaused()
      console.log('🎬 Vimeo: getPaused result:', isPaused)
      return isPaused
    } catch (error) {
      console.error('🎬 Vimeo: Failed to get paused state:', error)
      return true
    }
  }

  const setVideoTime = async (seconds: number) => {
    if (!playerRef.current) return
    try {
      await playerRef.current.setCurrentTime(seconds)
      console.log('🎬 Vimeo: Set time to', seconds)
    } catch (error) {
      console.error('🎬 Vimeo: Failed to set time:', error)
    }
  }

  const play = async () => {
    if (!playerRef.current) return
    try {
      await playerRef.current.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('🎬 Vimeo: Failed to play:', error)
    }
  }

  const pause = async () => {
    if (!playerRef.current) {
      console.log('🎬 Vimeo: No player available for pause')
      return
    }
    try {
      console.log('🎬 Vimeo: Attempting to pause video')
      await playerRef.current.pause()
      // Double-check if video is actually paused
      const isPaused = await playerRef.current.getPaused()
      setIsPlaying(!isPaused)
      console.log('🎬 Vimeo: Pause result - isPaused:', isPaused)
    } catch (error) {
      console.error('🎬 Vimeo: Failed to pause:', error)
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