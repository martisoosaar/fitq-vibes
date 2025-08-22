'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Dumbbell, Heart, StretchVertical, Trophy, MoreHorizontal } from 'lucide-react';

type SegmentType = 'strength' | 'cardio' | 'mobility' | 'sports' | 'other';

interface SegmentTypeSelectProps {
  value: SegmentType;
  onChange: (type: SegmentType) => void;
}

const segmentTypes: { value: SegmentType; label: string; icon: any; color: string }[] = [
  { value: 'strength', label: 'Strength Training', icon: Dumbbell, color: 'text-blue-600' },
  { value: 'cardio', label: 'Cardio', icon: Heart, color: 'text-red-600' },
  { value: 'mobility', label: 'Mobility', icon: StretchVertical, color: 'text-green-600' },
  { value: 'sports', label: 'Sports', icon: Trophy, color: 'text-purple-600' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-gray-600' },
];

export default function SegmentTypeSelect({ value, onChange }: SegmentTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedType = segmentTypes.find(t => t.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selectedType && (
          <>
            <selectedType.icon className={`h-4 w-4 ${selectedType.color}`} />
            <span className="text-sm font-medium dark:text-white">{selectedType.label}</span>
          </>
        )}
        <ChevronDown className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          <div className="py-1">
            {segmentTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  onChange(type.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  value === type.value ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
              >
                <type.icon className={`h-5 w-5 ${type.color}`} />
                <div>
                  <div className="font-medium text-sm dark:text-white">{type.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {type.value === 'strength' && 'Weights, resistance training'}
                    {type.value === 'cardio' && 'Running, cycling, swimming'}
                    {type.value === 'mobility' && 'Stretching, flexibility'}
                    {type.value === 'sports' && 'Sport-specific training'}
                    {type.value === 'other' && 'Custom workout type'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}