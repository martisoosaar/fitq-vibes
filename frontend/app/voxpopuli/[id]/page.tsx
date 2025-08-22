'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ChevronLeft } from 'lucide-react'

interface CompetitionOption {
  id: number
  title: string
  score: number
  percentage: number
}

interface Workout {
  id: string
  title: string
  image: string
  timeLimits: number[]
}

interface Competition {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  isEnded: boolean
  allowScorePreview: boolean
  options: CompetitionOption[]
  workouts: Workout[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('et-EE', { 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export default function VoxPopuliDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [optionsLoading, setOptionsLoading] = useState<number[]>([])

  useEffect(() => {
    fetchCompetition()
    // Get selected option from cookie
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`vox_populi_option_${params.id}=`))
      ?.split('=')[1]
    if (cookieValue) {
      setSelectedOption(Number(cookieValue))
    }
  }, [params.id])

  const fetchCompetition = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCompetition: Competition = {
        id: Number(params.id),
        title: 'Parim treeningprogramm 2024',
        description: 'Hääletame aasta parima treeningprogrammi poolt. Iga AI test, mille läbid, annab ühe hääle sinu valitud programmile. Mida rohkem trenni teed, seda rohkem hääli saad anda!',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isEnded: false,
        allowScorePreview: true,
        options: [
          { id: 1, title: 'Jõutreening algajatele', score: 245, percentage: 35 },
          { id: 2, title: 'HIIT intensiivprogramm', score: 189, percentage: 27 },
          { id: 3, title: 'Jooga ja venitused', score: 156, percentage: 22 },
          { id: 4, title: 'Funktsionaalne fitness', score: 112, percentage: 16 }
        ],
        workouts: [
          {
            id: 'pushups',
            title: 'Kätekõverdused',
            image: '/images/pushups.jpg',
            timeLimits: [1, 2, 0]
          },
          {
            id: 'squats',
            title: 'Kükid',
            image: '/images/squats.jpg',
            timeLimits: [1, 2, 0]
          },
          {
            id: 'abs',
            title: 'Kõhulihased',
            image: '/images/abs.jpg',
            timeLimits: [1, 2, 0]
          }
        ]
      }
      
      setCompetition(mockCompetition)
    } catch (error) {
      console.error('Failed to fetch competition:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectOption = async (optionId: number) => {
    setOptionsLoading([...optionsLoading, optionId])
    
    // Set cookie
    document.cookie = `vox_populi_option_${params.id}=${optionId}; path=/; max-age=${60*60*24*30}`
    setSelectedOption(optionId)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setOptionsLoading(optionsLoading.filter(id => id !== optionId))
  }

  const getOptionStyle = (percentage: number) => {
    if (!competition?.allowScorePreview && !competition?.isEnded) {
      return {}
    }
    return {
      background: `linear-gradient(to right, rgba(64, 178, 54, 0.2) 0%, rgba(64, 178, 54, 0.2) ${percentage}%, transparent ${percentage}%)`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2c313a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-[#2c313a] flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Hääletust ei leitud</h2>
          <Link 
            href="/voxpopuli"
            className="text-[#40b236] hover:text-[#60cc56] transition-colors"
          >
            Teised hääletused
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#2c313a] text-white">
      {/* Page Header */}
      <div className="bg-[#3e4551] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Tagasi
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">{competition.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-12">
        <div className="bg-[#3e4551] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-[#60cc56] mb-4">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(competition.startDate)} - {formatDate(competition.endDate)}
              {competition.isEnded && <span className="text-red-400 ml-2">- Lõppenud!</span>}
            </span>
          </div>
          
          <p className="text-gray-300 mb-6">{competition.description}</p>

          {/* Voting Options */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">
              {competition.isEnded ? 'Tulemused' : '1. Vali'}
              {!competition.allowScorePreview && !competition.isEnded && (
                <span className="text-sm font-normal text-gray-400 ml-2">
                  (Tulemuste nägemiseks pead kaasa tegema)
                </span>
              )}
            </h3>
            
            <div className="space-y-3">
              {competition.options.map((option) => (
                <div 
                  key={option.id}
                  className="bg-[#2c313a] rounded-lg p-4 relative overflow-hidden"
                  style={getOptionStyle(option.percentage)}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex-1">
                      <h4 className="font-semibold">{option.title}</h4>
                      {competition.allowScorePreview && (
                        <p className="text-sm text-gray-400 mt-1">
                          {option.score} häält ({option.percentage}%)
                        </p>
                      )}
                    </div>
                    
                    {!competition.isEnded && (
                      <div>
                        {selectedOption === option.id ? (
                          <span className="px-4 py-2 bg-[#40b236] text-white rounded-lg font-medium">
                            Valitud
                          </span>
                        ) : (
                          <button
                            onClick={() => selectOption(option.id)}
                            disabled={optionsLoading.includes(option.id)}
                            className="px-4 py-2 bg-[#4d5665] hover:bg-[#5d6775] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {optionsLoading.includes(option.id) ? '...' : 'Vali'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Tests */}
          {!competition.isEnded && (
            <div>
              <h3 className="text-xl font-bold mb-4">2. T(r)eeni valitule hääli</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {competition.workouts.map((workout) => (
                  <div key={workout.id} className="bg-[#2c313a] rounded-lg overflow-hidden">
                    <div className="aspect-video bg-[#4d5665] relative">
                      {workout.image && (
                        <img 
                          src={workout.image} 
                          alt={workout.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <h4 className="p-3 text-lg font-semibold">{workout.title}</h4>
                      </div>
                    </div>
                    
                    <div className="p-3 flex gap-2">
                      {workout.timeLimits.map((time) => (
                        <Link
                          key={time}
                          href={`/ai-tests/${workout.id}?time=${time}&vox-populi-id=${competition.id}`}
                          className="flex-1 text-center px-3 py-2 bg-[#40b236] hover:bg-[#60cc56] text-white rounded font-medium text-sm transition-colors"
                        >
                          {time === 0 ? '∞' : `${time} min`}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}