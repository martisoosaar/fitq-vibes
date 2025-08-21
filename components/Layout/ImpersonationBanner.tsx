'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function ImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [adminId, setAdminId] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're impersonating
    const checkImpersonation = () => {
      const cookies = document.cookie.split(';')
      let impersonating = false
      let admin = null
      
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'fitq_impersonating' && value === 'true') {
          impersonating = true
        } else if (name === 'fitq_admin_id') {
          admin = value
        }
      }
      
      setIsImpersonating(impersonating)
      setAdminId(admin)
    }

    checkImpersonation()
    
    // Check periodically in case cookies change
    const interval = setInterval(checkImpersonation, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleStopImpersonation = () => {
    // Clear impersonation cookies
    document.cookie = 'fitq_impersonating=; path=/; max-age=0'
    document.cookie = 'fitq_admin_id=; path=/; max-age=0'
    
    // Close the window
    window.close()
    
    // If window.close() doesn't work (e.g., not opened by script)
    // redirect to logout
    setTimeout(() => {
      window.location.href = '/api/auth/logout'
    }, 100)
  }

  if (!isImpersonating) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-purple-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <span className="font-medium">
          Oled sisse logitud teise kasutajana (Admin mode)
        </span>
      </div>
      <button
        onClick={handleStopImpersonation}
        className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
        Lõpeta
      </button>
    </div>
  )
}