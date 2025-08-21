'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  Play, FileText, Download, Activity, Heart, CheckSquare, 
  ArrowLeft, Clock, ChevronLeft, ChevronRight 
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

interface Program {
  id: number
  title: string
  trainer: {
    id: number
    name: string
  } | null
  units: ProgramUnit[]
}

export default function ProgramUnitPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const unitId = params.unitId as string
  
  const [program, setProgram] = useState<Program | null>(null)
  const [currentUnit, setCurrentUnit] = useState<ProgramUnit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/programs/${slug}`)
        if (!response.ok) {
          throw new Error('Program not found')
        }
        const data = await response.json()
        setProgram(data)
        
        // Find the current unit
        const unit = data.units.find((u: ProgramUnit) => u.id === parseInt(unitId))
        if (!unit) {
          throw new Error('Unit not found')
        }
        setCurrentUnit(unit)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, unitId])

  const toggleTaskComplete = (taskId: string) => {
    const newCompleted = new Set(completedTasks)
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId)
    } else {
      newCompleted.add(taskId)
    }
    setCompletedTasks(newCompleted)
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} min`
  }

  if (loading) {
    return (
      <div className="bg-[#2c313a] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
          <p className="mt-4 text-gray-300">Laen treeningprogrammi...</p>
        </div>
      </div>
    )
  }

  if (error || !program || !currentUnit) {
    return (
      <div className="bg-[#2c313a] text-white min-h-screen">
        <div className="bg-[#3e4551] py-8">
          <div className="max-w-[1200px] mx-auto px-6">
            <h1 className="text-2xl md:text-3xl font-bold">Ühik ei leitud</h1>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 pt-8">
          <p className="text-gray-300 mb-4">{error || 'Soovitud ühikut ei leitud.'}</p>
          <Link href={`/programs/${slug}`} className="text-[#40b236] hover:text-green-400">
            ← Tagasi programmi juurde
          </Link>
        </div>
      </div>
    )
  }

  // Find current unit index and adjacent units
  const unitIndex = program.units.findIndex(u => u.id === currentUnit.id)
  const prevUnit = unitIndex > 0 ? program.units[unitIndex - 1] : null
  const nextUnit = unitIndex < program.units.length - 1 ? program.units[unitIndex + 1] : null

  return (
    <div className="bg-[#2c313a] text-white min-h-screen">
      {/* Page Header */}
      <div className="bg-[#3e4551] py-6">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/programs/${slug}`} className="text-[#40b236] hover:text-green-400 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {program.title}
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{currentUnit.title}</h1>
              <p className="text-gray-300 mt-1">
                Ühik {unitIndex + 1} / {program.units.length}
              </p>
            </div>
            {/* Navigation between units */}
            <div className="flex items-center gap-2">
              {prevUnit ? (
                <Link
                  href={`/programs/${slug}/unit/${prevUnit.id}`}
                  className="p-2 rounded-lg bg-[#4d5665] hover:bg-[#525a6b] transition-colors"
                  title="Eelmine ühik"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              ) : (
                <div className="p-2 rounded-lg bg-[#3e4551] opacity-50 cursor-not-allowed">
                  <ChevronLeft className="h-5 w-5" />
                </div>
              )}
              {nextUnit ? (
                <Link
                  href={`/programs/${slug}/unit/${nextUnit.id}`}
                  className="p-2 rounded-lg bg-[#4d5665] hover:bg-[#525a6b] transition-colors"
                  title="Järgmine ühik"
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
              ) : (
                <div className="p-2 rounded-lg bg-[#3e4551] opacity-50 cursor-not-allowed">
                  <ChevronRight className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Unit Description */}
            {currentUnit.description && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <div 
                  className="text-gray-300"
                  dangerouslySetInnerHTML={{ __html: currentUnit.description }}
                />
              </div>
            )}

            {/* Text Tasks */}
            {currentUnit.textTasks.length > 0 && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Ülesanded
                </h2>
                <div className="space-y-3">
                  {currentUnit.textTasks
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((task) => {
                      const taskId = `text-${task.id}`
                      const isCompleted = completedTasks.has(taskId)
                      
                      return (
                        <div key={task.id} className="bg-[#4d5665] rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleTaskComplete(taskId)}
                              className={`mt-1 p-2 rounded transition-colors flex-shrink-0 ${
                                isCompleted 
                                  ? 'bg-[#40b236] text-white' 
                                  : 'bg-[#3e4551] hover:bg-[#525a6b] text-gray-400'
                              }`}
                            >
                              <CheckSquare className="h-4 w-4" />
                            </button>
                            <div className="flex-1">
                              <h3 className={`font-medium mb-2 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                                {task.title}
                              </h3>
                              {task.description && (
                                <div 
                                  className={`text-sm ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}
                                  dangerouslySetInnerHTML={{ __html: task.description }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Video Tasks */}
            {currentUnit.videoTasks.length > 0 && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Tänane Treeningvideo
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentUnit.videoTasks
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-[#4d5665] rounded-lg overflow-hidden"
                      >
                        <Link
                          href={`/videos/${task.video.id}`}
                          className="block hover:opacity-90 transition-opacity group"
                        >
                          <div className="aspect-video bg-[#2c313a] relative">
                            {task.video.thumbnail ? (
                              <img
                                src={task.video.thumbnail}
                                alt={task.video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="h-12 w-12 text-gray-500" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-12 w-12 text-white" />
                            </div>
                          </div>
                        </Link>
                        <div className="p-4">
                          <p className="font-medium line-clamp-2 mb-2">{task.video.title}</p>
                          {task.video.duration > 0 && (
                            <p className="text-sm text-gray-400 mb-3 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDuration(task.video.duration)}
                            </p>
                          )}
                          <Link
                            href={`/videos/${task.video.id}`}
                            className="inline-flex items-center gap-2 bg-[#40b236] hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                          >
                            <Play className="h-4 w-4" />
                            VAATA VIDEOT
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Workout Template Tasks */}
            {currentUnit.workoutTasks.length > 0 && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Treeningud
                </h2>
                <div className="space-y-3">
                  {currentUnit.workoutTasks
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((task) => (
                      <div key={task.id} className="bg-[#4d5665] rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">
                              Treening #{task.workoutTemplateId}
                            </p>
                          </div>
                          <Activity className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Cardio Template Tasks */}
            {currentUnit.cardioTasks.length > 0 && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Kardio
                </h2>
                <div className="space-y-3">
                  {currentUnit.cardioTasks
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((task) => (
                      <div key={task.id} className="bg-[#4d5665] rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">
                              Kardio #{task.cardioTemplateId}
                            </p>
                          </div>
                          <Heart className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Video Materials */}
            {currentUnit.videoMaterials.length > 0 && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Lisamaterjalid
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentUnit.videoMaterials.map((video) => (
                    <Link
                      key={video.id}
                      href={`/videos/${video.id}`}
                      className="bg-[#4d5665] rounded-lg overflow-hidden hover:bg-[#525a6b] transition-colors group"
                    >
                      <div className="aspect-video bg-[#2c313a] relative">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="h-12 w-12 text-gray-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-medium line-clamp-2">{video.title}</p>
                        {video.duration > 0 && (
                          <p className="text-sm text-gray-400 mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDuration(video.duration)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {currentUnit.files.length > 0 && (
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Programmi Abimaterjalid
                </h2>
                <div className="space-y-2">
                  {currentUnit.files
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((file) => (
                      <a
                        key={file.id}
                        href={file.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 rounded-lg bg-[#4d5665] hover:bg-[#525a6b] transition-colors"
                      >
                        <Download className="h-5 w-5 text-gray-400 mr-3" />
                        <p className="font-medium flex-1">{file.title}</p>
                        <span className="text-sm text-gray-400 bg-[#3e4551] px-2 py-1 rounded">
                          {file.file.split('.').pop()?.toUpperCase()}
                        </span>
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-[#3e4551] rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Edenemine</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Ülesandeid:</span>
                  <span className="font-medium">{currentUnit.textTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tehtud:</span>
                  <span className="font-medium text-[#40b236]">
                    {Array.from(completedTasks).filter(id => id.startsWith('text-')).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Videoid:</span>
                  <span className="font-medium">
                    {currentUnit.videoTasks.length + currentUnit.videoMaterials.length}
                  </span>
                </div>
                {currentUnit.files.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Faile:</span>
                    <span className="font-medium">{currentUnit.files.length}</span>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="bg-[#4d5665] rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#40b236] h-full transition-all duration-300"
                    style={{
                      width: `${currentUnit.textTasks.length > 0 
                        ? (Array.from(completedTasks).filter(id => id.startsWith('text-')).length / currentUnit.textTasks.length) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Unit Navigation */}
            <div className="bg-[#3e4551] rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Programmi ühikud</h3>
              <div className="space-y-2">
                {program.units
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((unit, index) => (
                    <Link
                      key={unit.id}
                      href={`/programs/${slug}/unit/${unit.id}`}
                      className={`block p-2 rounded-lg transition-colors ${
                        unit.id === currentUnit.id 
                          ? 'bg-[#40b236] text-white' 
                          : 'hover:bg-[#4d5665]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`${unit.id === currentUnit.id ? 'bg-white text-[#40b236]' : 'bg-[#4d5665]'} rounded-full w-5 h-5 flex items-center justify-center text-xs`}>
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium truncate">{unit.title}</span>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}