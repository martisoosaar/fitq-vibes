'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, Users, Award, TrendingUp, CheckCircle, Star, Calendar, Clock } from 'lucide-react'

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      name: "Mari Maasikas",
      role: "Regulaarne kasutaja",
      content: "FitQ on muutnud mu treeningharjumused täielikult. Videotreeningud on professionaalsed ja motiveerivad!",
      rating: 5,
      avatar: "MM"
    },
    {
      name: "Jaan Tamm",
      role: "Algaja sportlane",
      content: "Personaalsed programmid on aidanud mul saavutada tulemusi, millest ma varem unistadagi ei julgenud.",
      rating: 5,
      avatar: "JT"
    },
    {
      name: "Liis Sepp",
      role: "Treener",
      content: "Platvormina pakub FitQ kõike, mida ma oma klientidele pakkuda tahan - videoid, programme ja väljakutseid.",
      rating: 5,
      avatar: "LS"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#2c313a]">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2c313a]/50 via-[#2c313a]/70 to-[#2c313a] z-10"></div>
        
        {/* Video placeholder - replace with actual video */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#40b236] to-[#2c313a] opacity-30"></div>
        
        {/* Hero Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Treeni koos Eesti <span className="text-[#40b236]">parimatega</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-fade-in-delay">
            Videotreeningud, personaalprogrammid ja treenerite kogukond — kõik ühes kohas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
            <Link href="/register" className="px-8 py-4 bg-[#40b236] hover:bg-[#60cc56] text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg">
              Alusta tasuta prooviperioodiga
            </Link>
            <Link href="/login" className="px-8 py-4 bg-[#3e4551] hover:bg-[#4d5665] text-white font-bold rounded-lg transition-all transform hover:scale-105">
              Logi sisse
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#40b236]">500+</div>
              <div className="text-gray-400 mt-2">Videotreeningut</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#40b236]">50+</div>
              <div className="text-gray-400 mt-2">Professionaalset treenerit</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#40b236]">10000+</div>
              <div className="text-gray-400 mt-2">Aktiivset kasutajat</div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Miks valida <span className="text-[#40b236]">FitQ</span>?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#3e4551] rounded-lg p-6 hover:bg-[#4d5665] transition-colors">
              <Play className="w-12 h-12 text-[#40b236] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Videotreeningud</h3>
              <p className="text-gray-400">Professionaalsed HD-kvaliteedis treeningvideod igale tasemele</p>
            </div>
            <div className="bg-[#3e4551] rounded-lg p-6 hover:bg-[#4d5665] transition-colors">
              <Users className="w-12 h-12 text-[#40b236] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Personaalprogrammid</h3>
              <p className="text-gray-400">Sinu eesmärkidele kohandatud treeningkavad</p>
            </div>
            <div className="bg-[#3e4551] rounded-lg p-6 hover:bg-[#4d5665] transition-colors">
              <Award className="w-12 h-12 text-[#40b236] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Väljakutsed</h3>
              <p className="text-gray-400">Osale põnevates väljakutsetes ja võistle teistega</p>
            </div>
            <div className="bg-[#3e4551] rounded-lg p-6 hover:bg-[#4d5665] transition-colors">
              <TrendingUp className="w-12 h-12 text-[#40b236] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Edusammude jälgimine</h3>
              <p className="text-gray-400">Jälgi oma arengut ja saavuta eesmärgid kiiremini</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Trainers */}
      <section className="py-20 px-6 bg-[#3e4551]/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Populaarsed treenerid
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#3e4551] rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all">
                <div className="aspect-square bg-gradient-to-br from-[#40b236] to-[#2c313a] opacity-50"></div>
                <div className="p-4">
                  <h3 className="font-bold text-white">Treener {i}</h3>
                  <p className="text-gray-400 text-sm">Spetsialist</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-gray-400 text-sm">(4.9)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/trainers" className="text-[#40b236] hover:text-[#60cc56] font-medium">
              Vaata kõiki treenereid →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Mida ütlevad meie kasutajad
          </h2>
          <div className="bg-[#3e4551] rounded-lg p-8 relative">
            <div className="text-6xl text-[#40b236] opacity-20 absolute top-4 left-4">"</div>
            <div className="relative z-10">
              <p className="text-lg text-white mb-6 italic">
                {testimonials[currentTestimonial].content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#40b236] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white">{testimonials[currentTestimonial].name}</div>
                    <div className="text-gray-400 text-sm">{testimonials[currentTestimonial].role}</div>
                  </div>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            {/* Testimonial indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-[#40b236] w-8' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#40b236] to-[#60cc56]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Alusta oma teekonda juba täna!
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Liitu tuhandete rahulolevatega kasutajatega ja muuda oma treeningharjumused
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 bg-white text-[#40b236] font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
              Alusta 7-päevase tasuta prooviperioodiga
            </Link>
            <Link href="/for-trainers" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all">
              Olen treener
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Krediitkaarti pole vaja</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Tühista igal ajal</span>
            </div>
          </div>
        </div>
      </section>

      {/* For Trainers Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Oled treener? <span className="text-[#40b236]">Liitu meiega!</span>
              </h2>
              <p className="text-gray-300 mb-6">
                FitQ platvorm pakub treeneritele kõik tööriistad oma äri kasvatamiseks ja klientide teenindamiseks.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#40b236] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Loo ja müü videotreeninguid</div>
                    <div className="text-gray-400">Jaga oma teadmisi tuhandete kasutajatega</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#40b236] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Halda kliente ühest kohast</div>
                    <div className="text-gray-400">Personaalprogrammid, edusammude jälgimine ja suhtlus</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#40b236] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Teeni passiivset tulu</div>
                    <div className="text-gray-400">Sinu sisu teenib raha ka siis, kui sa magad</div>
                  </div>
                </li>
              </ul>
              <Link href="/for-trainers" className="inline-block px-8 py-4 bg-[#40b236] hover:bg-[#60cc56] text-white font-bold rounded-lg transition-all transform hover:scale-105">
                Saa treeneriks
              </Link>
            </div>
            <div className="bg-[#3e4551] rounded-lg p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#40b236]">85%</div>
                  <div className="text-gray-400 text-sm mt-2">Tulust treenerile</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#40b236]">24/7</div>
                  <div className="text-gray-400 text-sm mt-2">Tehniline tugi</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#40b236]">0€</div>
                  <div className="text-gray-400 text-sm mt-2">Liitumistasu</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#40b236]">∞</div>
                  <div className="text-gray-400 text-sm mt-2">Videote arv</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Programs */}
      <section className="py-20 px-6 bg-[#3e4551]/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Tulevased programmid
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "30-päeva väljakutse", trainer: "Mari Maasikas", start: "1. veebruar", duration: "30 päeva" },
              { name: "Algaja jõusaal", trainer: "Jaan Tamm", start: "15. veebruar", duration: "8 nädalat" },
              { name: "Jooga hommikud", trainer: "Liis Sepp", start: "1. märts", duration: "4 nädalat" }
            ].map((program, i) => (
              <div key={i} className="bg-[#3e4551] rounded-lg p-6 hover:bg-[#4d5665] transition-colors">
                <div className="bg-[#40b236] text-white text-xs font-bold px-2 py-1 rounded inline-block mb-3">
                  TULEKUL
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{program.name}</h3>
                <p className="text-gray-400 mb-4">Treener: {program.trainer}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{program.start}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{program.duration}</span>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 bg-[#40b236]/20 text-[#40b236] rounded hover:bg-[#40b236]/30 transition-colors">
                  Registreeru ootejärjekorda
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}