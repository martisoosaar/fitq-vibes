'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PrismaClient } from '@prisma/client'

export default function ImpersonatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleImpersonation = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setError('Invalid impersonation link')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/auth/impersonate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (response.ok) {
          // Mark this window as an impersonation session
          sessionStorage.setItem('fitq_impersonation', 'true')
          sessionStorage.setItem('fitq_admin_id', data.adminId.toString())
          
          // Set additional cookies to indicate impersonation (for client-side use)
          document.cookie = `fitq_impersonating=true; path=/; max-age=14400`
          document.cookie = `fitq_admin_id=${data.adminId}; path=/; max-age=14400`
          
          // Redirect to homepage as the impersonated user
          window.location.href = '/'
        } else {
          setError(data.error || 'Failed to impersonate user')
          setLoading(false)
        }
      } catch (err) {
        console.error('Impersonation error:', err)
        setError('Failed to process impersonation request')
        setLoading(false)
      }
    }

    handleImpersonation()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2c313a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236] mx-auto"></div>
          <p className="mt-4 text-gray-300">Lülitun kasutajaks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#2c313a] flex items-center justify-center">
        <div className="bg-[#3e4551] rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-4">Viga</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.close()}
            className="bg-[#40b236] hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sulge aken
          </button>
        </div>
      </div>
    )
  }

  return null
}