'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

interface Competition {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  image: string
  isEnded: boolean
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('et-EE', { 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export default function VoxPopuliPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompetitions()
  }, [])

  const fetchCompetitions = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCompetitions: Competition[] = [
        {
          id: 1,
          title: 'Parim treeningprogramm 2024',
          description: 'Hääletame aasta parima treeningprogrammi poolt. Osale ja võida auhindu!',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          image: '/images/vox-populi-1.jpg',
          isEnded: false
        },
        {
          id: 2,
          title: 'Lemmiktreener 2024',
          description: 'Vali oma lemmiktreener ja anna talle oma hääl. Iga treening annab ühe hääle!',
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          image: '/images/vox-populi-2.jpg',
          isEnded: true
        },
        {
          id: 3,
          title: 'Parim väljakutse',
          description: 'Milline väljakutse on sinu lemmik? Hääleta ja võida!',
          startDate: '2024-03-01',
          endDate: '2024-09-30',
          image: '/images/vox-populi-3.jpg',
          isEnded: false
        }
      ]

      setCompetitions(mockCompetitions)
    } catch (error) {
      console.error('Failed to fetch competitions:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#2c313a] text-white">
      {/* Page Header */}
      <div className="bg-[#3e4551] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Vox Populi</h1>
          <div className="text-gray-300">
            <p>Vali endale sobiv hääletus ja tee oma valik. Saab osaleda mitmes hääletuses korraga.</p>
            <p>Seejärel vali AI test ja tee niipalju kordusi, kui palju hääli tahad oma valikule anda.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <div key={competition.id} className="bg-[#3e4551] rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                <Link href={`/voxpopuli/${competition.id}`} className="block">
                  <div className="relative aspect-video bg-[#4d5665]">
                    {competition.image ? (
                      <img 
                        src={competition.image} 
                        alt={competition.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 w-full">
                        <h3 className="text-xl font-bold text-white drop-shadow-lg">
                          {competition.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
                
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-[#60cc56] mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(competition.startDate)} - {formatDate(competition.endDate)}
                      {competition.isEnded && <span className="text-red-400 ml-2">- Lõppenud!</span>}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {competition.description}
                  </p>
                  
                  <Link 
                    href={`/voxpopuli/${competition.id}`}
                    className={`block text-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      competition.isEnded 
                        ? 'bg-[#4d5665] hover:bg-[#5d6775] text-white'
                        : 'bg-[#40b236] hover:bg-[#60cc56] text-white'
                    }`}
                  >
                    {competition.isEnded ? 'Vaata tulemusi' : 'Vaata lähemalt'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && competitions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-400">Hääletusi ei leitud</p>
          </div>
        )}
      </div>
    </div>
  )
}