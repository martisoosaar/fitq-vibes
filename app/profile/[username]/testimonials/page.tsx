'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

interface Testimonial {
  id: number
  rating: number
  comment: string
  createdAt: string
  user: {
    id: number
    name: string
    avatar: string
  }
}

interface TestimonialsData {
  testimonials: Testimonial[]
  totalCount: number
  averageRating: number
}

export default function TestimonialsPage({ params }: { params: Promise<{ username: string }> }) {
  const { user } = useAuth()
  const { username } = use(params)
  const [testimonials, setTestimonials] = useState<TestimonialsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchTestimonials()
  }, [username])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`/api/trainers/${username}/testimonials`)
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data)
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const response = await fetch(`/api/trainers/${username}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, comment })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'Arvustus edukalt lisatud!')
        setShowForm(false)
        setComment('')
        setRating(5)
        fetchTestimonials() // Refresh the list
      } else {
        setError(data.error || 'Midagi läks valesti')
      }
    } catch (error) {
      setError('Viga arvustuse saatmisel')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, size: string = 'text-lg') => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className={`${size} text-yellow-400`} />)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className={`${size} text-yellow-400`} />)
      } else {
        stars.push(<FaRegStar key={i} className={`${size} text-gray-400`} />)
      }
    }
    
    return stars
  }

  const renderInteractiveStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className="focus:outline-none"
        >
          {i <= rating ? (
            <FaStar className="text-2xl text-yellow-400" />
          ) : (
            <FaRegStar className="text-2xl text-gray-400" />
          )}
        </button>
      )
    }
    return stars
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('et-EE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e2228] text-white p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#2d323b] rounded-lg p-6">
                  <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1e2228] text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <Link 
            href={`/profile/${username}`}
            className="text-[#40b236] hover:text-[#359c2d] transition-colors inline-flex items-center gap-2 mb-4"
          >
            ← Tagasi profiilile
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Arvustused</h1>
              {testimonials && testimonials.totalCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(testimonials.averageRating)}
                  </div>
                  <span className="text-lg">
                    {testimonials.averageRating.toFixed(1)} ({testimonials.totalCount} arvustust)
                  </span>
                </div>
              )}
            </div>
            
            {user && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#40b236] hover:bg-[#359c2d] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Lisa arvustus
              </button>
            )}
          </div>
        </div>

        {/* Success/Error messages */}
        {success && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Testimonial form */}
        {showForm && (
          <div className="bg-[#2d323b] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Lisa oma arvustus</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Hinnang</label>
                <div className="flex gap-2">
                  {renderInteractiveStars()}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Kommentaar (vähemalt 10 tähemärki)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-[#1e2228] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40b236]"
                  rows={4}
                  placeholder="Jaga oma kogemust selle treeneriga..."
                  required
                  minLength={10}
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#40b236] hover:bg-[#359c2d] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saadan...' : 'Saada arvustus'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setComment('')
                    setRating(5)
                    setError('')
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Tühista
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Testimonials list */}
        {testimonials && testimonials.testimonials.length > 0 ? (
          <div className="space-y-4">
            {testimonials.testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-[#2d323b] rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={testimonial.user.avatar}
                    alt={testimonial.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{testimonial.user.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(testimonial.rating, 'text-sm')}
                          </div>
                          <span className="text-gray-400 text-sm">
                            {formatDate(testimonial.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300">{testimonial.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <div className="bg-[#2d323b] rounded-lg p-12 text-center">
              <p className="text-gray-400 mb-4">Arvustusi veel pole</p>
              {user && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[#40b236] hover:bg-[#359c2d] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Ole esimene, kes arvustab
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}