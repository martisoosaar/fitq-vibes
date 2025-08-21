'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  Play, Clock, Users, CheckCircle, ChevronDown, ChevronRight, 
  Lock, FileText, Download, Activity, Heart, CheckSquare, ArrowRight 
} from 'lucide-react'

interface Video {
  id: number
  title: string
  duration: number
  vimeoId: string | null
  iframe: string | null
  thumbnail: string | null
}

interface TextTask {
  id: number
  title: string
  description: string | null
  order: number
}

interface VideoTask {
  id: number
  order: number
  video: Video
}

interface File {
  id: number
  title: string
  file: string
  order: number
}

interface WorkoutTask {
  id: number
  title: string
  workoutTemplateId: number
  order: number
}

interface CardioTask {
  id: number
  title: string
  cardioTemplateId: number
  order: number
}

interface ProgramUnit {
  id: number
  title: string
  description: string | null
  order: number
  textTasks: TextTask[]
  videoTasks: VideoTask[]
  videoMaterials: Video[]
  files: File[]
  workoutTasks: WorkoutTask[]
  cardioTasks: CardioTask[]
}

interface IntroVideo {
  id: number
  title: string
  duration: number
  vimeoId: string | null
}

interface Program {
  id: number
  title: string
  shortDescription: string | null
  description: string | null
  picture: string | null
  faq: string | null
  unitLength: string | null
  unitVisibility: string | null
  languageId: number | null
  commentsEnabled: boolean | null
  feedbackEnabled: boolean | null
  introVideo: IntroVideo | null
  trainer: {
    id: number
    slug: string
    name: string
    profilePicture: string | null
  } | null
  units: ProgramUnit[]
}

