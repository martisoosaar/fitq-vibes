'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, logout, refreshAuth, isLoading } = useAuth()
  
  // Debug log
  console.log('UserDropdown - user trainer_unlocked:', user?.trainer_unlocked)
  
  // Check if this is an impersonation session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const impersonating = sessionStorage.getItem('fitq_impersonation') === 'true'
      setIsImpersonating(impersonating)
    }
  }, [user])
  
  // Mock unread messages count - replace with actual data
  const unreadMessages = 2

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#4d5665] animate-pulse"></div>
    )
  }
  
  // If no user, still show clickable avatar with limited menu
  if (!user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#3e4551] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#4d5665] flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#3e4551] rounded-lg shadow-xl z-50 py-2">
            <div className="px-4 py-2 text-gray-400">
              <p className="text-sm">Pole sisse logitud</p>
            </div>
            <div className="border-t border-[#4d5665] mt-2 pt-2">
              <button
                onClick={async () => {
                  setIsOpen(false)
                  await refreshAuth()
                }}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#4d5665] transition-colors w-full text-left text-white"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Proovi uuesti</span>
              </button>
              <Link
                href="/login"
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#4d5665] transition-colors w-full text-left text-white"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logi sisse</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {isImpersonating && (
        <div className="absolute -top-2 -left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full z-10">
          Impersonating
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-[#3e4551] transition-colors relative ${isImpersonating ? 'ring-2 ring-purple-500' : ''}`}
      >
        {user.avatar ? (
          <img
            src={user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.onerror = null
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                const fallback = document.createElement('div')
                fallback.className = 'w-8 h-8 rounded-full bg-[#4d5665] flex items-center justify-center'
                fallback.innerHTML = '<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>'
                parent.appendChild(fallback)
              }
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#4d5665] flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <span className="hidden md:block text-white font-medium">{user.name}</span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {unreadMessages > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#3e4551] rounded-lg shadow-xl z-50 py-2">
          <div className="px-4 py-2 border-b border-[#4d5665]">
            <p className="font-semibold text-white">{user.name}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>

          {user.isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-2 hover:bg-[#4d5665] transition-colors text-white"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Admin</span>
            </Link>
          )}

          {user.trainer_unlocked && (
            <>
              <Link
                href="/trainer-admin"
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#4d5665] transition-colors text-white"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>Treeneri Admin</span>
              </Link>
              <Link
                href={`/profile/${user.slug || user.name?.toLowerCase().replace(/\s+/g, '') || user.id}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#4d5665] transition-colors text-white"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Minu kanal</span>
              </Link>
            </>
          )}

          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 hover:bg-[#4d5665] transition-colors text-white"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Minu töölaud</span>
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-2 hover:bg-[#4d5665] transition-colors text-white"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Seaded</span>
          </Link>

          <Link
            href="/settings/payment"
            className="flex items-center gap-3 px-4 py-2 hover:bg-[#4d5665] transition-colors text-white"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Maksevahendid</span>
          </Link>

          <Link
            href="/messenger"
            className="flex items-center gap-3 px-4 py-2 hover:bg-[#4d5665] transition-colors text-white relative"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Sõnumid</span>
            {unreadMessages > 0 && (
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {unreadMessages}
              </span>
            )}
          </Link>

          <div className="border-t border-[#4d5665] mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 hover:bg-[#4d5665] transition-colors w-full text-left text-white"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logi välja</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}