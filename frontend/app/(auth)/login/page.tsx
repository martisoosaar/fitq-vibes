'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')
  const [autoLoggingIn, setAutoLoggingIn] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check for auto-login parameters
  useEffect(() => {
    const challengeId = searchParams.get('challenge')
    const codeParam = searchParams.get('code')
    
    if (challengeId && codeParam) {
      // Auto-login with URL parameters
      setAutoLoggingIn(true)
      handleAutoLogin(challengeId, codeParam)
    }
  }, [searchParams])
  
  const handleAutoLogin = async (challengeId: string, loginCode: string) => {
    try {
      const response = await fetch('/api/auth/email-code/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          challenge_id: challengeId, 
          code: loginCode,
          device_name: `${navigator.platform} - ${new Date().toLocaleDateString('et-EE')}`
        })
      })

      if (response.ok) {
        // Successfully logged in
        window.location.href = '/dashboard'
      } else {
        setError('Sisselogimislink on aegunud või vale. Palun proovi uuesti.')
        setAutoLoggingIn(false)
      }
    } catch (err) {
      setError('Automaatne sisselogimine ebaõnnestus. Palun proovi uuesti.')
      setAutoLoggingIn(false)
    }
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Use the existing email code request API
      const response = await fetch('/api/auth/email-code/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        const data = await response.json()
        setCodeSent(true)
        setError('')
        // Store challenge_id for verification
        sessionStorage.setItem('challenge_id', data.challenge_id)
      } else {
        setError('E-maili saatmine ebaõnnestus')
      }
    } catch (err) {
      setError('Koodi saatmine ebaõnnestus. Proovi hiljem uuesti.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const challengeId = sessionStorage.getItem('challenge_id')
      if (!challengeId) {
        setError('Sessioon aegunud. Alusta uuesti.')
        setCodeSent(false)
        return
      }

      // Use the existing verify API
      const response = await fetch('/api/auth/email-code/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          challenge_id: challengeId, 
          code,
          device_name: `${navigator.platform} - ${new Date().toLocaleDateString('et-EE')}`
        })
      })

      if (response.ok) {
        // Successfully logged in
        sessionStorage.removeItem('challenge_id')
        window.location.href = '/dashboard'
      } else {
        setError('Vale kood. Proovi uuesti.')
      }
    } catch (err) {
      setError('Sisselogimine ebaõnnestus. Proovi hiljem uuesti.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/oauth/google'
  }

  const handleFacebookLogin = () => {
    window.location.href = '/api/auth/oauth/facebook'
  }

  const handleStebbyLogin = () => {
    window.location.href = '/api/auth/oauth/stebby'
  }


  return (
    <div className="min-h-screen bg-[#2c313a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Logi sisse
        </h1>

        {autoLoggingIn ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#40b236]/20 animate-pulse">
                <svg className="w-8 h-8 text-[#40b236] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
            <p className="text-white text-lg mb-2">Sisselogime sisse...</p>
            <p className="text-gray-400 text-sm">Palun oota hetk</p>
          </div>
        ) : !codeSent ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#3e4551] border border-[#4d5665] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#40b236] transition-colors"
                placeholder="Sisesta oma e-mail"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#40b236] hover:bg-[#60cc56] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saadan koodi...' : 'Saada kood'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-gray-300 text-sm mb-4">
              Saatsime koodi aadressile <strong>{email}</strong>
            </p>
            
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                Sisesta kood
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 bg-[#3e4551] border border-[#4d5665] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#40b236] transition-colors text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#40b236] hover:bg-[#60cc56] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kontrollin...' : 'Logi sisse'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setCodeSent(false)
                setCode('')
                setError('')
              }}
              className="w-full text-[#40b236] hover:text-[#60cc56] font-medium transition-colors"
            >
              Muuda e-maili
            </button>
          </form>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#4d5665]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#2c313a] px-2 text-gray-400">või</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Jätka Google'iga
            </button>

            <button
              onClick={handleFacebookLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Jätka Facebookiga
            </button>

            <button
              onClick={handleStebbyLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-medium rounded-lg transition-colors"
            >
              <Image 
                src="/images/stebby-logo-white.png" 
                alt="Stebby" 
                width={60} 
                height={20}
              />
              Jätka Stebbyga
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}