export default function ProgramPage() {
  const params = useParams()
  const slug = params.slug as string
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProgram() {
      try {
        const response = await fetch(`/api/programs/${slug}`)
        if (!response.ok) {
          throw new Error('Program not found')
        }
        const data = await response.json()
        setProgram(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProgram()
  }, [slug])

  if (loading) {
    return (
      <div className="bg-[#2c313a] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
          <p className="mt-4 text-gray-300">Laen programmi...</p>
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="bg-[#2c313a] text-white min-h-screen">
        <div className="bg-[#3e4551] py-8">
          <div className="max-w-[1200px] mx-auto px-6">
            <h1 className="text-2xl md:text-3xl font-bold">Programm ei leitud</h1>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 pt-8">
          <p className="text-gray-300 mb-4">{error || 'Soovitud programmi ei leitud.'}</p>
          <Link href="/programs" className="text-[#40b236] hover:text-green-400">
            ← Tagasi programmide lehele
          </Link>
        </div>
      </div>
    )
  }

  const totalVideos = program.units.reduce((total, unit) => 
    total + unit.videoTasks.length + unit.videoMaterials.length, 0
  )
  const totalTasks = program.units.reduce((total, unit) => 
    total + unit.textTasks.length + unit.videoTasks.length + 
    unit.workoutTasks.length + unit.cardioTasks.length, 0
  )

  const isUnitAccessible = (unit: ProgramUnit, index: number) => {
    // Always allow access to the first unit
    if (index === 0) return true
    
    // For VISIBLE_AFTER_PREVIOUS, check if all previous units are completed
    if (program?.unitVisibility === 'VISIBLE_AFTER_PREVIOUS') {
      // For now, simulate that user has access to first few units
      // In real implementation, this would check user's progress
      return index <= 2 // Allow access to first 3 units for demo
    }
    
    // For other visibility modes, allow access to all units
    return true
  }

  return (
    <div className="bg-[#2c313a] text-white min-h-screen">
      {/* Page Header */}
      <div className="bg-[#3e4551] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/programs" className="text-[#40b236] hover:text-green-400">
              ← Programmid
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{program.title}</h1>
          {program.shortDescription && (
            <div 
              className="text-gray-300 mt-2"
              dangerouslySetInnerHTML={{ __html: program.shortDescription }}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Program Image */}
            {program.picture && (
              <div className="bg-[#3e4551] rounded-lg overflow-hidden">
                <div className="aspect-[16/9] relative">
                  <img
                    src={program.picture}
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Intro Video */}
            {program.introVideo && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Tutvustusvideo
                </h2>
                <Link
                  href={`/videos/${program.introVideo.id}`}
                  className="block bg-[#4d5665] rounded-lg overflow-hidden hover:bg-[#525a6b] transition-colors group"
                >
                  <div className="aspect-video bg-[#2c313a] relative">
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-16 w-16 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white font-medium">{program.introVideo.title}</p>
                      {program.introVideo.duration > 0 && (
                        <p className="text-sm text-gray-300 mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor(program.introVideo.duration / 60)} min
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Program Description */}
            {program.description && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Programmi kirjeldus</h2>
                <div 
                  className="text-gray-300 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: program.description }}
                />
              </div>
            )}

            {/* Program Units */}
            <div className="bg-[#3e4551] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Programmi sisu</h2>
              
              {program.units.length === 0 ? (
                <p className="text-gray-300">Selle programmi jaoks pole veel ühikuid saadaval.</p>
              ) : (
                <div className="space-y-4">
                  {program.units
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((unit, index) => {
                      const isAccessible = isUnitAccessible(unit, index)
                      const hasContent = unit.textTasks.length > 0 || unit.videoTasks.length > 0 || 
                                       unit.videoMaterials.length > 0 || unit.files.length > 0 ||
                                       unit.workoutTasks.length > 0 || unit.cardioTasks.length > 0
                      
                      return (
                        <div key={unit.id} className="bg-[#4d5665] rounded-lg overflow-hidden">
                          <div className="p-4">
                            {/* Unit Header */}
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold flex items-center">
                                <span className={`${isAccessible ? 'bg-[#40b236]' : 'bg-gray-600'} text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 flex-shrink-0`}>
                                  {isAccessible ? (index + 1) : <Lock className="h-3 w-3" />}
                                </span>
                                <span className={isAccessible ? '' : 'text-gray-400'}>
                                  {unit.title}
                                </span>
                              </h3>
                              {/* Task counts */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {unit.textTasks.length > 0 && (
                                  <span className="text-xs text-gray-400 bg-[#3e4551] px-2 py-1 rounded">
                                    {unit.textTasks.length} ülesanne{unit.textTasks.length !== 1 ? 't' : ''}
                                  </span>
                                )}
                                {(unit.videoTasks.length + unit.videoMaterials.length) > 0 && (
                                  <span className="text-xs text-gray-400 bg-[#3e4551] px-2 py-1 rounded">
                                    {unit.videoTasks.length + unit.videoMaterials.length} video{(unit.videoTasks.length + unit.videoMaterials.length) !== 1 ? 't' : ''}
                                  </span>
                                )}
                                {unit.files.length > 0 && (
                                  <span className="text-xs text-gray-400 bg-[#3e4551] px-2 py-1 rounded">
                                    {unit.files.length} fail{unit.files.length !== 1 ? 'i' : ''}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Unit Description */}
                            {unit.description && (
                              <div 
                                className="text-gray-300 text-sm mb-4 ml-9"
                                dangerouslySetInnerHTML={{ __html: unit.description }}
                              />
                            )}

                            {/* Action Button or Lock Message */}
                            <div className="ml-9">
                              {isAccessible ? (
                                <Link
                                  href={`/programs/${slug}/unit/${unit.id}`}
                                  className="inline-flex items-center gap-2 bg-[#40b236] hover:bg-green-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                                >
                                  VAATA LÄHEMALT
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              ) : (
                                <div className="flex items-center gap-3 text-gray-400">
                                  <Lock className="h-5 w-5" />
                                  <span className="text-sm">See ühik avaneb pärast eelmiste ühikute lõpetamist</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* FAQ Section */}
            {program.faq && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Korduma kippuvad küsimused</h2>
                <div 
                  className="text-gray-300 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: program.faq }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Program Info */}
            <div className="bg-[#3e4551] rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Programmi detailid</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Programmi pikkus:</span>
                  <span className="font-medium">
                    {program.units.length} {program.unitLength === 'WEEK' ? 'nädalat' : 
                                             program.unitLength === 'DAY' ? 'päeva' : 
                                             program.unitLength?.toLowerCase() || 'ühikut'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Ülesandeid:</span>
                  <span className="font-medium">{totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Videoid:</span>
                  <span className="font-medium">{totalVideos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Kommentaarid:</span>
                  <span className="font-medium">
                    {program.commentsEnabled ? (
                      <CheckCircle className="h-4 w-4 text-[#40b236] inline" />
                    ) : (
                      <span className="text-gray-500">Keelatud</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tagasiside:</span>
                  <span className="font-medium">
                    {program.feedbackEnabled ? (
                      <CheckCircle className="h-4 w-4 text-[#40b236] inline" />
                    ) : (
                      <span className="text-gray-500">Keelatud</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Trainer Info */}
            {program.trainer && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Treener</h3>
                <Link 
                  href={`/profile/${program.trainer.slug}`}
                  className="flex items-center hover:bg-[#4d5665] rounded-lg p-3 -m-3 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {program.trainer.profilePicture ? (
                      <img
                        src={program.trainer.profilePicture}
                        alt={program.trainer.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            const fallback = document.createElement('div')
                            fallback.className = 'w-12 h-12 bg-[#4d5665] rounded-full flex items-center justify-center'
                            fallback.innerHTML = `<span class="text-gray-300 font-medium">${program.trainer?.name.charAt(0).toUpperCase() || '?'}</span>`
                            parent.appendChild(fallback)
                          }
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#4d5665] rounded-full flex items-center justify-center">
                        <span className="text-gray-300 font-medium">
                          {program.trainer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{program.trainer.name}</p>
                    <p className="text-sm text-gray-400">Treener</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}