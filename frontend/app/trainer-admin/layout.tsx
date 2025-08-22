'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const trainerAdminNav = [
  { name: 'Videod', href: '/trainer-admin' },
  { name: 'Programmid', href: '/trainer-admin/programs' },
  { name: 'Statistika', href: '/trainer-admin/stats' },
  { name: 'Seaded', href: '/trainer-admin/settings' },
]

export default function TrainerAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && (!user || !user.trainer_unlocked)) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="bg-[#2c313a] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
          <p className="mt-4 text-gray-300">Laen...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.trainer_unlocked) {
    return null
  }

  return (
    <div className="bg-[#2c313a] text-white min-h-screen">
      {/* Header */}
      <div className="bg-[#3e4551] border-b border-[#4d5665]">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Treeneri Admin</h1>
              <p className="text-gray-400 text-sm mt-1">Halda oma sisu ja statistikat</p>
            </div>
            <Link
              href={`/trainers/${user.slug}`}
              className="bg-[#40b236] hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Vaata kanalit
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-[#3e4551] border-b border-[#4d5665]">
        <div className="max-w-[1400px] mx-auto px-6">
          <nav className="flex gap-6">
            {trainerAdminNav.map((item) => {
              const isActive = pathname === item.href || 
                             (item.href === '/trainer-admin' && pathname === '/trainer-admin')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`py-3 px-1 border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#40b236] text-[#40b236]'
                      : 'border-transparent text-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}