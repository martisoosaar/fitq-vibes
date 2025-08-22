'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { User, CreditCard, Settings } from 'lucide-react'

const settingsTabs = [
  {
    id: 'personal',
    label: 'Isiklikud andmed',
    href: '/settings/personal',
    icon: User
  },
  {
    id: 'account',
    label: 'Konto seaded',
    href: '/settings/account',
    icon: Settings
  },
  {
    id: 'purchases',
    label: 'Ostud',
    href: '/settings/purchases',
    icon: CreditCard
  }
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#2c313a] text-white">
      {/* Page Header */}
      <div className="bg-[#3e4551] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Seaded</h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto">
            {settingsTabs.map((tab) => {
              const isActive = pathname.startsWith(tab.href)
              const Icon = tab.icon
              
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#40b236] text-white'
                      : 'bg-[#2c313a] text-gray-300 hover:bg-[#4d5665] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-12">
        {children}
      </div>
    </div>
  )
}