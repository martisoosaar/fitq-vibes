'use client'

import { useState } from 'react'

export default function ProgressTab() {
  const [selectedMetric, setSelectedMetric] = useState('weight')
  
  const metrics = [
    { id: 'weight', label: 'Kaal', unit: 'kg' },
    { id: 'bodyfat', label: 'Keharasv', unit: '%' },
    { id: 'muscle', label: 'Lihasmass', unit: 'kg' },
  ]
  
  const measurements = [
    { date: '01.01.2025', weight: 75.2, bodyfat: 18.5, muscle: 35.5 },
    { date: '08.01.2025', weight: 74.8, bodyfat: 18.2, muscle: 35.7 },
    { date: '15.01.2025', weight: 74.5, bodyfat: 17.9, muscle: 36.0 },
    { date: '19.01.2025', weight: 74.2, bodyfat: 17.5, muscle: 36.2 },
  ]
  
  const currentMeasurement = measurements[measurements.length - 1]
  const firstMeasurement = measurements[0]
  
  const getChange = (metric: string) => {
    const current = currentMeasurement[metric as keyof typeof currentMeasurement] as number
    const first = firstMeasurement[metric as keyof typeof firstMeasurement] as number
    return (current - first).toFixed(1)
  }

  return (
    <div>
      <div className="bg-[#3e4551] rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Progress</h2>
          <button className="bg-[#40b236] hover:bg-[#318929] px-4 py-2 rounded-lg font-medium transition-colors">
            + Lisa mõõtmine
          </button>
        </div>
        
        {/* Metric selector */}
        <div className="flex gap-2 mb-6">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMetric === metric.id
                  ? 'bg-[#40b236] text-white'
                  : 'bg-[#2c313a] hover:bg-[#363c48]'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
        
        {/* Current stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#2c313a] rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400 mb-1">Praegune</p>
            <p className="text-2xl font-bold text-[#60cc56]">
              {currentMeasurement[selectedMetric as keyof typeof currentMeasurement]}
            </p>
            <p className="text-sm text-gray-400">
              {metrics.find(m => m.id === selectedMetric)?.unit}
            </p>
          </div>
          
          <div className="bg-[#2c313a] rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400 mb-1">Muutus</p>
            <p className="text-2xl font-bold">
              <span className={Number(getChange(selectedMetric)) < 0 ? 'text-[#60cc56]' : 'text-[#f52e52]'}>
                {Number(getChange(selectedMetric)) > 0 ? '+' : ''}{getChange(selectedMetric)}
              </span>
            </p>
            <p className="text-sm text-gray-400">
              {metrics.find(m => m.id === selectedMetric)?.unit}
            </p>
          </div>
          
          <div className="bg-[#2c313a] rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400 mb-1">Eesmärk</p>
            <p className="text-2xl font-bold text-gray-400">72.0</p>
            <p className="text-sm text-gray-400">
              {metrics.find(m => m.id === selectedMetric)?.unit}
            </p>
          </div>
        </div>
        
        {/* Chart placeholder */}
        <div className="bg-[#2c313a] rounded-lg p-6 mb-6">
          <div className="h-48 flex items-center justify-center text-gray-500">
            📈 Graafik tuleb siia
          </div>
        </div>
        
        {/* Measurements list */}
        <div className="space-y-2">
          <h3 className="font-medium mb-3">Viimased mõõtmised</h3>
          {measurements.reverse().map((measurement, index) => (
            <div
              key={index}
              className="bg-[#2c313a] rounded-lg p-3 flex justify-between items-center hover:bg-[#363c48] transition-colors"
            >
              <span className="text-sm text-gray-400">{measurement.date}</span>
              <div className="flex gap-6">
                <span className="text-sm">
                  <span className="text-gray-400">Kaal:</span> {measurement.weight} kg
                </span>
                <span className="text-sm">
                  <span className="text-gray-400">Rasv:</span> {measurement.bodyfat}%
                </span>
                <span className="text-sm">
                  <span className="text-gray-400">Lihas:</span> {measurement.muscle} kg
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}