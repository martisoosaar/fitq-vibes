'use client'

import Image from 'next/image'

interface StebbyButtonProps {
  label: string
  connect?: boolean
  isSettingsPage?: boolean
  onDisconnect?: () => void
}

export default function StebbyButton({ 
  label, 
  connect = true, 
  isSettingsPage = false,
  onDisconnect 
}: StebbyButtonProps) {
  
  const handleClick = () => {
    if (connect) {
      // Redirect to Stebby auth
      const authUrl = process.env.NEXT_PUBLIC_STEBBY_AUTH_URL || 
        'https://auth.stebby.eu/connect/authorize?client_id=fitq&redirect_uri=http://localhost:3002/api/auth/stebby/callback&response_type=code&scope=openid profile email'
      
      if (isSettingsPage) {
        // Modify redirect URL for settings page
        const url = new URL(authUrl)
        const redirectUrl = url.searchParams.get('redirect_uri')
        if (redirectUrl) {
          url.searchParams.set('redirect_uri', redirectUrl + '?return=/settings')
        }
        window.location.href = url.toString()
      } else {
        window.location.href = authUrl
      }
    } else if (onDisconnect) {
      onDisconnect()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-medium border border-gray-300 transition-colors"
    >
      <Image
        src="/images/stebby-logo.png"
        alt="Stebby"
        width={24}
        height={24}
        className="w-6 h-6"
      />
      <span>{label}</span>
    </button>
  )
}