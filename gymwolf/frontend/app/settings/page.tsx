'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Bell, Shield, Globe, Moon, Sun, Sunrise, Save, Calendar } from 'lucide-react';
import { saveDateFormat } from '@/lib/dateFormatter';
import LanguageSelector from '@/components/LanguageSelector';

export default function SettingsPage() {
  const router = useRouter();
  const { isDarkMode, themeMode, setThemeMode } = useTheme();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    workoutReminders: false,
    weeklyReports: true,
    publicProfile: false,
    language: 'en',
    themeMode: 'light' as 'light' | 'dark' | 'auto',
    dateFormat: 'MM/DD/YYYY'
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
    }
  }, []);

  const handleSave = () => {
    // Save settings to localStorage for now
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Save date format specifically
    saveDateFormat(settings.dateFormat);
    
    setToastMessage('Settings saved successfully!');
    setToastType('success');
    setShowToast(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <Navigation />
      
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <Bell className="h-5 w-5" />
              Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Workout Reminders</span>
                <input
                  type="checkbox"
                  checked={settings.workoutReminders}
                  onChange={(e) => setSettings({...settings, workoutReminders: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Progress Reports</span>
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={(e) => setSettings({...settings, weeklyReports: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <Shield className="h-5 w-5" />
              Privacy
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Public Profile</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Allow others to see your workout stats</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.publicProfile}
                  onChange={(e) => setSettings({...settings, publicProfile: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <Moon className="h-5 w-5" />
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setThemeMode('light');
                    setSettings({...settings, themeMode: 'light'});
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    themeMode === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Sun className="h-6 w-6 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Light</span>
                </button>
                
                <button
                  onClick={() => {
                    setThemeMode('dark');
                    setSettings({...settings, themeMode: 'dark'});
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    themeMode === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Moon className="h-6 w-6 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark</span>
                </button>
                
                <button
                  onClick={() => {
                    setThemeMode('auto');
                    setSettings({...settings, themeMode: 'auto'});
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    themeMode === 'auto'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Sunrise className="h-6 w-6 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto</span>
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {themeMode === 'auto' 
                  ? `Auto mode: Currently ${isDarkMode ? 'dark' : 'light'} based on time of day`
                  : `Using ${themeMode} mode`
                }
              </p>
            </div>
          </div>

          {/* Language & Region */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <Globe className="h-5 w-5" />
              Language & Region
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Language
                </label>
                <LanguageSelector 
                  value={settings.language}
                  onChange={(lang) => setSettings({...settings, language: lang})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Format
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="MM/DD/YYYY">MM/DD/YYYY (08/19/2025)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (19/08/2025)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2025-08-19)</option>
                  <option value="DD.MM.YYYY">DD.MM.YYYY (19.08.2025)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This format will be used throughout the application
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            Save Settings
          </button>
        </div>
      </main>
      
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <Footer />
    </div>
  );
}