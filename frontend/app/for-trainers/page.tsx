'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  CheckCircle, Users, TrendingUp, Clock, 
  CreditCard, BarChart3, MessageCircle, Video, 
  Target, Heart, Star, ArrowRight
} from 'lucide-react'

export default function ForTrainersPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isTrainer, setIsTrainer] = useState(false)
  const [trainerSlug, setTrainerSlug] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setIsLoggedIn(true)
          setIsTrainer(data.user?.isTrainer || false)
          setTrainerSlug(data.user?.slug || '')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    checkAuth()
  }, [])

  const benefits = [
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Laienda oma klientuuri',
      description: 'Jõua tuhandete motiveeritud treenijateni üle Eesti'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Kasvata oma sissetulekut',
      description: 'Müü programme, personaaltreeninguid ja tellimusi'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Paindlik ajakava',
      description: 'Treeni kliente ajal ja kohas, mis sulle sobib'
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: 'Professionaalne platvorm',
      description: 'Kasuta tipptasemel tööriistu ja tehnoloogiat'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Detailne analüütika',
      description: 'Jälgi oma edu ja kliendistatistikat reaalajas'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Toetav kogukond',
      description: 'Liitu Eesti parimate treenerite võrgustikuga'
    }
  ]

  const features = [
    {
      title: 'Video treeningud',
      description: 'Loo ja jaga kvaliteetseid treeningvideosid',
      icon: <Video className="w-6 h-6" />
    },
    {
      title: 'Programmide müük',
      description: 'Müü terviklikke treeningprogramme',
      icon: <Target className="w-6 h-6" />
    },
    {
      title: 'Personaaltreening',
      description: 'Paku 1:1 online või offline treeninguid',
      icon: <Users className="w-6 h-6" />
    },
    {
      title: 'Messenger',
      description: 'Suhtle klientidega otse platvormil',
      icon: <MessageCircle className="w-6 h-6" />
    },
    {
      title: 'Maksed',
      description: 'Turvalised maksed ja automaatne arveldus',
      icon: <CreditCard className="w-6 h-6" />
    },
    {
      title: 'Statistika',
      description: 'Põhjalik ülevaade sinu tegevusest',
      icon: <BarChart3 className="w-6 h-6" />
    }
  ]

  const successStories = [
    {
      name: 'Maria Mägi',
      role: 'Personaaltreener',
      image: '/images/trainer-maria.svg',
      quote: 'FitQ platvorm on muutnud mu treenerikarjääri. Nüüd saan aidata kliente üle kogu Eesti!',
      clients: 156,
      rating: 4.9
    },
    {
      name: 'Hendrik Vahtrik',
      role: 'Jõusaali treener',
      image: '/images/trainer-hendrik.svg',
      quote: 'Videotreeningute müük on andnud mulle täiesti uue sissetulekuallika.',
      clients: 89,
      rating: 4.8
    },
    {
      name: 'Keirin Kask',
      role: 'Joogatreener',
      image: '/images/trainer-keirin.svg',
      quote: 'Platvormi kasutamine on lihtne ja mugav. Soovitan kõigile kolleegidele!',
      clients: 234,
      rating: 5.0
    }
  ]

  return (
    <div className="min-h-screen bg-[#2c313a] text-white">
      {/* Hero Section */}
      <section 
        className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(44, 49, 58, 0) 33%, rgba(44, 49, 58, 0.9) 87%), url('/images/hero_trainers.jpg')`
        }}
      >
        <div className="max-w-6xl mx-auto px-6 text-center md:text-left">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Kasvata oma<br />
              <span className="text-[#40b236]">treeneriäri</span><br />
              FitQ platvormil
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Liitu Eesti suurima online treeningkeskkonnaga ja jõua tuhandete motiveeritud treenijateni
            </p>
            
            {isTrainer ? (
              <Link
                href={`/profile/${trainerSlug}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#40b236] hover:bg-[#60cc56] rounded-lg font-bold text-lg transition-colors"
              >
                Minu kanal
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <a
                href="https://forms.fitq.me/trainers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#40b236] hover:bg-[#60cc56] rounded-lg font-bold text-lg transition-colors"
              >
                Liitu treenerina
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[#3e4551]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Miks valida FitQ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-[#2c313a] p-6 rounded-lg">
                <div className="text-[#40b236] mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Kõik vajalik ühes kohas
          </h2>
          <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
            FitQ platvorm pakub kõiki tööriistu, mida vajad eduka online treeneriäri ülesehitamiseks
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-[#3e4551] p-6 rounded-lg hover:bg-[#4d5665] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-[#40b236] mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="font-bold mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-300">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-[#3e4551]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Meie treenerite edulood
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-[#2c313a] p-6 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-16 h-16 rounded-full bg-[#4d5665]"
                  />
                  <div>
                    <h3 className="font-bold">{story.name}</h3>
                    <p className="text-sm text-gray-400">{story.role}</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4 italic">"{story.quote}"</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{story.clients} klienti</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{story.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#40b236]">50+</div>
              <p className="text-gray-300">Aktiivset treenerit</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#40b236]">5000+</div>
              <p className="text-gray-300">Aktiivset kasutajat</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#40b236]">500+</div>
              <p className="text-gray-300">Treeningvideot</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#40b236]">4.8</div>
              <p className="text-gray-300">Keskmine hinnang</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#40b236] to-[#60cc56]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Alusta oma treenerikarjääri täna!
          </h2>
          <p className="text-xl mb-8">
            Liitumine on tasuta ja võtab vaid paar minutit
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://forms.fitq.me/trainers"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-[#40b236] hover:bg-gray-100 rounded-lg font-bold text-lg transition-colors"
            >
              Täida liitumisvorm
            </a>
            <Link
              href="/trainers"
              className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white/10 rounded-lg font-bold text-lg transition-colors"
            >
              Vaata treenereid
            </Link>
          </div>
          
          <p className="mt-8 text-sm">
            Küsimuste korral kirjuta meile: trainers@fitq.ee
          </p>
        </div>
      </section>
    </div>
  )
}