'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

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

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      // Try to fetch user data from API (uses cookies for auth)
      const response = await fetch('/api/auth/me', {
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important for cookies
        cache: 'no-store' // Don't cache this request
      })
      
      console.log('Auth check response status:', response.status)
      
      if (response.ok) {
        const userData = await response.json()
        console.log('AuthContext received user data:', userData)
        setUser({
          id: userData.id || userData.user_id || userData.user?.id || '1',
          email: userData.email || userData.user?.email,
          name: userData.name || userData.user?.name || userData.email?.split('@')[0],
          avatar: userData.avatar || userData.user?.avatar,
          trainer_unlocked: userData.trainer_unlocked || userData.user?.trainer_unlocked || false,
          slug: userData.slug || userData.user?.slug,
          isAdmin: userData.isAdmin || userData.user?.isAdmin || false
        })
      } else {
        // If not logged in, clear user
        console.log('Auth check failed with status:', response.status)
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed with error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial auth check
    checkAuth()
    
    // Re-check auth status when window gains focus
    const handleFocus = () => {
      checkAuth()
    }
    
    window.addEventListener('focus', handleFocus)
    
    // Also check periodically every 30 seconds when tab is active
    const interval = setInterval(() => {
      if (!document.hidden) {
        checkAuth()
      }
    }, 30000)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
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