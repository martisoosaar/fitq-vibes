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
      // Try multiple selectors since iframe might be inserted differently
      let iframe = document.querySelector('iframe[src*="vimeo.com"]') as HTMLIFrameElement
      if (!iframe) {
        iframe = document.querySelector('iframe[src*="player.vimeo"]') as HTMLIFrameElement
      }
      if (!iframe) {
        // Try to find any iframe as a last resort
        const allIframes = document.querySelectorAll('iframe')
        console.log(`🎬 Found ${allIframes.length} iframes in DOM`)
        allIframes.forEach((f, i) => {
          console.log(`  Iframe ${i}: src="${f.getAttribute('src')}"`)
        })
        // Check if any of them is a Vimeo iframe
        for (const f of allIframes) {
          const src = f.getAttribute('src')
          if (src && (src.includes('vimeo') || src.includes('player'))) {
            iframe = f as HTMLIFrameElement
            console.log('🎬 Found Vimeo iframe:', src)
            break
          }
        }
      }
      
      if (!iframe && attempts < maxAttempts) {
        // Try again after delay
        retryTimer = setTimeout(tryInit, 500)
        return
      }
      
      if (!iframe) {
        console.log('🎬 No Vimeo iframe found after', attempts, 'attempts')
        return
      }
      
      console.log('🎬 Initializing Vimeo player with iframe:', iframe)

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
          console.log('🎬 Vimeo: PLAY event')
          setIsPlaying(true)
          onPlayRef.current?.()
        })
        
        // Also listen to 'playing' event which is more reliable
        player.on('playing', () => {
          console.log('🎬 Vimeo: PLAYING event (video is playing)')
          setIsPlaying(true)
          onPlayRef.current?.()
        })

        player.on('pause', () => {
          console.log('🎬 Vimeo: PAUSE event')
          setIsPlaying(false)
          onPauseRef.current?.()
        })

        player.on('loaded', () => {
          console.log('🎬 Vimeo: LOADED event')
        })

        player.on('ready', () => {
          console.log('🎬 Vimeo: READY event')
        })
        
        // Listen for seeked event to handle seeking
        player.on('seeked', (data) => {
          console.log('🎬 Vimeo: SEEKED to', data.seconds)
        })

        player.on('timeupdate', (data) => {
          // Only log every 5 seconds to avoid spam
          if (Math.floor(data.seconds) % 5 === 0 && data.seconds > 0) {
            console.log('🎬 Vimeo: TIME UPDATE', Math.floor(data.seconds))
          }
          setCurrentTime(data.seconds)
          onTimeUpdateRef.current?.(data.seconds)
        })

        player.on('ended', () => {
          console.log('🎬 Vimeo: ENDED event')
          setIsPlaying(false)
          onEndedRef.current?.()
        })

        // Don't wait for ready() - it might hang
        console.log('🎬 Setting up player without waiting for ready()')
        setIsReady(true)
        
        // Test if getPaused works immediately
        setTimeout(() => {
          player.getPaused().then(paused => {
            console.log('🎬 Initial paused state:', paused)
          }).catch(err => {
            console.error('🎬 ERROR: Cannot get paused state:', err)
          })
        }, 1000)
        
        // Start polling for play state as a fallback
        // Some Vimeo embeds don't fire events properly
        console.log('🎬 Starting polling for play state...')
        let lastPausedState: boolean | null = null
        let pollCount = 0
        const pollInterval = setInterval(async () => {
          try {
            pollCount++
            const isPaused = await player.getPaused()
            
            // Log every 10th poll to avoid spam
            if (pollCount % 10 === 0) {
              console.log('🎬 Poll #' + pollCount + ', paused:', isPaused)
            }
            
            if (isPaused !== lastPausedState) {
              console.log('🎬 Vimeo state changed (via polling):', isPaused ? 'PAUSED' : 'PLAYING')
              lastPausedState = isPaused
              setIsPlaying(!isPaused)
              if (!isPaused) {
                onPlayRef.current?.()
              } else {
                onPauseRef.current?.()
              }
            }
          } catch (err) {
            console.error('🎬 Polling error:', err)
            // Player might be destroyed
            clearInterval(pollInterval)
          }
        }, 500) // Check every 500ms
        
        // Store interval for cleanup
        ;(player as any).__pollInterval = pollInterval
        
        // Try ready() but don't depend on it
        player.ready().then(() => {
          console.log('🎬 Vimeo player ready() resolved')
        }).catch(err => {
          console.error('🎬 Player ready() failed:', err)
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
        // Clean up polling interval if exists
        if ((playerRef.current as any).__pollInterval) {
          clearInterval((playerRef.current as any).__pollInterval)
        }
        playerRef.current.off('play')
        playerRef.current.off('playing')
        playerRef.current.off('pause')
        playerRef.current.off('timeupdate')
        playerRef.current.off('ended')
        playerRef.current.off('seeked')
        playerRef.current.off('loaded')
        playerRef.current.off('ready')
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