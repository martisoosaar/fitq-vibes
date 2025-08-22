'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

interface Trainer {
  id: number
  name: string
  slug: string
  avatar: string | null
  description: string | null
  videosCount: number
  subscribersCount: number
  hasTickets: boolean
  hasPrograms: boolean
  isVerified: boolean
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    fetchTrainers(true)
  }, [searchQuery])

  const fetchTrainers = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setOffset(0)
        setTrainers([])
      }
      
      const currentOffset = reset ? 0 : offset
      const params = new URLSearchParams({
        limit: '30',
        offset: currentOffset.toString(),
        ...(searchQuery && { q: searchQuery })
      })

      const response = await fetch(`/api/trainers?${params}`)
      if (!response.ok) throw new Error('Failed to fetch trainers')
      
      const data = await response.json()

      if (reset) {
        setTrainers(data.trainers)
        setOffset(30)
      } else {
        setTrainers(prev => [...prev, ...data.trainers])
        setOffset(prev => prev + 30)
      }
      
      setHasMore(data.hasMore)
      setError(false)
    } catch (err) {
      console.error('Failed to fetch trainers:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    router.push(`/trainers?${params.toString()}`)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchTrainers(false)
    }
  }

  return (
    <div className="bg-[#2c313a] text-white pb-12">
      {/* Page Header */}
      <div className="bg-[#3e4551] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Treenerid</h1>
          <p className="text-gray-300">
            Avasta FitQ platvormil tegutsevaid treenereid ja leia endale sobiv juhendaja
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        {/* Search and Filters */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Otsi treenereid..."
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
        {loading && trainers.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-400">Treenerite laadimine ebaõnnestus. Palun proovi hiljem uuesti.</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && trainers.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-semibold">Treenereid ei leitud</p>
            <p className="text-gray-400 mt-2">Proovi muuta otsingut</p>
          </div>
        )}

        {/* Trainers Grid */}
        {trainers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <Link
                key={trainer.id}
                href={`/profile/${trainer.slug}`}
                className="bg-[#3e4551] rounded-lg overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <div className="aspect-square relative bg-[#4d5665] overflow-hidden">
                  {trainer.avatar ? (
                    <img
                      src={trainer.avatar}
                      alt={trainer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/trainers/avatar.png'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {trainer.isVerified && (
                    <div className="absolute top-2 right-2 bg-[#40b236] text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Kinnitatud
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1">{trainer.name}</h3>
                  {trainer.description && (
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                      {trainer.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{trainer.videosCount} videot</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{trainer.subscribersCount}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {trainer.hasTickets && (
                      <span className="inline-block px-2 py-1 bg-[#2c313a] rounded text-xs">
                        Piletid
                      </span>
                    )}
                    {trainer.hasPrograms && (
                      <span className="inline-block px-2 py-1 bg-[#2c313a] rounded text-xs">
                        Programmid
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="bg-[#40b236] hover:bg-[#60cc56] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Laadi veel
            </button>
          </div>
        )}

        {/* Loading More Indicator */}
        {loading && trainers.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#40b236]"></div>
          </div>
        )}
      </div>
    </div>
  )
}