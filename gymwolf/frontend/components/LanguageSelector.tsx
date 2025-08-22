'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Check } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
}

const languages = [
  { 
    code: 'en', 
    name: 'English', 
    flag: '🇬🇧',
    flagUS: '🇺🇸',
    description: 'English (UK/US)'
  },
  { 
    code: 'et', 
    name: 'Eesti', 
    flag: '🇪🇪',
    description: 'Estonian'
  },
  { 
    code: 'lv', 
    name: 'Latviešu', 
    flag: '🇱🇻',
    description: 'Latvian'
  },
  { 
    code: 'lt', 
    name: 'Lietuvių', 
    flag: '🇱🇹',
    description: 'Lithuanian'
  },
  { 
    code: 'fi', 
    name: 'Suomi', 
    flag: '🇫🇮',
    description: 'Finnish'
  },
  { 
    code: 'sv', 
    name: 'Svenska', 
    flag: '🇸🇪',
    description: 'Swedish'
  },
];

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInUS, setIsInUS] = useState(false);

  useEffect(() => {
    // Check if user is in US based on timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setIsInUS(timezone.includes('America'));
  }, []);

  const handleLanguageChange = (langCode: string) => {
    // Update local state
    onChange(langCode);
    
    // Save to localStorage
    localStorage.setItem('userLanguage', langCode);
    
    // For now, reload to apply the new language
    // In the future, this will navigate to localized routes
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {languages.map((lang) => {
        const isSelected = value === lang.code;
        const displayFlag = lang.code === 'en' && isInUS ? lang.flagUS : lang.flag;
        
        return (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all
              ${isSelected 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <span className="text-2xl">{displayFlag}</span>
            <div className="text-left flex-1">
              <div className={`font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                {lang.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {lang.description}
              </div>
            </div>
            {isSelected && (
              <Check className="absolute top-2 right-2 h-4 w-4 text-blue-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}