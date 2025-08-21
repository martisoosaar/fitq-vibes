'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

interface User {
  id: number | string
  email: string
  name?: string
  subscription?: string
  avatar?: string
  trainer_unlocked?: boolean
  slug?: string
  isAdmin?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isInitialLoadRef = useRef(true)

  const checkAuth = async () => {
    try {
      // Only set loading on initial load, not on background checks
      if (isInitialLoadRef.current) {
        setIsLoading(true)
      }
      // Try to fetch user data from API (uses cookies for auth)
      const response = await fetch('/api/auth/me', {
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important for cookies
        cache: 'no-store' // Don't cache this request
      })
      
      
      if (response.ok) {
        const userData = await response.json()
        const newUser = {
          id: userData.id || userData.user_id || userData.user?.id || '1',
          email: userData.email || userData.user?.email,
          name: userData.name || userData.user?.name || userData.email?.split('@')[0],
          avatar: userData.avatar || userData.user?.avatar,
          trainer_unlocked: userData.trainer_unlocked || userData.user?.trainer_unlocked || false,
          slug: userData.slug || userData.user?.slug,
          isAdmin: userData.isAdmin || userData.user?.isAdmin || false
        }
        
        // Only update if user data actually changed
        setUser(prevUser => {
          if (!prevUser) return newUser
          if (JSON.stringify(prevUser) !== JSON.stringify(newUser)) {
            return newUser
          }
          return prevUser
        })
      } else {
        // If not logged in, clear user
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed with error:', error)
      setUser(null)
    } finally {
      if (isInitialLoadRef.current) {
        setIsLoading(false)
        isInitialLoadRef.current = false
      }
    }
  }

  useEffect(() => {
    // Initial auth check
    checkAuth()
    
    // Check auth on focus, but with debouncing to prevent rapid checks
    let focusTimeout: NodeJS.Timeout
    const handleFocus = () => {
      clearTimeout(focusTimeout)
      focusTimeout = setTimeout(() => {
        const isVideoPage = window.location.pathname.includes('/videos/')
        if (!isInitialLoadRef.current && !isVideoPage) {
          checkAuth()
        }
      }, 1000) // Wait 1 second after focus
    }
    
    window.addEventListener('focus', handleFocus)
    
    // Check periodically, but less frequently - every 5 minutes instead of 30 seconds
    // Skip if we're on video page to prevent interruptions
    const interval = setInterval(() => {
      const isVideoPage = window.location.pathname.includes('/videos/')
      if (!document.hidden && !isInitialLoadRef.current && !isVideoPage) {
        checkAuth()
      }
    }, 300000) // 5 minutes
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
      clearTimeout(focusTimeout)
    }
  }, [])

  const login = async (email: string, password: string) => {
    // This method is not used anymore since we use email code login
    throw new Error('Password login is deprecated. Use email code login instead.')
  }

  const logout = async () => {
    try {
      // Call logout API to clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
    
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshAuth: checkAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}