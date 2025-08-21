'use client'

import { useState, useEffect } from 'react'
import { X, Play, RotateCcw } from 'lucide-react'

interface ResumeModalProps {
  isOpen: boolean
  onClose: () => void
  onResume: () => void
  onStartOver: () => void
  playheadPosition: number
  lastWatchedDate?: string
  isTabSwitch?: boolean  // Whether this is from tab switching
}

export default function ResumeModal({ 
  isOpen, 
  onClose, 
  onResume, 
  onStartOver, 
  playheadPosition,
  lastWatchedDate,
  isTabSwitch = false
}: ResumeModalProps) {
  if (!isOpen) return null

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  const getTimeAgo = (dateString?: string): string => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays} päeva`
    } else if (diffHours > 0) {
      return `${diffHours} tundi`
    } else if (diffMins > 0) {
      return `${diffMins} minutit`
    } else {
      return 'hetk'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2c313a] rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-4">
          {isTabSwitch ? 'Video peatatud' : 'Jätka vaatamist?'}
        </h2>
        
        <p className="text-gray-300 mb-6">
          {isTabSwitch ? (
            <>
              Video peatati, kuna läksid teise tabi. 
              Vaatamine jäi pooleli ajal <strong>{formatTime(playheadPosition)}</strong>.
            </>
          ) : (
            <>
              Su vaatamine jäi pooleli <strong>{getTimeAgo(lastWatchedDate)}</strong> tagasi 
              ajal <strong>{formatTime(playheadPosition)}</strong>.
            </>
          )}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full bg-[#40b236] text-white py-3 px-4 rounded-lg font-medium 
                     hover:bg-[#359429] transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Jätka sealt, kus pooleli jäi
          </button>
          
          <button
            onClick={onStartOver}
            className="w-full bg-[#3e4551] text-white py-3 px-4 rounded-lg font-medium 
                     hover:bg-[#4d5665] transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Alusta algusest
          </button>
        </div>
      </div>
    </div>
  )
}