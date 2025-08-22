'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Challenge {
  id: number
  name: string
  description: string
  image: string | null
  path: string
  beginDate: string | null
  endDate: string | null
  maxTeam: number
  minTeam: number
  isSubscriptionNeeded: boolean
  type: string | null
  trainer: {
    id: number
    name: string
    avatar: string | null
    slug: string
  } | null
  joinData?: {
    trainingDays: number
    trainingDaysDone: number
    teamRanking: number
    teamsTotal: number
  }
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'ended'>('active')

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges')
      if (response.ok) {
        const data = await response.json()
        setChallenges(data.challenges || data)
      } else {
        console.error('Failed to fetch challenges')
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = [
      'jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni',
      'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'
    ]
    return `${date.getDate()}. ${months[date.getMonth()]}`
  }

  const now = new Date()
  
  // Filter challenges by status
  const activeChallenges = Array.isArray(challenges) ? challenges.filter(c => {
    if (!c.beginDate || !c.endDate) return true // No dates means always active
    const begin = new Date(c.beginDate)
    const end = new Date(c.endDate)
    return begin <= now && end >= now
  }) : []
  
  const upcomingChallenges = Array.isArray(challenges) ? challenges.filter(c => {
    if (!c.beginDate) return false
    const begin = new Date(c.beginDate)
    return begin > now
  }) : []
  
  const endedChallenges = Array.isArray(challenges) ? challenges.filter(c => {
    if (!c.endDate) return false
    const end = new Date(c.endDate)
    return end < now
  }) : []

  const displayedChallenges = 
    activeTab === 'active' ? activeChallenges :
    activeTab === 'upcoming' ? upcomingChallenges :
    endedChallenges

  return (
    <div className="bg-[#2c313a] text-white pb-12">
      {/* Page Header */}
      <div className="bg-[#3e4551] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Väljakutsed</h1>
          <p className="text-gray-300">
            Liitu väljakutsetega ja treeni koos teistega
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-[#4d5665]">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'active'
                ? 'text-[#40b236]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Käimasolevad ({activeChallenges.length})
            {activeTab === 'active' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#40b236]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'upcoming'
                ? 'text-[#40b236]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tulevased ({upcomingChallenges.length})
            {activeTab === 'upcoming' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#40b236]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ended')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'ended'
                ? 'text-[#40b236]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Lõppenud ({endedChallenges.length})
            {activeTab === 'ended' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#40b236]" />
            )}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && displayedChallenges.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-lg font-semibold">
              {activeTab === 'active' 
                ? 'Hetkel ei ole käimasolevaid väljakutseid'
                : activeTab === 'upcoming'
                ? 'Tulevasi väljakutseid ei ole veel lisatud'
                : 'Lõppenud väljakutseid ei leitud'}
            </p>
            {activeTab !== 'active' && activeChallenges.length > 0 && (
              <button
                onClick={() => setActiveTab('active')}
                className="mt-4 text-[#40b236] hover:text-[#60cc56] transition-colors"
              >
                Vaata käimasolevaid väljakutseid
              </button>
            )}
          </div>
        )}

        {/* Challenges Grid */}
        {!loading && displayedChallenges.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedChallenges.map((challenge) => (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.path}`}
                className={`rounded-lg overflow-hidden hover:shadow-xl transition-shadow group ${
                  activeTab === 'ended' ? 'bg-[#3e4551] opacity-75' : 'bg-[#3e4551]'
                }`}
              >
                <div className="aspect-[16/9] relative bg-[#4d5665] overflow-hidden">
                  {challenge.image && challenge.image.startsWith('http') ? (
                    <img
                      src={challenge.image}
                      alt={challenge.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.placeholder')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex flex-col items-center justify-center ${challenge.image && challenge.image.startsWith('http') ? 'placeholder hidden' : ''}`}>
                    <svg className="w-20 h-20 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-gray-500 text-sm">Väljakutse</span>
                  </div>
                  {challenge.isSubscriptionNeeded && (
                    <div className="absolute top-2 right-2 bg-[#40b236] text-white px-2 py-1 rounded text-xs font-medium">
                      Premium
                    </div>
                  )}
                  {activeTab === 'ended' && (
                    <div className="absolute top-2 left-2 bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">
                      Lõppenud
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{challenge.name}</h3>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {challenge.description}
                  </p>

                  {/* Progress Bar for Active Challenges */}
                  {challenge.joinData && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{challenge.joinData.trainingDaysDone}/{challenge.joinData.trainingDays} päeva</span>
                      </div>
                      <div className="w-full bg-[#2c313a] rounded-full h-2">
                        <div 
                          className="bg-[#40b236] h-2 rounded-full transition-all"
                          style={{ 
                            width: `${(challenge.joinData.trainingDaysDone / challenge.joinData.trainingDays) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Meeskonna koht</span>
                        <span>{challenge.joinData.teamRanking}. / {challenge.joinData.teamsTotal}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    {challenge.trainer && (
                      <div className="flex items-center gap-2">
                        {challenge.trainer.avatar ? (
                          <img
                            src={challenge.trainer.avatar}
                            alt={challenge.trainer.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#4d5665] flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <span className="text-gray-300">{challenge.trainer.name}</span>
                      </div>
                    )}
                    {challenge.maxTeam > 1 && (
                      <div className="text-gray-400">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Kuni {challenge.maxTeam}
                      </div>
                    )}
                  </div>

                  {challenge.beginDate && challenge.endDate && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(challenge.beginDate)} - {formatDate(challenge.endDate)}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}