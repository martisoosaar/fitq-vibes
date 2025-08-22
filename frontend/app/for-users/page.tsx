'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Trophy, Dumbbell, Users, Play,
  CheckCircle, Heart, TrendingUp, Target,
  ArrowRight, Star, Clock, Activity
} from 'lucide-react'

export default function ForUsersPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          setIsLoggedIn(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    checkAuth()
  }, [])

  const functionalities = [
    {
      icon: <Trophy className="w-12 h-12" />,
      headline: 'Väljakutsed',
      title: 'Osale põnevates väljakutsetes ja võistle teistega'
    },
    {
      icon: <Dumbbell className="w-12 h-12" />,
      headline: 'Kategooriad',
      title: 'Leia endale sobivad treeningud erinevatest kategooriatest'
    },
    {
      icon: <Users className="w-12 h-12" />,
      headline: 'Treenerid',
      title: 'Treeni koos Eesti parimate treeneritega'
    },
    {
      icon: <Play className="w-12 h-12" />,
      headline: 'Videotreeningud',
      title: 'Sadu kvaliteetseid treeningvideosid igale tasemele'
    }
  ]

  const reasons = [
    'Treeni kodus või jõusaalis - sina valid koha ja aja',
    'Jälgi oma arengut ja püstita uusi eesmärke',
    'Liitu kogukonnaga ja leia endale trennisõbrad'
  ]

  const reviews = [
    {
      name: 'Mari Mets',
      rating: 5,
      text: 'FitQ on muutnud mu treeningharjumusi täielikult. Nüüd treenimine on lõbus ja motiveeriv!',
      avatar: '/images/avatar1.svg'
    },
    {
      name: 'Toomas Tamm',
      rating: 5,
      text: 'Suurepärane platvorm! Treenerid on professionaalsed ja videod kvaliteetsed.',
      avatar: '/images/avatar2.svg'
    },
    {
      name: 'Liis Leht',
      rating: 5,
      text: 'Väljakutsed hoiavad mind motiveerituna. Olen saavutanud paremaid tulemusi kui kunagi varem!',
      avatar: '/images/avatar3.svg'
    }
  ]

  return (
    <div className="min-h-screen bg-[#2c313a] text-white">
      {/* Hero Section */}
      <section 
        className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(44, 49, 58, 0) 33%, rgba(44, 49, 58, 0.9) 87%), url('/images/hero_users.jpg')`
        }}
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Treeni targalt,<br />
              saavuta rohkem
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Sajad treeningud, programmid ja väljakutsed. Alusta täna, liitu lemmiktreeneritega ning jälgi oma arengut.
            </p>
            
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#40b236] hover:bg-[#60cc56] rounded-lg font-bold text-lg transition-colors"
              >
                Minu töölaud
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/register#premium"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#40b236] hover:bg-[#60cc56] rounded-lg font-bold text-lg transition-colors"
              >
                Alusta treenimist
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Functionalities Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kõik mida vajad ühes kohas
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              FitQ platvorm pakub sulle kõiki tööriistu, et muuta treenimine lihtsaks ja lõbusaks
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {functionalities.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-[#40b236] mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.headline}</h3>
                <p className="text-gray-300 text-sm">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers Banner */}
      <section className="py-20 bg-[#3e4551]">
        <div className="max-w-6xl mx-auto px-6">
          <div 
            className="relative rounded-lg overflow-hidden h-[400px] md:h-[500px] flex items-end bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(44, 49, 58, 0.35), rgba(44, 49, 58, 0.35)), url('/images/users-trainersbanner.jpg')`
            }}
          >
            <div className="p-8 md:p-12 max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Eesti parimad treenerid
              </h2>
              <p className="text-lg mb-6">
                Leia endale sobiv treener ja alusta oma teekonda parema vormi poole
              </p>
              <Link
                href={isLoggedIn ? '/programs' : '/register'}
                className="inline-block px-6 py-3 bg-white text-[#2c313a] hover:bg-gray-100 rounded-lg font-bold transition-colors"
              >
                Vaata programme
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Training Banner */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div 
            className="relative rounded-lg overflow-hidden h-[400px] md:h-[500px] flex items-end justify-end bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(44, 49, 58, 0.35), rgba(44, 49, 58, 0.35)), url('/images/users_personal_training.jpg')`
            }}
          >
            <div className="p-8 md:p-12 max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Personaaltreening
              </h2>
              <p className="text-lg mb-6">
                Saavuta oma eesmärgid kiiremini personaalse juhendamisega
              </p>
              <Link
                href={isLoggedIn ? '/programs' : '/register'}
                className="inline-block px-6 py-3 bg-white text-[#2c313a] hover:bg-gray-100 rounded-lg font-bold transition-colors"
              >
                Leia treener
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reasons Section */}
      <section className="py-20 bg-[#3e4551]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Miks valida FitQ?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Tuhandeid inimesi on juba alustanud oma teekonda parema tervise poole
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {reasons.map((reason, index) => (
              <div key={index} className="bg-[#2c313a] p-8 rounded-lg text-center">
                <div className="text-[#40b236] mb-4 flex justify-center">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <p className="text-lg">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Mida ütlevad meie kasutajad
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="bg-[#3e4551] p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#4d5665] rounded-full"></div>
                  <div>
                    <p className="font-bold">{review.name}</p>
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA Section */}
      {!isLoggedIn && (
        <section className="py-20 bg-[#40b236]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Alusta oma teekonda täna!
            </h2>
            <p className="text-xl mb-8">
              Liitu tuhandete inimestega, kes on juba alustanud treeningutega FitQ platvormil
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-white text-[#40b236] hover:bg-gray-100 rounded-lg font-bold text-lg transition-colors"
            >
              Registreeru tasuta
            </Link>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 bg-[#2c313a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#40b236]">500+</div>
              <p className="text-gray-300">Treeningvideot</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#40b236]">50+</div>
              <p className="text-gray-300">Professionaalset treenerit</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#40b236]">100+</div>
              <p className="text-gray-300">Treeningprogrammi</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#40b236]">5000+</div>
              <p className="text-gray-300">Aktiivset kasutajat</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

