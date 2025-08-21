'use client'

import { useState } from 'react'

export default function CalorieCalculator() {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goal: 'maintain'
  })
  
  const [result, setResult] = useState<number | null>(null)

  const calculateCalories = () => {
    const { age, gender, weight, height, activityLevel } = formData
    
    // Basic BMR calculation (Mifflin-St Jeor)
    let bmr = 0
    if (gender === 'male') {
      bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5
    } else {
      bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) - 161
    }
    
    // Activity multipliers
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    }
    
    const tdee = bmr * multipliers[activityLevel]
    
    // Goal adjustments
    let calories = tdee
    if (formData.goal === 'lose') calories -= 500
    if (formData.goal === 'gain') calories += 500
    
    setResult(Math.round(calories))
  }

  return (
    <div>
      <div className="bg-[#3e4551] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Kalorikalkukaator</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vanus</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full bg-[#2c313a] border border-[#4d5665] rounded-lg px-4 py-2 focus:outline-none focus:border-[#40b236]"
                placeholder="25"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sugu</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full bg-[#2c313a] border border-[#4d5665] rounded-lg px-4 py-2 focus:outline-none focus:border-[#40b236]"
              >
                <option value="male">Mees</option>
                <option value="female">Naine</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Kaal (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full bg-[#2c313a] border border-[#4d5665] rounded-lg px-4 py-2 focus:outline-none focus:border-[#40b236]"
                placeholder="70"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Pikkus (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                className="w-full bg-[#2c313a] border border-[#4d5665] rounded-lg px-4 py-2 focus:outline-none focus:border-[#40b236]"
                placeholder="175"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Aktiivsuse tase</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({...formData, activityLevel: e.target.value})}
                className="w-full bg-[#2c313a] border border-[#4d5665] rounded-lg px-4 py-2 focus:outline-none focus:border-[#40b236]"
              >
                <option value="sedentary">Istuv eluviis</option>
                <option value="light">Kergelt aktiivne (1-2 päeva nädalas)</option>
                <option value="moderate">Mõõdukalt aktiivne (3-4 päeva)</option>
                <option value="active">Aktiivne (5-6 päeva)</option>
                <option value="veryActive">Väga aktiivne (iga päev)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Eesmärk</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className="w-full bg-[#2c313a] border border-[#4d5665] rounded-lg px-4 py-2 focus:outline-none focus:border-[#40b236]"
              >
                <option value="lose">Kaalulangetus</option>
                <option value="maintain">Kaalu hoidmine</option>
                <option value="gain">Kaalutõus</option>
              </select>
            </div>
            
            <button
              onClick={calculateCalories}
              className="w-full bg-[#40b236] hover:bg-[#318929] px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Arvuta kalorid
            </button>
            
            {result && (
              <div className="bg-[#2c313a] rounded-lg p-6 text-center">
                <p className="text-sm text-gray-400 mb-2">Sinu päevane kalorivajadus:</p>
                <p className="text-4xl font-bold text-[#60cc56]">{result}</p>
                <p className="text-sm text-gray-400 mt-2">kcal</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-[#2c313a] rounded-lg">
          <p className="text-sm text-gray-400">
            💡 <span className="font-medium">Nõuanne:</span> Kalorikalkukaator annab hinnangulise tulemuse. 
            Täpsema info saamiseks konsulteeri toitumisspetsialistiga.
          </p>
        </div>
      </div>
    </div>
  )
}