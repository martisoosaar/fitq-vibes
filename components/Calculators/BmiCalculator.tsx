'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function BmiCalculator() {
  const { user } = useAuth()
  const [height, setHeight] = useState<number | ''>('')
  const [weight, setWeight] = useState<number | ''>('')
  const [bmi, setBmi] = useState<number | null>(null)
  const [showSaveOption, setShowSaveOption] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (height && weight) {
      calculateBMI()
    } else {
      setBmi(null)
      setShowSaveOption(false)
    }
  }, [height, weight])

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = Number(height) / 100
      const bmiValue = Number(weight) / (heightInMeters * heightInMeters)
      setBmi(Math.round(bmiValue * 10) / 10)
      
      if (user) {
        setShowSaveOption(true)
      }
    }
  }

  const getBmiClass = () => {
    if (!bmi) return ''
    if (bmi < 18.5) return 'text-blue-400'
    if (bmi < 25) return 'text-green-400'
    if (bmi < 30) return 'text-yellow-400'
    if (bmi < 35) return 'text-orange-400'
    if (bmi < 40) return 'text-red-400'
    return 'text-red-600'
  }

  const getBmiCategory = () => {
    if (!bmi) return ''
    if (bmi < 18.5) return 'Alakaal'
    if (bmi < 25) return 'Normaalkaal'
    if (bmi < 30) return 'Ülekaal'
    if (bmi < 35) return 'Rasvumine I aste'
    if (bmi < 40) return 'Rasvumine II aste'
    return 'Rasvumine III aste'
  }

  const getBmiDescription = () => {
    if (!bmi) return ''
    if (bmi < 18.5) return 'Sinu kehamassiindeks on alla normi. Konsulteeri arstiga.'
    if (bmi < 25) return 'Sinu kehamassiindeks on normaalses vahemikus. Hea töö!'
    if (bmi < 30) return 'Sinu kehamassiindeks näitab ülekaalu. Soovitav on langetada kehakaalu.'
    if (bmi < 35) return 'Sinu kehamassiindeks näitab I astme rasvumist. Konsulteeri arstiga.'
    if (bmi < 40) return 'Sinu kehamassiindeks näitab II astme rasvumist. Konsulteeri arstiga.'
    return 'Sinu kehamassiindeks näitab III astme rasvumist. Konsulteeri arstiga.'
  }

  const saveToProfile = async () => {
    setIsSaving(true)
    setSaveError('')
    
    try {
      // TODO: Implement API call to save data
      // await saveUserMeasurements({ height, weight })
      
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
        <h2 className="text-2xl font-bold">Kehamassiindeksi (BMI) kalkulaator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-gradient-to-br from-[#2c313a] to-[#3e4551] rounded-lg p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">Sisesta oma andmed</h3>
            <p className="text-gray-300 text-sm">
              BMI aitab hinnata kehakaalu ja pikkuse suhet
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="height" className="block text-sm font-medium mb-2">
                  Pikkus (cm)
                </label>
                <input
                  id="height"
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
                <label htmlFor="weight" className="block text-sm font-medium mb-2">
                  Kaal (kg)
                </label>
                <input
                  id="weight"
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
          {bmi ? (
            <div className="space-y-6">
              {/* BMI Result Card */}
              <div className="bg-gradient-to-br from-[#40b236] to-[#60cc56] rounded-lg p-6 text-white">
                <h3 className="text-center text-xl font-bold mb-4">Sinu BMI</h3>
                
                <div className="text-center mb-4">
                  <div className={`text-5xl font-bold mb-2 ${getBmiClass()}`}>
                    {bmi}
                  </div>
                  <div className="text-lg font-semibold">{getBmiCategory()}</div>
                </div>
                
                <p className="text-center text-sm opacity-90">{getBmiDescription()}</p>
              </div>

              {/* BMI Categories Guide */}
              <div className="bg-[#2c313a]/50 rounded-lg p-4">
                <h4 className="text-center font-bold mb-4">BMI kategooriad</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-[#3e4551]/50 rounded border-l-4 border-blue-400">
                    <span className="font-semibold">&lt; 18.5</span>
                    <span className="text-gray-300">Alakaal</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#3e4551]/50 rounded border-l-4 border-green-400">
                    <span className="font-semibold">18.5 - 24.9</span>
                    <span className="text-gray-300">Normaalkaal</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#3e4551]/50 rounded border-l-4 border-yellow-400">
                    <span className="font-semibold">25.0 - 29.9</span>
                    <span className="text-gray-300">Ülekaal</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#3e4551]/50 rounded border-l-4 border-orange-400">
                    <span className="font-semibold">30.0 - 34.9</span>
                    <span className="text-gray-300">Rasvumine I</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#3e4551]/50 rounded border-l-4 border-red-400">
                    <span className="font-semibold">35.0 - 39.9</span>
                    <span className="text-gray-300">Rasvumine II</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#3e4551]/50 rounded border-l-4 border-red-600">
                    <span className="font-semibold">≥ 40.0</span>
                    <span className="text-gray-300">Rasvumine III</span>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11V7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7V11M5 11H19L18 21H6L5 11Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Sisesta oma andmed</h3>
              <p className="text-gray-400">Sisesta oma pikkus ja kaal, et arvutada BMI</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          <strong>NB!</strong> BMI kalkulaator on mõeldud üldiseks terviseinfo jagamiseks. 
          See ei asenda professionaalset meditsiinilist nõustamist. Konsulteeri arstiga enne 
          tervise- või toitumisalaste otsuste tegemist.
        </p>
      </div>
    </div>
  )
}