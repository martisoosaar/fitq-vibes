'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

interface Program {
  id: number
  title: string
  shortDescription: string
  description: string
  picture: string | null
  slug: string
  unitLength: string
  unitVisibility: string
  languageId: number
  status: string
  commentsEnabled: boolean
  feedbackEnabled: boolean
  createdAt: string
  trainer: {
    id: number
    name: string
    avatar: string
    slug: string
  } | null
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  const q = searchParams.get('q') || ''

  useEffect(() => {
    fetchPrograms()
  }, [])

  useEffect(() => {
    filterPrograms(q)
  }, [q, programs])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      setError(false)
      
      const response = await fetch('/api/programs')
      if (!response.ok) {
        throw new Error('Failed to fetch programs')
      }
      
      const data = await response.json()
      setPrograms(data)
      setFilteredPrograms(data)
    } catch (err) {
      console.error('Failed to fetch programs:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const filterPrograms = (search: string) => {
    if (!search) {
      setFilteredPrograms(programs)
    } else {
      const filtered = programs.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
        (p.trainer?.name && p.trainer.name.toLowerCase().includes(search.toLowerCase()))
      )
      setFilteredPrograms(filtered)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    router.push(`/programs?${params.toString()}`)
  }

  const hasFilters = !!q

  return (
    <div className="bg-[#2c313a] text-white pb-12">
      {/* Page Header */}
      <div className="bg-[#3e4551] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-2xl md:text-3xl font-bold">Programmid</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        {/* Description */}
        <p className="text-gray-300 mb-6 max-w-2xl">
          Treeningprogrammid on valitud treenerite poolt kokku pandud treeningute kogumikud. 
          Programmid kestavad tavaliselt 4-12 nädalat ning sisaldavad süsteemseid treeninguid kindla eesmärgi saavutamiseks.
        </p>

        {/* Search */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              value={q}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Otsi programme..."
              className="w-full px-4 py-3 pr-10 bg-[#3e4551] border border-[#4d5665] rounded-lg focus:outline-none focus:border-[#40b236] transition-colors"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-400">Programmide laadimine ebaõnnestus. Palun proovi hiljem uuesti.</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && hasFilters && filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-semibold">Tulemusi ei leitud</p>
          </div>
        )}

        {/* Programs Grid */}
        {!loading && !error && filteredPrograms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <Link key={program.id} href={`/programs/${program.id}`} className="bg-[#3e4551] rounded-lg overflow-hidden hover:shadow-xl transition-shadow group">
                {/* Image */}
                <div className="aspect-[16/9] relative bg-[#4d5665] overflow-hidden">
                  {program.picture && program.picture.startsWith('http') ? (
                    <img
                      src={program.picture}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.placeholder')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex flex-col items-center justify-center ${program.picture && program.picture.startsWith('http') ? 'placeholder hidden' : ''}`}>
                    <svg className="w-20 h-20 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span className="text-gray-500 text-sm">Programm</span>
                  </div>
                  {program.feedbackEnabled && (
                    <div className="absolute top-2 right-2 bg-[#40b236] text-white px-2 py-1 rounded text-xs font-medium">
                      Tagasisidega
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{program.title}</h3>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2" 
                     dangerouslySetInnerHTML={{ __html: program.shortDescription }} />
                  
                  {program.trainer && (
                    <div className="flex items-center gap-2 text-sm">
                      {program.trainer.avatar ? (
                        <img
                          src={program.trainer.avatar}
                          alt={program.trainer.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#4d5665] flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <span className="text-gray-300">{program.trainer.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{program.unitLength === 'DAY' ? 'Päevapõhine' : 'Nädalapõhine'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}