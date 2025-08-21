'use client'

import { useState } from 'react'

export default function TrainingHistory() {
  const [selectedMonth, setSelectedMonth] = useState('2025-01')
  
  const trainings = [
    {
      id: 1,
      date: '19.01.2025',
      type: 'Jõutreening',
      duration: '45 min',
      exercises: 12,
      points: 50
    },
    {
      id: 2,
      date: '18.01.2025',
      type: 'Kardio',
      duration: '30 min',
      distance: '5 km',
      points: 30
    },
    {
      id: 3,
      date: '17.01.2025',
      type: 'Video treening',
      duration: '20 min',
      trainer: 'Mari Maasikas',
      points: 20
    },
    {
      id: 4,
      date: '15.01.2025',
      type: 'Jõutreening',
      duration: '60 min',
      exercises: 15,
      points: 60
    }
  ]

  return (
    <div>
      <div className="bg-[#3e4551] rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Treeningpäevik</h2>
          <button className="bg-[#40b236] hover:bg-[#318929] px-4 py-2 rounded-lg font-medium transition-colors">
            + Lisa treening
          </button>
        </div>
        
        <div className="mb-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#2c313a] border border-[#4d5665] rounded-lg px-4 py-2 focus:outline-none focus:border-[#40b236]"
          >
            <option value="2025-01">Jaanuar 2025</option>
            <option value="2024-12">Detsember 2024</option>
            <option value="2024-11">November 2024</option>
          </select>
        </div>
        
        <div className="space-y-3">
          {trainings.map((training) => (
            <div
              key={training.id}
              className="bg-[#2c313a] rounded-lg p-4 hover:bg-[#363c48] transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{training.type}</h4>
                    <span className="text-xs bg-[#40b236] bg-opacity-20 text-[#60cc56] px-2 py-1 rounded">
                      +{training.points} punkti
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>⏱ {training.duration}</p>
                    {training.exercises && <p>💪 {training.exercises} harjutust</p>}
                    {training.distance && <p>🏃 {training.distance}</p>}
                    {training.trainer && <p>👩‍🏫 {training.trainer}</p>}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {training.date}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-[#2c313a]">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#60cc56]">12</p>
              <p className="text-sm text-gray-400">Treeningut kuus</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#60cc56]">8.5</p>
              <p className="text-sm text-gray-400">Tundi kokku</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#60cc56]">380</p>
              <p className="text-sm text-gray-400">Punkti teenitud</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}