'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import UserMenu from './UserMenu';
import { t } from '@/lib/translations';

export default function Navigation() {
  const pathname = usePathname();
  const [showExercisesDropdown, setShowExercisesDropdown] = useState(false);
  const [showCalculatorsDropdown, setShowCalculatorsDropdown] = useState(false);
  const [showChallengesDropdown, setShowChallengesDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const exercisesDropdownRef = useRef<HTMLDivElement>(null);
  const calculatorsDropdownRef = useRef<HTMLDivElement>(null);
  const challengesDropdownRef = useRef<HTMLDivElement>(null);
  
  // Don't show navigation on login/auth pages
  if (pathname === '/login' || pathname?.startsWith('/auth')) {
    return null;
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exercisesDropdownRef.current && !exercisesDropdownRef.current.contains(event.target as Node)) {
        setShowExercisesDropdown(false);
      }
      if (calculatorsDropdownRef.current && !calculatorsDropdownRef.current.contains(event.target as Node)) {
        setShowCalculatorsDropdown(false);
      }
      if (challengesDropdownRef.current && !challengesDropdownRef.current.contains(event.target as Node)) {
        setShowChallengesDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Menu Items */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <img 
                src="/assets/gymwolf-icon.png" 
                alt="Gymwolf" 
                className="h-10 w-10"
              />
              <span className="ml-3 text-xl font-bold text-white">Gymwolf</span>
            </Link>

            {/* Desktop Menu - hidden on mobile */}
            <div className="hidden md:flex items-center space-x-8 ml-8">
              {/* Exercises Dropdown */}
              <div className="relative" ref={exercisesDropdownRef}>
                <button
                  onClick={() => setShowExercisesDropdown(!showExercisesDropdown)}
                  className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('nav.exercises')}
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showExercisesDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showExercisesDropdown && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        href="/exercises?tab=my"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowExercisesDropdown(false)}
                      >
                        {t('exercises.myExercises')}
                      </Link>
                      <Link
                        href="/exercises?tab=verified"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowExercisesDropdown(false)}
                      >
                        {t('exercises.verifiedExercises')}
                      </Link>
                      <Link
                        href="/exercises?tab=all"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowExercisesDropdown(false)}
                      >
                        {t('exercises.allExercises')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Workouts Link */}
              <Link
                href="/workouts/new"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('nav.workouts')}
              </Link>

              {/* Calculators Dropdown */}
              <div className="relative" ref={calculatorsDropdownRef}>
                <button
                  onClick={() => setShowCalculatorsDropdown(!showCalculatorsDropdown)}
                  className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('nav.calculators')}
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showCalculatorsDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showCalculatorsDropdown && (
                  <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        href="/calculators?tab=bmi"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowCalculatorsDropdown(false)}
                      >
                        {t('calculators.bmi')}
                      </Link>
                      <Link
                        href="/calculators?tab=body-fat"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowCalculatorsDropdown(false)}
                      >
                        {t('calculators.bodyFat')}
                      </Link>
                      <Link
                        href="/calculators?tab=bmr"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowCalculatorsDropdown(false)}
                      >
                        {t('calculators.bmr')}
                      </Link>
                      <Link
                        href="/calculators?tab=one-rep-max"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowCalculatorsDropdown(false)}
                      >
                        {t('calculators.oneRepMax')}
                      </Link>
                      <Link
                        href="/calculators?tab=target-heart-rate"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowCalculatorsDropdown(false)}
                      >
                        {t('calculators.targetHeartRate')}
                      </Link>
                      <Link
                        href="/calculators?tab=ideal-weight"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowCalculatorsDropdown(false)}
                      >
                        {t('calculators.idealWeight')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Challenges Dropdown */}
              <div className="relative" ref={challengesDropdownRef}>
                <button
                  onClick={() => setShowChallengesDropdown(!showChallengesDropdown)}
                  className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('nav.challenges')}
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showChallengesDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showChallengesDropdown && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        href="/challenges/active"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowChallengesDropdown(false)}
                      >
                        {t('challenges.activeChallenges')}
                      </Link>
                      <Link
                        href="/challenges/past"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowChallengesDropdown(false)}
                      >
                        {t('challenges.pastChallenges')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - User Menu and Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <UserMenu />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Exercises */}
            <button
              onClick={() => setShowExercisesDropdown(!showExercisesDropdown)}
              className="w-full text-left flex items-center justify-between text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium"
            >
              {t('nav.exercises')}
              <ChevronDown className={`h-4 w-4 transition-transform ${showExercisesDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showExercisesDropdown && (
              <div className="pl-4 space-y-1">
                <Link
                  href="/exercises?tab=my"
                  className="block text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('exercises.myExercises')}
                </Link>
                <Link
                  href="/exercises?tab=verified"
                  className="block text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('exercises.verifiedExercises')}
                </Link>
                <Link
                  href="/exercises?tab=all"
                  className="block text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('exercises.allExercises')}
                </Link>
              </div>
            )}

            {/* Mobile Workouts */}
            <Link
              href="/workouts/new"
              className="block text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.workouts')}
            </Link>

            {/* Mobile Calculators */}
            <button
              onClick={() => setShowCalculatorsDropdown(!showCalculatorsDropdown)}
              className="w-full text-left flex items-center justify-between text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium"
            >
              {t('nav.calculators')}
              <ChevronDown className={`h-4 w-4 transition-transform ${showCalculatorsDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showCalculatorsDropdown && (
              <div className="pl-4 space-y-1">
                <Link
                  href="/calculators?tab=bmi"
                  className="block text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('calculators.bmi')}
                </Link>
                <Link
                  href="/calculators?tab=body-fat"
                  className="block text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('calculators.bodyFat')}
                </Link>
                <Link
                  href="/calculators?tab=bmr"
                  className="block text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('calculators.bmr')}
                </Link>
                <Link
                  href="/calculators?tab=one-rep-max"
                  className="block text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('calculators.oneRepMax')}
                </Link>
                <Link
                  href="/calculators?tab=target-heart-rate"
                  className="block text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('calculators.targetHeartRate')}
                </Link>
                <Link
                  href="/calculators?tab=ideal-weight"
                  className="block text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('calculators.idealWeight')}
                </Link>
              </div>
            )}

            {/* Mobile Challenges */}
            <button
              onClick={() => setShowChallengesDropdown(!showChallengesDropdown)}
              className="w-full text-left flex items-center justify-between text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium"
            >
              {t('nav.challenges')}
              <ChevronDown className={`h-4 w-4 transition-transform ${showChallengesDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showChallengesDropdown && (
              <div className="pl-4 space-y-1">
                <Link
                  href="/challenges/active"
                  className="block text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('challenges.activeChallenges')}
                </Link>
                <Link
                  href="/challenges/past"
                  className="block text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('challenges.pastChallenges')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile User Menu */}
          <div className="border-t border-gray-700 pt-4 pb-3">
            <UserMenu />
          </div>
        </div>
      )}
    </nav>
  );
}