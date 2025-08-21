'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface ActivityLevel {
  id: string
  label: string
  multiplier: number
  description: string
}

const activityLevels: ActivityLevel[] = [
  {
    id: 'sedentary',
    label: 'Istuv eluviis',
    multiplier: 1.2,
    description: 'Vähe või üldse mitte liikumist'
  },
  {
    id: 'light',
    label: 'Kergelt aktiivne',
    multiplier: 1.375,
    description: 'Kerge treening 1-3 päeva nädalas'
  },
  {
    id: 'moderate',
    label: 'Mõõdukalt aktiivne',
    multiplier: 1.55,
    description: 'Mõõdukas treening 3-5 päeva nädalas'
  },
  {
    id: 'active',
    label: 'Aktiivne',
    multiplier: 1.725,
    description: 'Raske treening 6-7 päeva nädalas'
  },
  {
    id: 'very-active',
    label: 'Väga aktiivne',
    multiplier: 1.9,
    description: 'Väga raske füüsiline treening'
  }
]

export default function CalorieCalculator() {
  const { user } = useAuth()
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [age, setAge] = useState<number | ''>('')
  const [height, setHeight] = useState<number | ''>('')
  const [weight, setWeight] = useState<number | ''>('')
  const [activityLevel, setActivityLevel] = useState('moderate')
  const [bmr, setBmr] = useState<number | null>(null)
  const [showSaveOption, setShowSaveOption] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (age && height && weight) {
      calculateBMR()
    } else {
      setBmr(null)
      setShowSaveOption(false)
    }
  }, [sex, age, height, weight])

  const calculateBMR = () => {
    if (!age || !height || !weight) return

    let bmrValue
    if (sex === 'male') {
      // Harris-Benedict formula for men
      bmrValue = 88.362 + (13.397 * Number(weight)) + (4.799 * Number(height)) - (5.677 * Number(age))
    } else {
      // Harris-Benedict formula for women
      bmrValue = 447.593 + (9.247 * Number(weight)) + (3.098 * Number(height)) - (4.330 * Number(age))
    }
    
    setBmr(Math.round(bmrValue))
    
    if (user) {
      setShowSaveOption(true)
    }
  }

  const getTDEE = () => {
    if (!bmr) return null
    const activity = activityLevels.find(level => level.id === activityLevel)
    if (!activity) return null
    return Math.round(bmr * activity.multiplier)
  }

  const saveToProfile = async () => {
    setIsSaving(true)
    setSaveError('')
    
    try {
      // TODO: Implement API call to save data
      
      setSaveSuccess(true)
      setShowSaveOption(false)
      
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      setSaveError('Andmete salvestamine ebaõnnestus')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-[#3e4551] rounded-lg p-6">
      <div className="bg-[#40b236]/30 p-4 rounded-lg mb-6 text-center">
        <h2 className="text-2xl font-bold">Kalorite kalkulaator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-gradient-to-br from-[#2c313a] to-[#3e4551] rounded-lg p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">Sisesta oma andmed</h3>
            <p className="text-gray-300 text-sm">
              Arvutame sinu päevase kalorivajaduse
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Sex Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Sugu</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSex('male')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    sex === 'male'
                      ? 'bg-[#40b236] text-white'
                      : 'bg-[#2c313a] text-gray-300 hover:bg-[#3e4551]'
                  }`}
                >
                  Mees
                </button>
                <button
                  type="button"
                  onClick={() => setSex('female')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    sex === 'female'
                      ? 'bg-[#40b236] text-white'
                      : 'bg-[#2c313a] text-gray-300 hover:bg-[#3e4551]'
                  }`}
                >
                  Naine
                </button>
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium mb-2">
                  Vanus
                </label>
                <input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 bg-[#2c313a] border-2 border-transparent rounded-lg focus:border-[#40b236] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="calc-height" className="block text-sm font-medium mb-2">
                  Pikkus (cm)
                </label>
                <input
                  id="calc-height"
                  type="number"
                  min="100"
                  max="250"
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 bg-[#2c313a] border-2 border-transparent rounded-lg focus:border-[#40b236] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="calc-weight" className="block text-sm font-medium mb-2">
                  Kaal (kg)
                </label>
                <input
                  id="calc-weight"
                  type="number"
                  min="30"
                  max="300"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 bg-[#2c313a] border-2 border-transparent rounded-lg focus:border-[#40b236] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-sm font-medium mb-2">Aktiivsuse tase</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-4 py-3 bg-[#2c313a] border-2 border-transparent rounded-lg focus:border-[#40b236] focus:outline-none transition-all"
              >
                {activityLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Save Option */}
            {showSaveOption && user && (
              <div className="bg-[#40b236]/10 border-2 border-[#40b236]/20 rounded-lg p-4 text-center">
                <h4 className="font-bold text-[#40b236] mb-1">Salvesta andmed</h4>
                <p className="text-sm text-gray-300 mb-3">
                  Soovid salvestada andmed oma profiilile progressi jälgimiseks?
                </p>
                <button
                  onClick={saveToProfile}
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#40b236] rounded-lg hover:bg-[#40b236]/90 disabled:opacity-60 transition-all"
                >
                  {isSaving ? 'Salvestan...' : 'Salvesta'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Results Section */}
        <div className="flex flex-col">
          {bmr ? (
            <div className="space-y-6">
              {/* Calorie Result Card */}
              <div className="bg-gradient-to-br from-[#40b236] to-[#60cc56] rounded-lg p-6 text-white">
                <h3 className="text-center text-xl font-bold mb-4">Sinu päevane kalorivajadus</h3>
                
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm opacity-90 mb-1">Põhiainevahetus (BMR)</div>
                    <div className="text-3xl font-bold">{bmr} kcal</div>
                    <p className="text-sm opacity-80 mt-1">
                      Minimaalne energia puhkeolekus
                    </p>
                  </div>
                  
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-sm opacity-90 mb-1">Päevane kalorivajadus (TDEE)</div>
                    <div className="text-4xl font-bold text-yellow-300">{getTDEE()} kcal</div>
                    <p className="text-sm opacity-80 mt-1">
                      Kaalu säilitamiseks vastavalt aktiivsusele
                    </p>
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div className="bg-[#2c313a]/50 rounded-lg p-4">
                <h4 className="text-center font-bold mb-4">Eesmärgid</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#3e4551]/50 rounded">
                    <div>
                      <div className="font-semibold">Kaalulangetamine</div>
                      <div className="text-sm text-gray-400">-500 kcal päevas</div>
                    </div>
                    <div className="text-xl font-bold text-orange-400">
                      {getTDEE() ? getTDEE() - 500 : 0} kcal
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-[#3e4551]/50 rounded">
                    <div>
                      <div className="font-semibold">Kaalu säilitamine</div>
                      <div className="text-sm text-gray-400">Praegune kalorivajadus</div>
                    </div>
                    <div className="text-xl font-bold text-green-400">
                      {getTDEE()} kcal
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-[#3e4551]/50 rounded">
                    <div>
                      <div className="font-semibold">Lihasmassi kasvatamine</div>
                      <div className="text-sm text-gray-400">+300 kcal päevas</div>
                    </div>
                    <div className="text-xl font-bold text-blue-400">
                      {getTDEE() ? getTDEE() + 300 : 0} kcal
                    </div>
                  </div>
                </div>
              </div>

              {/* Success/Error Messages */}
              {saveSuccess && (
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-center text-green-400">
                  ✓ Andmed edukalt salvestatud!
                </div>
              )}
              
              {saveError && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-center text-red-400">
                  {saveError}
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-20 h-20 bg-[#3e4551] rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Sisesta oma andmed</h3>
              <p className="text-gray-400">Täida kõik väljad, et arvutada päevane kalorivajadus</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          <strong>NB!</strong> Kalorite kalkulaator on mõeldud üldiseks terviseinfo jagamiseks. 
          Täpsema toitumiskava jaoks konsulteeri toitumisnõustaja või arstiga.
        </p>
      </div>
    </div>
  )
}