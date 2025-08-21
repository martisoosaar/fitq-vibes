'use client'

import { useState } from 'react'
import CalorieCalculator from '@/components/Calculators/CalorieCalculator'
import BmiCalculator from '@/components/Calculators/BmiCalculator'

export default function CalculatorsPage() {
  const [selectedCalculator, setSelectedCalculator] = useState('calorie')

  const calculators = [
    {
      id: 'calorie',
      label: 'KALORID',
    },
    {
      id: 'bmi',
      label: 'KEHAMASSIINDEKS',
    },
  ]

  return (
    <div className="bg-[#2c313a] text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-8">Kalkulaatorid</h1>
          
          <div className="flex gap-3 justify-center flex-wrap">
            {calculators.map((calculator) => (
              <button
                key={calculator.id}
                onClick={() => setSelectedCalculator(calculator.id)}
                className={`
                  px-6 py-3 rounded-full min-w-[140px] font-medium text-sm uppercase tracking-wider
                  transition-all duration-300 border-2
                  ${
                    selectedCalculator === calculator.id
                      ? 'bg-[#40b236] border-[#40b236] shadow-lg scale-105'
                      : 'bg-[#60cc56] border-[#60cc56] hover:bg-[#40b236] hover:border-[#40b236] hover:scale-105'
                  }
                `}
              >
                {calculator.label}
              </button>
            ))}
          </div>
        </div>

        <div className="transition-all duration-300">
          {selectedCalculator === 'calorie' && <CalorieCalculator />}
          {selectedCalculator === 'bmi' && <BmiCalculator />}
        </div>
      </div>
    </div>
  )
}