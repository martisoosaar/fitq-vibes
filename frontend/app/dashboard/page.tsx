'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatsBoxes from '@/components/Dashboard/StatsBoxes'
import MonthlyChallenge from '@/components/Dashboard/MonthlyChallenge'
import DailyVideo from '@/components/Dashboard/DailyVideo'
import WeeklySchedule from '@/components/Dashboard/WeeklySchedule'
import Challenges from '@/components/Dashboard/Challenges'
import ActivePrograms from '@/components/Dashboard/ActivePrograms'
import Leaderboard from '@/components/Dashboard/Leaderboard'
import TrainingHistory from '@/components/Dashboard/TrainingHistory'
import ProgressTab from '@/components/Dashboard/ProgressTab'

interface GlobalStats {
  points: number
  pointsThisMonth: number
  level: number
  currentStrike: number
  bestStrike: number
  trainingsDone: number
  fitnessIndex: number
  monthlyChallenge?: {
    title: string
    description: string
    externalLink?: string
    image?: string
    maxPoints: number
  }
}

const tabs = [
  { id: 'dashboard', label: 'Ülevaade' },
  { id: 'leaderboard', label: 'Edetabel' },
  { id: 'training-history', label: 'Treeningpäevik' },
  { id: 'progress', label: 'Progress' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('dashboard')
  const [stats, setStats] = useState<GlobalStats>({
    points: 0,
    pointsThisMonth: 0,
    level: 0,
    currentStrike: 0,
    bestStrike: 0,
    trainingsDone: 0,
    fitnessIndex: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // TODO: Replace with actual API call
      setStats({
        points: 12450,
        pointsThisMonth: 2340,
        level: 24,
        currentStrike: 7,
        bestStrike: 42,
        trainingsDone: 156,
        fitnessIndex: 78,
        monthlyChallenge: {
          title: 'Jaanuar väljakutse',
          description: 'Tee 30 päeva järjest trenni',
          maxPoints: 5000,
        }
      })
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setLoading(false)
    }
  }

  const selectTab = (id: string) => {
    setSelectedTab(id)
  }

  return (
    <div className="bg-[#2c313a] text-white">
      {/* Header */}
      <div className="bg-[#2c313a] border-b border-[#3e4551]">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-2xl md:text-3xl font-bold py-4">Minu töölaud</h1>
          
          {/* Tabs */}
          <div className="flex gap-6 overflow-x-auto pb-2 -mb-[2px]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => selectTab(tab.id)}
                className={`whitespace-nowrap pb-3 px-1 font-semibold transition-colors ${
                  selectedTab === tab.id
                    ? 'text-[#40b236] border-b-2 border-[#40b236]'
                    : 'text-[#f6f7f8] hover:text-[#40b236]'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <a
              href="/videos?favorites=yes"
              className="whitespace-nowrap pb-3 px-1 font-semibold text-[#f6f7f8] hover:text-[#40b236] transition-colors"
            >
              Lemmikud
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 pb-8">
        {selectedTab === 'dashboard' && (
          <div>
            <StatsBoxes stats={stats} loading={loading} />
            <div className="space-y-6 mt-6">
              {stats.monthlyChallenge && (
                <MonthlyChallenge
                  title={stats.monthlyChallenge.title}
                  description={stats.monthlyChallenge.description}
                  externalLink={stats.monthlyChallenge.externalLink}
                  image={stats.monthlyChallenge.image}
                  points={stats.pointsThisMonth}
                  maxPoints={stats.monthlyChallenge.maxPoints}
                />
              )}
              {!isPremium && <DailyVideo />}
              <WeeklySchedule />
              <Challenges />
              <ActivePrograms />
            </div>
          </div>
        )}
        
        {selectedTab === 'leaderboard' && (
          <div className="py-6">
            <Leaderboard />
          </div>
        )}
        {selectedTab === 'training-history' && (
          <div className="py-6">
            <TrainingHistory />
          </div>
        )}
        {selectedTab === 'progress' && (
          <div className="py-6">
            <ProgressTab />
          </div>
        )}
      </div>
    </div>
  )
}