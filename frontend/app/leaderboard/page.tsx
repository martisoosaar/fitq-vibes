'use client'

import { useState, useEffect } from 'react'
import { Trophy, Medal, Award, Calendar, User } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  name: string
  points: number
  isCurrentUser: boolean
  isPremium: boolean
}

type Period = 'last30' | 'today' | 'yesterday' | 'current-month' | 'current-week'

const periodOptions: { label: string; value: Period }[] = [
  { label: 'Viimased 30 päeva', value: 'last30' },
  { label: 'Täna', value: 'today' },
  { label: 'Eile', value: 'yesterday' },
  { label: 'Jooksev kuu', value: 'current-month' },
  { label: 'Jooksev nädal', value: 'current-week' }
]

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('last30')
  const [showRealName, setShowRealName] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [period])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      
      // Mock data - replace with actual API call
      const mockData: LeaderboardEntry[] = [
        { rank: 1, name: 'Maria Mägi', points: 4520, isCurrentUser: false, isPremium: true },
        { rank: 2, name: 'Jaan Tamm', points: 4235, isCurrentUser: false, isPremium: false },
        { rank: 3, name: 'Liisa Kask', points: 3890, isCurrentUser: false, isPremium: true },
        { rank: 4, name: 'Peeter Sepp', points: 3567, isCurrentUser: false, isPremium: false },
        { rank: 5, name: 'Kati Kukk', points: 3421, isCurrentUser: false, isPremium: true },
        { rank: 6, name: 'Martin Mets', points: 3298, isCurrentUser: false, isPremium: false },
        { rank: 7, name: 'Sina', points: 3156, isCurrentUser: true, isPremium: false },
        { rank: 8, name: 'Tiina Teder', points: 2987, isCurrentUser: false, isPremium: true },
        { rank: 9, name: 'Andres Aru', points: 2845, isCurrentUser: false, isPremium: false },
        { rank: 10, name: 'Kristel Kivi', points: 2734, isCurrentUser: false, isPremium: false },
        { rank: 11, name: 'Raul Rebane', points: 2612, isCurrentUser: false, isPremium: false },
        { rank: 12, name: 'Helen Hunt', points: 2489, isCurrentUser: false, isPremium: true },
        { rank: 13, name: 'Toomas Tamme', points: 2367, isCurrentUser: false, isPremium: false },
        { rank: 14, name: 'Kadri Karu', points: 2245, isCurrentUser: false, isPremium: false },
        { rank: 15, name: 'Priit Pärn', points: 2198, isCurrentUser: false, isPremium: true },
      ]

      // Find current user
      const currentUser = mockData.find(e => e.isCurrentUser)
      
      // Get top 100 (or in this case, all except current user if they're outside top 100)
      const top100 = mockData.filter(e => !e.isCurrentUser || e.rank <= 100)
      
      setEntries(top100)
      
      // If current user is outside top 100, set them separately
      if (currentUser && currentUser.rank > 100) {
        setCurrentUserEntry(currentUser)
      } else {
        setCurrentUserEntry(null)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNameDisplayToggle = async () => {
    setShowRealName(!showRealName)
    // Here you would also save this preference to the backend
  }

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />
      default:
        return null
    }
  }

  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.isCurrentUser) {
      return showRealName ? entry.name : 'Anonüümne treenija'
    }
    return entry.name
  }

  return (
    <div className="min-h-screen bg-[#2c313a] text-white">
      {/* Page Header */}
      <div className="bg-[#3e4551] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Edetabel</h1>
          <p className="text-gray-300">
            Vaata, kes on kogutud punktide poolest esikohal
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-12">
        <div className="bg-[#3e4551] rounded-lg p-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {/* Period Selector */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg focus:outline-none focus:border-[#40b236] transition-colors"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Name Display Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm">Kuva nimi:</span>
              <button
                onClick={handleNameDisplayToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showRealName ? 'bg-[#40b236]' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showRealName ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm">{showRealName ? 'Jah' : 'Ei'}</span>
            </div>
          </div>

          {/* Leaderboard Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#4d5665]">
                    <th className="text-left py-3 px-2 w-16">Koht</th>
                    <th className="text-left py-3 px-2">Nimi</th>
                    <th className="text-right py-3 px-2">Punktid</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr 
                      key={entry.rank}
                      className={`border-b border-[#4d5665]/30 ${
                        entry.isCurrentUser ? 'bg-[#40b236]/10' : ''
                      } ${
                        entry.rank <= 3 ? 'text-[#60cc56]' : ''
                      } ${
                        entry.rank <= 10 && entry.rank > 3 ? 'text-[#90dd86]' : ''
                      }`}
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {getRankIcon(entry.rank)}
                          <span className="font-semibold">{entry.rank}.</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className={entry.isCurrentUser ? 'font-bold' : ''}>
                            {getDisplayName(entry)}
                          </span>
                          {entry.isPremium && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs rounded-full">
                              Premium
                            </span>
                          )}
                          {entry.isCurrentUser && (
                            <span className="px-2 py-0.5 bg-[#40b236] text-white text-xs rounded-full">
                              Sina
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">
                        {entry.points.toLocaleString('et-EE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                
                {/* Current user if outside top 100 */}
                {currentUserEntry && (
                  <tfoot>
                    <tr className="border-t-2 border-[#4d5665] bg-[#40b236]/10">
                      <td className="py-3 px-2 font-semibold" colSpan={2}>
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          {getDisplayName(currentUserEntry)}
                          {currentUserEntry.isPremium && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs rounded-full">
                              Premium
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-[#40b236] text-white text-xs rounded-full">
                            Sina
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right font-bold">
                        {currentUserEntry.points.toLocaleString('et-EE')}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#2c313a] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#40b236]">15</div>
              <div className="text-sm text-gray-400">Kokku kasutajaid</div>
            </div>
            <div className="bg-[#2c313a] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#40b236]">7.</div>
              <div className="text-sm text-gray-400">Sinu koht</div>
            </div>
            <div className="bg-[#2c313a] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#40b236]">3,156</div>
              <div className="text-sm text-gray-400">Sinu punktid</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}