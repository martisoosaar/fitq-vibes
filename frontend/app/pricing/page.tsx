'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface PricingPlan {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  isPopular?: boolean
  buttonText: string
  buttonLink?: string
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 'Tasuta',
    period: '',
    description: 'Alusta oma teekonda FitQ-ga',
    features: [
      'Piiratud juurdepääs treeningutele',
      'Põhilised treening funktsioonid',
      'Treeningpäevik',
      'Kogukonna tugi',
      'Põhilised kalkulaatorid'
    ],
    buttonText: 'Alusta tasuta',
    buttonLink: '/register'
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '3.99€',
    period: 'kuus',
    description: 'Täielik juurdepääs FitQ sisule',
    features: [
      'Kõik Starter funktsionaalsused',
      '1300+ treeningvideot',
      'Piiramatult treeninguid',
      'Personaalsed treeningkavad',
      'Edetabelid ja võistlused',
      'Detailne progress jälgimine'
    ],
    buttonText: 'Vali Basic',
    buttonLink: '/payment/basic'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '14.99€',
    period: 'kuus',
    description: 'Maksimaalne FitQ kogemus',
    features: [
      'Kõik Basic funktsionaalsused',
      'Personaalne treener tugi',
      'Live treeningud',
      'Toitumisnõustamine',
      'Eksklusiivsed väljakutsed',
      'VIP kogukonna ligipääs',
      '1-on-1 konsultatsioonid'
    ],
    isPopular: true,
    buttonText: 'Vali Premium',
    buttonLink: '/payment/premium'
  }
]

export default function PricingPage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  return (
    <div className="bg-[#2c313a] text-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Vali endale sobiv pakett</h1>
          <p className="text-gray-300 text-lg">
            Alusta oma fitness teekonda FitQ-ga juba täna
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-[#3e4551] rounded-xl p-6 ${
                plan.isPopular ? 'ring-2 ring-[#40b236] transform scale-105' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#40b236] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    POPULAARSEIM
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-3">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-[#40b236] mr-3 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                {user && user.subscription === plan.id ? (
                  <div className="px-6 py-3 bg-[#2c313a] rounded-lg font-semibold">
                    Praegune pakett
                  </div>
                ) : (
                  <Link
                    href={plan.buttonLink || '#'}
                    className={`block px-6 py-3 rounded-lg font-semibold transition-all ${
                      plan.isPopular
                        ? 'bg-[#40b236] hover:bg-[#40b236]/90 text-white'
                        : 'bg-[#2c313a] hover:bg-[#2c313a]/80 text-white'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-[#3e4551] rounded-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Funktsioonide võrdlus
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-4 px-4">Funktsioon</th>
                  <th className="text-center py-4 px-4">Starter</th>
                  <th className="text-center py-4 px-4">Basic</th>
                  <th className="text-center py-4 px-4">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                <tr>
                  <td className="py-4 px-4">Treeningvideod</td>
                  <td className="text-center py-4 px-4">10</td>
                  <td className="text-center py-4 px-4">1300+</td>
                  <td className="text-center py-4 px-4">1300+</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Personaalsed kavad</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-400">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-400">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Live treeningud</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-400">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-400">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-400">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Personaalne treener</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-400">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-400">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-400">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Toitumisnõustamine</td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-400">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-red-400">✗</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-green-400">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Kogukonna ligipääs</td>
                  <td className="text-center py-4 px-4">Põhiline</td>
                  <td className="text-center py-4 px-4">Täielik</td>
                  <td className="text-center py-4 px-4">VIP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Korduma kippuvad küsimused
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#3e4551] rounded-lg p-6">
              <h3 className="font-bold mb-2">Kas saan paketti igal ajal vahetada?</h3>
              <p className="text-gray-300">
                Jah, saad oma paketti igal ajal täiendada või muuta. Muudatused rakenduvad koheselt.
              </p>
            </div>
            
            <div className="bg-[#3e4551] rounded-lg p-6">
              <h3 className="font-bold mb-2">Kas on olemas prooviperiood?</h3>
              <p className="text-gray-300">
                Jah, Basic ja Premium pakettidel on 7-päevane tasuta prooviperiood uutele kasutajatele.
              </p>
            </div>
            
            <div className="bg-[#3e4551] rounded-lg p-6">
              <h3 className="font-bold mb-2">Kuidas ma saan tellimuse tühistada?</h3>
              <p className="text-gray-300">
                Saad tellimuse igal ajal tühistada oma konto seadetest. Ligipääs säilib tasutud perioodi lõpuni.
              </p>
            </div>
            
            <div className="bg-[#3e4551] rounded-lg p-6">
              <h3 className="font-bold mb-2">Millised maksemeetodid on toetatud?</h3>
              <p className="text-gray-300">
                Aktsepteerime kõiki peamisi krediit- ja deebetkaarte, PayPali ning pangalinke.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center bg-gradient-to-r from-[#40b236] to-[#60cc56] rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-4">
            Valmis alustama oma fitness teekonda?
          </h2>
          <p className="text-lg mb-6">
            Liitu tuhande kasutajatega, kes on juba muutnud oma elu FitQ-ga
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-[#40b236] rounded-lg font-bold text-lg hover:bg-gray-100 transition-all"
          >
            Alusta tasuta prooviperioodiga
          </Link>
        </div>
      </div>
    </div>
  )
}