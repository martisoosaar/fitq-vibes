'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Smartphone, LogOut, Trash2, AlertTriangle, Bell, Shield, Eye, Globe, Clock, Link2, Copy, Check } from 'lucide-react'
import dynamic from 'next/dynamic'

const FlagDropdown = dynamic(() => import('@/components/FlagDropdown'), {
  ssr: false
})

interface Session {
  id: string
  deviceName: string
  lastActive: string
  isCurrent: boolean
}

interface AccountSettings {
  hideNameFromLeaderboards: boolean
  commentEmailNotifications: boolean
  programUnitInfoEmailNotifications: boolean
  weeklyNews: boolean
  monthlyNews: boolean
  showIntro: boolean
  displayOnTrainersList: boolean
  language: string
  timezone: string
  country: string
}

const languageOptions = [
  { value: 'et', label: 'Eesti', flag: '🇪🇪' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  { value: 'lv', label: 'Latviešu', flag: '🇱🇻' },
  { value: 'lt', label: 'Lietuvių', flag: '🇱🇹' },
]

const countryOptions = [
  { value: 'EE', label: 'Eesti', flag: '🇪🇪' },
  { value: 'LV', label: 'Läti', flag: '🇱🇻' },
  { value: 'LT', label: 'Leedu', flag: '🇱🇹' },
  { value: 'FI', label: 'Soome', flag: '🇫🇮' },
  { value: 'SE', label: 'Rootsi', flag: '🇸🇪' },
  { value: 'UK', label: 'Ühendkuningriik', flag: '🇬🇧' },
  { value: 'US', label: 'USA', flag: '🇺🇸' },
  { value: 'DE', label: 'Saksamaa', flag: '🇩🇪' },
]

const timezoneOptions = [
  { value: 'Europe/Tallinn', label: 'Tallinn (GMT+2)', flag: '🕐' },
  { value: 'Europe/Riga', label: 'Riia (GMT+2)', flag: '🕐' },
  { value: 'Europe/Vilnius', label: 'Vilnius (GMT+2)', flag: '🕐' },
  { value: 'Europe/Helsinki', label: 'Helsinki (GMT+2)', flag: '🕐' },
  { value: 'Europe/Stockholm', label: 'Stockholm (GMT+1)', flag: '🕐' },
  { value: 'Europe/London', label: 'London (GMT+0)', flag: '🕐' },
  { value: 'America/New_York', label: 'New York (GMT-5)', flag: '🕐' },
]

export default function AccountSettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [referralCode, setReferralCode] = useState('FITQ-MARTI-2024')
  const [codeCopied, setCodeCopied] = useState(false)
  const [settings, setSettings] = useState<AccountSettings>({
    hideNameFromLeaderboards: false,
    commentEmailNotifications: true,
    programUnitInfoEmailNotifications: true,
    weeklyNews: true,
    monthlyNews: true,
    showIntro: true,
    displayOnTrainersList: false,
    language: 'et',
    timezone: 'Europe/Tallinn',
    country: 'EE'
  })
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchSettings()
      fetchSessions()
    }
  }, [user, authLoading])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        
        // Generate referral code based on user ID
        setReferralCode(`FITQ-${data.id}-${new Date().getFullYear()}`)
        // Parse country and timezone if they are JSON strings
        let country = 'EE'
        let timezone = 'Europe/Tallinn'
        
        if (data.country) {
          try {
            const countryData = JSON.parse(data.country)
            country = countryData.id || 'EE'
          } catch {
            country = data.country
          }
        }
        
        if (data.timezone) {
          try {
            const timezoneData = JSON.parse(data.timezone)
            timezone = timezoneData.name || 'Europe/Tallinn'
          } catch {
            timezone = data.timezone
          }
        }
        
        setSettings({
          hideNameFromLeaderboards: data.hideNameFromLeaderboards || false,
          commentEmailNotifications: data.commentEmailNotifications || true,
          programUnitInfoEmailNotifications: data.programUnitInfoEmailNotifications || true,
          weeklyNews: data.weeklyNews || false,
          monthlyNews: data.monthlyNews || false,
          showIntro: data.showIntro || true,
          displayOnTrainersList: data.displayOnTrainersList || false,
          language: data.userLanguage === 2 ? 'en' : 'et', // Assuming 1=et, 2=en
          timezone: timezone,
          country: country
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/user/profile?type=sessions')
      if (response.ok) {
        const data = await response.json()
        
        // Format sessions for display
        const formattedSessions = data.map((session: any, index: number) => ({
          id: session.id.toString(),
          deviceName: session.deviceName || parseUserAgent(session.ua),
          lastActive: session.lastUsedAt 
            ? new Date(session.lastUsedAt).toLocaleString('et-EE')
            : new Date(session.createdAt).toLocaleString('et-EE'),
          isCurrent: index === 0 // Assume first one is current for now
        }))
        
        setSessions(formattedSessions.length > 0 ? formattedSessions : [{
          id: '1',
          deviceName: detectCurrentDevice(),
          lastActive: new Date().toLocaleString('et-EE'),
          isCurrent: true
        }])
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      // Fallback to current device
      setSessions([{
        id: '1',
        deviceName: detectCurrentDevice(),
        lastActive: new Date().toLocaleString('et-EE'),
        isCurrent: true
      }])
    }
  }
  
  const detectCurrentDevice = () => {
    const userAgent = navigator.userAgent
    let deviceName = 'Tundmatu seade'
    
    if (userAgent.includes('Mac')) {
      if (userAgent.includes('Chrome')) deviceName = 'Chrome - macOS'
      else if (userAgent.includes('Safari')) deviceName = 'Safari - macOS'
      else if (userAgent.includes('Firefox')) deviceName = 'Firefox - macOS'
    } else if (userAgent.includes('Windows')) {
      if (userAgent.includes('Chrome')) deviceName = 'Chrome - Windows'
      else if (userAgent.includes('Firefox')) deviceName = 'Firefox - Windows'
      else if (userAgent.includes('Edge')) deviceName = 'Edge - Windows'
    } else if (userAgent.includes('Linux')) {
      if (userAgent.includes('Chrome')) deviceName = 'Chrome - Linux'
      else if (userAgent.includes('Firefox')) deviceName = 'Firefox - Linux'
    }
    
    return deviceName
  }
  
  const parseUserAgent = (ua: string | null) => {
    if (!ua) return 'Tundmatu seade'
    
    let deviceName = 'Tundmatu seade'
    
    if (ua.includes('Mac')) {
      if (ua.includes('Chrome')) deviceName = 'Chrome - macOS'
      else if (ua.includes('Safari')) deviceName = 'Safari - macOS'
      else if (ua.includes('Firefox')) deviceName = 'Firefox - macOS'
    } else if (ua.includes('Windows')) {
      if (ua.includes('Chrome')) deviceName = 'Chrome - Windows'
      else if (ua.includes('Firefox')) deviceName = 'Firefox - Windows'
      else if (ua.includes('Edge')) deviceName = 'Edge - Windows'
    } else if (ua.includes('Linux')) {
      if (ua.includes('Chrome')) deviceName = 'Chrome - Linux'
      else if (ua.includes('Firefox')) deviceName = 'Firefox - Linux'
    } else if (ua.includes('iPhone')) {
      deviceName = 'Safari - iPhone'
    } else if (ua.includes('iPad')) {
      deviceName = 'Safari - iPad'
    } else if (ua.includes('Android')) {
      if (ua.includes('Chrome')) deviceName = 'Chrome - Android'
      else deviceName = 'Browser - Android'
    }
    
    return deviceName
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      
      // Add all settings as form data
      formData.append('hideNameFromLeaderboards', settings.hideNameFromLeaderboards.toString())
      formData.append('commentEmailNotifications', settings.commentEmailNotifications.toString())
      formData.append('programUnitInfoEmailNotifications', settings.programUnitInfoEmailNotifications.toString())
      formData.append('weeklyNews', settings.weeklyNews.toString())
      formData.append('monthlyNews', settings.monthlyNews.toString())
      formData.append('showIntro', settings.showIntro.toString())
      formData.append('displayOnTrainersList', settings.displayOnTrainersList.toString())
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData
      })
      
      if (response.ok) {
        setSuccessMessage('Seaded salvestatud!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        console.error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = (key: keyof AccountSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleLogoutDevice = async (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId))
  }

  const handleLogoutAll = async () => {
    setSessions(sessions.filter(s => s.isCurrent))
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText === 'KUSTUTA') {
      // Here you would make an API call to delete the account
      console.log('Deleting account...')
      setShowDeleteModal(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="bg-[#3e4551] rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40b236]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Sessions */}
      <div className="bg-[#3e4551] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Aktiivsed seansid
        </h2>
        
        <div className="space-y-3">
          {sessions.map((session) => (
            <div 
              key={session.id}
              className="flex items-center justify-between p-4 bg-[#2c313a] rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {session.deviceName}
                  {session.isCurrent && (
                    <span className="ml-2 px-2 py-1 bg-[#40b236] text-white text-xs rounded">
                      Praegune seade
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-400">
                  Viimati aktiivne: {session.lastActive}
                </p>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => handleLogoutDevice(session.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Logi välja"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {sessions.length > 1 && (
          <button
            onClick={handleLogoutAll}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Logi kõik seadmed välja (peale praeguse)
          </button>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="bg-[#3e4551] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Privaatsus
        </h2>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p>Peida nimi edetabelites</p>
              <p className="text-sm text-gray-400">Sinu nimi ei kuvata avalikes edetabelites</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.hideNameFromLeaderboards}
              onChange={(e) => handleSettingChange('hideNameFromLeaderboards', e.target.checked)}
              className="w-5 h-5 rounded border-[#4d5665] bg-[#2c313a] text-[#40b236] focus:ring-[#40b236]"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p>Kuva treenerite nimekirjas</p>
              <p className="text-sm text-gray-400">Sinu profiil on nähtav treenerite lehel</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.displayOnTrainersList}
              onChange={(e) => handleSettingChange('displayOnTrainersList', e.target.checked)}
              className="w-5 h-5 rounded border-[#4d5665] bg-[#2c313a] text-[#40b236] focus:ring-[#40b236]"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p>Näita sissejuhatust</p>
              <p className="text-sm text-gray-400">Kuva abitekste ja näpunäiteid</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.showIntro}
              onChange={(e) => handleSettingChange('showIntro', e.target.checked)}
              className="w-5 h-5 rounded border-[#4d5665] bg-[#2c313a] text-[#40b236] focus:ring-[#40b236]"
            />
          </label>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-[#3e4551] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Piirkond ja keel
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Keel</label>
            <FlagDropdown
              value={settings.language}
              onChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
              options={languageOptions}
              placeholder="Vali keel"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Riik</label>
            <FlagDropdown
              value={settings.country}
              onChange={(value) => setSettings(prev => ({ ...prev, country: value }))}
              options={countryOptions}
              placeholder="Vali riik"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Ajavöönd</label>
            <FlagDropdown
              value={settings.timezone}
              onChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
              options={timezoneOptions}
              placeholder="Vali ajavöönd"
            />
          </div>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-[#3e4551] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Kutsu sõpru
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Jaga oma liitumiskoodi sõpradega ja teeni boonuseid!
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralCode}
            readOnly
            className="flex-1 px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg text-white font-mono"
          />
          <button
            onClick={copyReferralCode}
            className="px-4 py-2 bg-[#40b236] hover:bg-[#60cc56] text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {codeCopied ? 'Kopeeritud!' : 'Kopeeri'}
          </button>
        </div>
        <div className="mt-4 p-4 bg-[#2c313a] rounded-lg">
          <p className="text-sm text-gray-400">Sinu kutsutud kasutajad: <span className="text-white font-semibold">0</span></p>
          <p className="text-sm text-gray-400">Teenitud boonused: <span className="text-[#40b236] font-semibold">0 €</span></p>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="bg-[#3e4551] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Ühendatud kontod
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-[#2c313a] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">f</span>
              </div>
              <div>
                <p className="font-medium">Facebook</p>
                <p className="text-sm text-gray-400">Pole ühendatud</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#40b236] hover:bg-[#60cc56] text-white rounded-lg transition-colors">
              Ühenda
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-[#2c313a] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <div>
                <p className="font-medium">Google</p>
                <p className="text-sm text-green-400">Ühendatud: marti@fitq.studio</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
              Eemalda
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-[#2c313a] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <div>
                <p className="font-medium">SportID</p>
                <p className="text-sm text-gray-400">Pole ühendatud</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#40b236] hover:bg-[#60cc56] text-white rounded-lg transition-colors">
              Ühenda
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#3e4551] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Teavitused
        </h2>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p>Kommentaaride teavitused</p>
              <p className="text-sm text-gray-400">Saa e-posti teavitusi, kui keegi kommenteerib sinu videot</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.commentEmailNotifications}
              onChange={(e) => handleSettingChange('commentEmailNotifications', e.target.checked)}
              className="w-5 h-5 rounded border-[#4d5665] bg-[#2c313a] text-[#40b236] focus:ring-[#40b236]"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p>Programmi info teavitused</p>
              <p className="text-sm text-gray-400">Saa teavitusi treeningprogrammide kohta</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.programUnitInfoEmailNotifications}
              onChange={(e) => handleSettingChange('programUnitInfoEmailNotifications', e.target.checked)}
              className="w-5 h-5 rounded border-[#4d5665] bg-[#2c313a] text-[#40b236] focus:ring-[#40b236]"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p>Nädalane uudiskiri</p>
              <p className="text-sm text-gray-400">Uued videod ja treenimisnäpunäited</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.weeklyNews}
              onChange={(e) => handleSettingChange('weeklyNews', e.target.checked)}
              className="w-5 h-5 rounded border-[#4d5665] bg-[#2c313a] text-[#40b236] focus:ring-[#40b236]"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p>Kuine kokkuvõte</p>
              <p className="text-sm text-gray-400">Sinu treeningute statistika ja soovitused</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.monthlyNews}
              onChange={(e) => handleSettingChange('monthlyNews', e.target.checked)}
              className="w-5 h-5 rounded border-[#4d5665] bg-[#2c313a] text-[#40b236] focus:ring-[#40b236]"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {successMessage && (
          <p className="text-green-500 text-sm">
            {successMessage}
          </p>
        )}
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="ml-auto px-6 py-3 bg-[#40b236] hover:bg-[#60cc56] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {saving ? 'Salvestamine...' : 'Salvesta seaded'}
        </button>
      </div>

      {/* Delete Account */}
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2 text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Ohtlik tsoon
        </h2>
        <p className="text-gray-300 mb-4">
          Konto kustutamine on pöördumatu. Kõik sinu andmed, treeningud ja ostud kustutatakse jäädavalt.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Kustuta konto
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3e4551] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-400">Konto kustutamine</h3>
            <p className="mb-4">
              Oled kindel, et soovid oma konto kustutada? See tegevus on pöördumatu!
            </p>
            <p className="mb-4">
              Kinnitamiseks kirjuta siia: <strong>KUSTUTA</strong>
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Kirjuta KUSTUTA"
              className="w-full px-4 py-2 bg-[#2c313a] border border-[#4d5665] rounded-lg mb-4 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-[#4d5665] hover:bg-[#5d6775] text-white rounded-lg font-medium transition-colors"
              >
                Tühista
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'KUSTUTA'}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Kustuta konto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}