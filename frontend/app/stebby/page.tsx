'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function StebbyPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(false)
  const [balanceData, setBalanceData] = useState<{
    available: number
    difference: number
  } | null>(null)
  const [identityType, setIdentityType] = useState('EMAIL')
  const [identityValue, setIdentityValue] = useState('')
  const [amount, setAmount] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [giftCardCode, setGiftCardCode] = useState('')
  const [purchaseReferenceId, setPurchaseReferenceId] = useState('')

  const checkBalance = async () => {
    if (!identityValue) {
      setError('Palun sisesta oma email, telefon või isikukood')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/stebby/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: identityType,
          value: identityValue,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setBalanceData({
          available: data.available,
          difference: data.difference,
        })
        setSuccess(`Teie Stebby konto jääk: ${data.available}€`)
      } else {
        setError(data.message || 'Saldo kontrollimine ebaõnnestus')
      }
    } catch (err) {
      setError('Võrgu viga. Palun proovi hiljem uuesti.')
    } finally {
      setLoading(false)
    }
  }

  const preparePurchase = async () => {
    if (!identityValue || !amount) {
      setError('Palun täida kõik väljad')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/stebby/prepare-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: identityType,
          value: identityValue,
          amount: parseFloat(amount),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGiftCardCode(data.gift_card.code)
        setPurchaseReferenceId(data.purchaseReferenceId)
        setSuccess(`Kinkekaart loodud! Kood: ${data.gift_card.code}`)
      } else {
        setError(data.message || 'Kinkekaardi loomine ebaõnnestus')
      }
    } catch (err) {
      setError('Võrgu viga. Palun proovi hiljem uuesti.')
    } finally {
      setLoading(false)
    }
  }

  const sendGiftCard = async () => {
    if (!recipientEmail || !purchaseReferenceId) {
      setError('Palun sisesta saaja email ja loo esmalt kinkekaart')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/stebby/send-gift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: identityType,
          value: identityValue,
          amount: parseFloat(amount),
          email: recipientEmail,
          purchaseReferenceId: purchaseReferenceId,
          locale: 'et',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Kinkekaart saadetud aadressile ${recipientEmail}!`)
      } else {
        setError(data.message || 'Kinkekaardi saatmine ebaõnnestus')
      }
    } catch (err) {
      setError('Võrgu viga. Palun proovi hiljem uuesti.')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'info', label: 'Info' },
    { id: 'balance', label: 'Kontrolli saldot' },
    { id: 'gift', label: 'Kinkekaart' },
    { id: 'packages', label: 'Paketid' },
  ]

  return (
    <div className="bg-[#2c313a] text-white pb-12">
      {/* Page Header */}
      <div className="bg-[#3e4551] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src="/images/stebby-logo-white.png"
              alt="Stebby"
              width={100}
              height={30}
            />
            <h1 className="text-2xl md:text-3xl font-bold">× FitQ</h1>
          </div>
          <p className="text-gray-300">
            Kasuta oma Stebby soodustust FitQ teenuste eest tasumiseks
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#2c313a] border-b border-[#3e4551]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-3 px-1 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#40b236] border-b-2 border-[#40b236]'
                    : 'text-[#f6f7f8] hover:text-[#40b236]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="bg-[#3e4551] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Kuidas Stebby FitQ-s töötab?</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Stebby on Eesti suurim spordi- ja tervisesoodustuste platvorm, mis võimaldab 
                  töötajatel kasutada tööandja poolt pakutavat spordikompensatsiooni.
                </p>
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Kuidas alustada:</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Ühenda oma FitQ konto Stebby kontoga</li>
                    <li>Vali endale sobiv FitQ teenus</li>
                    <li>Maksmise ajal vali makseviisiks Stebby</li>
                    <li>Naudi treeninguid!</li>
                  </ol>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Mida saab Stebbyga osta:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>FitQ kuutellimus (3.99€/kuus)</li>
                    <li>FitQ Premium tellimus (14.99€/kuus)</li>
                    <li>Treenerite personaalsed treeningpaketid</li>
                    <li>Treeningprogrammid</li>
                    <li>6-kuu ja aastase FitQ paketi</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#3e4551] rounded-lg p-6">
              <h3 className="font-semibold mb-3">Ühenda oma Stebby konto</h3>
              <p className="text-gray-300 mb-4">
                Stebby ja FitQ konto ühendamiseks mine oma konto seadetesse
              </p>
              <Link
                href="/settings/account"
                className="inline-block bg-[#40b236] hover:bg-[#60cc56] text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Ühenda Stebby konto
              </Link>
            </div>
          </div>
        )}

        {/* Balance Check Tab */}
        {activeTab === 'balance' && (
          <div className="max-w-md">
            <div className="bg-[#3e4551] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Kontrolli Stebby saldot</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Identifitseerimise viis
                  </label>
                  <select
                    value={identityType}
                    onChange={(e) => setIdentityType(e.target.value)}
                    className="w-full px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg focus:outline-none focus:border-[#40b236]"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="PHONE">Telefon</option>
                    <option value="EST_PIN">Isikukood</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {identityType === 'EMAIL' ? 'Email' : 
                     identityType === 'PHONE' ? 'Telefon' : 'Isikukood'}
                  </label>
                  <input
                    type="text"
                    value={identityValue}
                    onChange={(e) => setIdentityValue(e.target.value)}
                    placeholder={
                      identityType === 'EMAIL' ? 'teie@email.ee' : 
                      identityType === 'PHONE' ? '+372 5555 5555' : '38501010101'
                    }
                    className="w-full px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg focus:outline-none focus:border-[#40b236]"
                  />
                </div>

                <button
                  onClick={checkBalance}
                  disabled={loading}
                  className="w-full bg-[#40b236] hover:bg-[#60cc56] disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Kontrollin...' : 'Kontrolli saldot'}
                </button>

                {balanceData && (
                  <div className="mt-4 p-4 bg-[#2c313a] rounded-lg">
                    <p className="font-semibold">Teie Stebby konto info:</p>
                    <p className="text-2xl font-bold text-[#40b236] mt-2">
                      {balanceData.available}€
                    </p>
                    <p className="text-sm text-gray-400">Saadaval</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gift Card Tab */}
        {activeTab === 'gift' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#3e4551] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Loo kinkekaart</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Identifitseerimise viis
                  </label>
                  <select
                    value={identityType}
                    onChange={(e) => setIdentityType(e.target.value)}
                    className="w-full px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg focus:outline-none focus:border-[#40b236]"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="PHONE">Telefon</option>
                    <option value="EST_PIN">Isikukood</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {identityType === 'EMAIL' ? 'Email' : 
                     identityType === 'PHONE' ? 'Telefon' : 'Isikukood'}
                  </label>
                  <input
                    type="text"
                    value={identityValue}
                    onChange={(e) => setIdentityValue(e.target.value)}
                    placeholder={
                      identityType === 'EMAIL' ? 'teie@email.ee' : 
                      identityType === 'PHONE' ? '+372 5555 5555' : '38501010101'
                    }
                    className="w-full px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg focus:outline-none focus:border-[#40b236]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Summa (€)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10.00"
                    min="0.01"
                    step="0.01"
                    className="w-full px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg focus:outline-none focus:border-[#40b236]"
                  />
                </div>

                <button
                  onClick={preparePurchase}
                  disabled={loading}
                  className="w-full bg-[#40b236] hover:bg-[#60cc56] disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Loon...' : 'Loo kinkekaart'}
                </button>

                {giftCardCode && (
                  <div className="mt-4 p-4 bg-[#2c313a] rounded-lg">
                    <p className="font-semibold">Kinkekaart loodud!</p>
                    <p className="text-xl font-mono mt-2 text-[#40b236]">
                      {giftCardCode}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#3e4551] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Saada kinkekaart</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Saaja email
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="saaja@email.ee"
                    className="w-full px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg focus:outline-none focus:border-[#40b236]"
                  />
                </div>

                <button
                  onClick={sendGiftCard}
                  disabled={loading || !purchaseReferenceId}
                  className="w-full bg-[#40b236] hover:bg-[#60cc56] disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Saadan...' : 'Saada kinkekaart'}
                </button>

                {!purchaseReferenceId && (
                  <p className="text-sm text-gray-400">
                    Loo esmalt kinkekaart, et seda saata
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="bg-[#3e4551] rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold mb-4">Stebby paketid</h2>
              <p className="text-gray-300 mb-6">
                Osta FitQ tellimus otse Stebby platvormilt
              </p>
              <a
                href="https://app.stebby.eu/pos/fitq"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#40b236] hover:bg-[#60cc56] text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <span>Vaata Stebby pakette</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#3e4551] rounded-lg p-6">
                <h3 className="font-bold mb-3">6 kuu pakett</h3>
                <p className="text-3xl font-bold text-[#40b236] mb-2">20.94€</p>
                <p className="text-gray-400 mb-4">3.49€ kuus</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-[#40b236] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Säästad 3€ võrreldes kuutasuga</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-[#40b236] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Kõik FitQ treeningud ja programmid</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#3e4551] rounded-lg p-6">
                <h3 className="font-bold mb-3">12 kuu pakett</h3>
                <p className="text-3xl font-bold text-[#40b236] mb-2">35.88€</p>
                <p className="text-gray-400 mb-4">2.99€ kuus</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-[#40b236] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Säästad 12€ võrreldes kuutasuga</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-[#40b236] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Parim hind!</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}