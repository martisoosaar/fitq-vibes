'use client'

import { useState } from 'react'
import { CreditCard, Download, Calendar, Package, ChevronRight } from 'lucide-react'

interface Purchase {
  id: string
  date: string
  description: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  type: 'subscription' | 'one-time' | 'challenge'
}

interface Subscription {
  id: string
  name: string
  price: number
  period: string
  nextBilling: string
  status: 'active' | 'cancelled'
}

export default function PurchasesSettingsPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'subscriptions'>('history')
  
  const purchases: Purchase[] = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'Premium kuu tellimus',
      amount: 9.99,
      status: 'completed',
      type: 'subscription'
    },
    {
      id: '2',
      date: '2024-01-10',
      description: 'Talvine väljakutse osalustasu',
      amount: 4.99,
      status: 'completed',
      type: 'challenge'
    },
    {
      id: '3',
      date: '2023-12-15',
      description: 'Premium kuu tellimus',
      amount: 9.99,
      status: 'completed',
      type: 'subscription'
    },
    {
      id: '4',
      date: '2023-12-01',
      description: 'Personaaltreeneri programm',
      amount: 29.99,
      status: 'completed',
      type: 'one-time'
    }
  ]

  const subscriptions: Subscription[] = [
    {
      id: '1',
      name: 'FitQ Premium',
      price: 9.99,
      period: 'kuus',
      nextBilling: '2024-02-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Personaaltreeneri plaan',
      price: 19.99,
      period: 'kuus',
      nextBilling: '2024-02-01',
      status: 'cancelled'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
      case 'active':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Aktiivne</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">Tühistatud</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Ootel</span>
      case 'failed':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">Ebaõnnestus</span>
      default:
        return null
    }
  }

  const handleCancelSubscription = (id: string) => {
    console.log('Cancelling subscription:', id)
    // Here you would make an API call
  }

  const handleDownloadInvoice = (purchaseId: string) => {
    console.log('Downloading invoice for:', purchaseId)
    // Here you would trigger invoice download
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-[#3e4551] rounded-lg p-1 inline-flex">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-[#40b236] text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Ostude ajalugu
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'subscriptions'
              ? 'bg-[#40b236] text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Tellimused
        </button>
      </div>

      {/* Purchase History */}
      {activeTab === 'history' && (
        <div className="bg-[#3e4551] rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Ostude ajalugu
          </h2>

          <div className="space-y-3">
            {purchases.map((purchase) => (
              <div 
                key={purchase.id}
                className="flex items-center justify-between p-4 bg-[#2c313a] rounded-lg hover:bg-[#2c313a]/80 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium">{purchase.description}</p>
                    {getStatusBadge(purchase.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(purchase.date).toLocaleDateString('et-EE')}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      {purchase.amount.toFixed(2)}€
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadInvoice(purchase.id)}
                  className="p-2 hover:bg-[#4d5665] rounded-lg transition-colors"
                  title="Laadi arve alla"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-[#4d5665]">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Kokku kulutatud:</p>
              <p className="text-2xl font-bold text-[#40b236]">
                {purchases.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}€
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="bg-[#3e4551] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Aktiivsed tellimused
            </h2>

            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div 
                  key={subscription.id}
                  className="p-4 bg-[#2c313a] rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{subscription.name}</h3>
                      <p className="text-gray-400">
                        {subscription.price.toFixed(2)}€ / {subscription.period}
                      </p>
                    </div>
                    {getStatusBadge(subscription.status)}
                  </div>
                  
                  {subscription.status === 'active' && (
                    <>
                      <p className="text-sm text-gray-400 mb-3">
                        Järgmine makse: {new Date(subscription.nextBilling).toLocaleDateString('et-EE')}
                      </p>
                      <button
                        onClick={() => handleCancelSubscription(subscription.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Tühista tellimus
                      </button>
                    </>
                  )}
                  
                  {subscription.status === 'cancelled' && (
                    <p className="text-sm text-gray-400">
                      Tellimus on tühistatud
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-[#3e4551] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Maksevahendid</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[#2c313a] rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-400">Aegub 12/25</p>
                  </div>
                </div>
                <button className="text-red-400 hover:text-red-300 transition-colors">
                  Eemalda
                </button>
              </div>
              
              <button className="w-full p-4 border-2 border-dashed border-[#4d5665] rounded-lg hover:border-[#40b236] transition-colors flex items-center justify-center gap-2 text-gray-400 hover:text-white">
                <CreditCard className="w-5 h-5" />
                Lisa uus maksevahend
              </button>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-[#3e4551] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Arveldusaadress</h2>
            
            <div className="p-4 bg-[#2c313a] rounded-lg">
              <p className="font-medium mb-2">Kasutaja Nimi</p>
              <p className="text-gray-400">
                Viru 1-23<br />
                Tallinn, 10111<br />
                Eesti
              </p>
              <button className="mt-3 text-[#40b236] hover:text-[#60cc56] transition-colors">
                Muuda aadressi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}