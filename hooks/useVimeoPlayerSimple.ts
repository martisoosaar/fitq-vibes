import { useEffect, useRef, useState } from 'react'

interface UseVimeoPlayerSimpleOptions {
  onPlay?: () => void
  onPause?: () => void
  onTimeUpdate?: (seconds: number, duration: number) => void
  enabled?: boolean
}

export function useVimeoPlayerSimple(options?: UseVimeoPlayerSimpleOptions) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const lastStateRef = useRef<boolean | null>(null)
  
  useEffect(() => {
    if (!options?.enabled) {
      return
    }

    console.log('🎯 Simple Vimeo detector starting...')
    
    // Listen for messages from Vimeo iframe
    const handleMessage = (event: MessageEvent) => {
      // Only process messages from Vimeo
      if (!event.origin.includes('player.vimeo.com')) {
        return
      }
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        
        // Commented out to reduce console spam
        // if (data.method || data.event) {
        //   console.log('🎯 Vimeo message received:', { 
        //     method: data.method, 
        //     event: data.event,
        //     value: data.value,
        //     data: data.data ? '...' : undefined 
        //   })
        // }
        
        // Log important Vimeo messages for debugging
        if (data.event) {
          if (['ready', 'play', 'pause', 'finish'].includes(data.event)) {
            console.log('🎯 Vimeo event:', data.event, data)
          } else if (data.event === 'playProgress') {
            // Don't log playProgress to avoid spam
          }
        }
        
        if (data.event === 'ready') {
          console.log('🎯 Vimeo player ready, sending play/pause listeners')
          setIsReady(true)
          
          // Find the iframe
          const iframe = document.querySelector('iframe[src*="vimeo"]') as HTMLIFrameElement
          if (iframe && iframe.contentWindow) {
            // Subscribe to events
            const events = ['play', 'pause', 'finish', 'playProgress']
            events.forEach(eventName => {
              iframe.contentWindow.postMessage(
                JSON.stringify({ method: 'addEventListener', value: eventName }),
                '*'
              )
            })
          }
        }
        
        if (data.event === 'play') {
          console.log('🎯 VIDEO PLAYING')
          if (lastStateRef.current !== true) {
            lastStateRef.current = true
            setIsPlaying(true)
            options?.onPlay?.()
          }
        }
        
        if (data.event === 'pause' || data.event === 'finish') {
          console.log('🎯 VIDEO PAUSED/FINISHED')
          if (lastStateRef.current !== false) {
            lastStateRef.current = false
            setIsPlaying(false)
            options?.onPause?.()
          }
        }
        
        // Also check playProgress for tracking position
        if (data.event === 'playProgress' && data.data) {
          const seconds = data.data.seconds || 0
          const dur = data.data.duration || 0
          setCurrentTime(seconds)
          setDuration(dur)
          
          // Always call onTimeUpdate if we have it
          if (options?.onTimeUpdate) {
            // Log less frequently
            if (Math.floor(seconds) % 2 === 0 || seconds < 3) {
              console.log('🎯 Calling onTimeUpdate with:', seconds.toFixed(1), '/', dur.toFixed(1))
            }
            options?.onTimeUpdate(seconds, dur)
          }
          
          // Also use for backup play detection
          const isCurrentlyPlaying = data.data.percent > 0 && data.data.percent < 0.999
          if (isCurrentlyPlaying && lastStateRef.current !== true) {
            console.log('🎯 VIDEO PLAYING (detected via progress)')
            lastStateRef.current = true
            setIsPlaying(true)
            options?.onPlay?.()
          }
        }
      } catch (err) {
        // Not JSON or not a Vimeo message
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    // Try to initialize after a delay
    setTimeout(() => {
      const iframe = document.querySelector('iframe[src*="vimeo"]') as HTMLIFrameElement
      if (iframe && iframe.contentWindow) {
        console.log('🎯 Found Vimeo iframe, sending initial API enable message...')
        // Enable the API by sending an initial message
        iframe.contentWindow.postMessage(
          JSON.stringify({ method: 'addEventListener', value: 'ready' }),
          '*'
        )
        // Also try subscribing to other events immediately
        const events = ['play', 'pause', 'finish', 'playProgress']
        events.forEach(eventName => {
          iframe.contentWindow.postMessage(
            JSON.stringify({ method: 'addEventListener', value: eventName }),
            '*'
          )
        })
      }
    }, 1000)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [options?.enabled, options?.onPlay, options?.onPause, options?.onTimeUpdate])

  return {
    isPlaying,
    isReady,
    currentTime,
    duration
  }
}