'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
  flag: string
}

interface FlagDropdownProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
}

export default function FlagDropdown({ value, onChange, options, placeholder = 'Select' }: FlagDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const selectedOption = options.find(opt => opt.value === value)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSelect = (option: Option) => {
    onChange(option.value)
    setIsOpen(false)
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg focus:outline-none focus:border-[#40b236] flex items-center justify-between hover:bg-[#3e4551] transition-colors"
      >
        <div className="flex items-center gap-3">
          {selectedOption && (
            <span className="text-2xl">{selectedOption.flag}</span>
          )}
          <span className="text-white">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#2c313a] border border-[#4d5665] rounded-lg shadow-xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#3e4551] transition-colors text-left ${
                  value === option.value ? 'bg-[#3e4551] border-l-4 border-[#40b236]' : ''
                }`}
              >
                <span className="text-2xl">{option.flag}</span>
                <span className="text-white">{option.label}</span>
                {value === option.value && (
                  <span className="ml-auto text-[#40b236]">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}