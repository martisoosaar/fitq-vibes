'use client';

import { useState, useEffect } from 'react';
import { Save, Search, Plus, Trash2, Check, X } from 'lucide-react';
import api from '@/lib/api';
import Toast from '@/components/Toast';

// Import all translation files
import enTranslations from '@/messages/en.json';
import etTranslations from '@/messages/et.json';
import lvTranslations from '@/messages/lv.json';
import ltTranslations from '@/messages/lt.json';
import fiTranslations from '@/messages/fi.json';
import svTranslations from '@/messages/sv.json';

interface TranslationEntry {
  key: string;
  [lang: string]: string;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
];

export default function TranslationsPage() {
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<TranslationEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('et');
  const [modifiedKeys, setModifiedKeys] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTranslation, setNewTranslation] = useState({
    key: '',
    sourceText: '',
    targetText: ''
  });

  useEffect(() => {
    loadTranslations();
  }, []);

  useEffect(() => {
    filterTranslations();
  }, [searchTerm, selectedCategory, translations, sourceLanguage, targetLanguage]);

  const loadTranslations = () => {
    const allTranslations: TranslationEntry[] = [];
    const translationFiles: Record<string, any> = {
      en: enTranslations,
      et: etTranslations,
      lv: lvTranslations,
      lt: ltTranslations,
      fi: fiTranslations,
      sv: svTranslations
    };

    // Flatten nested objects and create translation entries
    const flattenObject = (obj: any, prefix = ''): void => {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          flattenObject(obj[key], fullKey);
        } else {
          // Check if this key already exists
          let entry = allTranslations.find(t => t.key === fullKey);
          if (!entry) {
            entry = {
              key: fullKey,
              en: '',
              et: '',
              lv: '',
              lt: '',
              fi: '',
              sv: ''
            };
            allTranslations.push(entry);
          }
        }
      });
    };

    // Process each language
    Object.keys(translationFiles).forEach(lang => {
      flattenObject(translationFiles[lang]);
    });

    // Fill in the values for each language
    allTranslations.forEach(entry => {
      const keys = entry.key.split('.');
      Object.keys(translationFiles).forEach(lang => {
        let value: any = translationFiles[lang];
        for (const k of keys) {
          value = value?.[k];
        }
        if (value !== undefined && typeof value === 'string') {
          entry[lang] = value;
        }
      });
    });

    setTranslations(allTranslations);
  };

  const filterTranslations = () => {
    let filtered = [...translations];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t[sourceLanguage]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t[targetLanguage]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.key.startsWith(selectedCategory));
    }

    setFilteredTranslations(filtered);
  };

  const getCategories = () => {
    const categories = new Set<string>();
    translations.forEach(t => {
      const category = t.key.split('.')[0];
      categories.add(category);
    });
    return Array.from(categories).sort();
  };

  const handleTranslationChange = (key: string, value: string) => {
    // Update local state
    const updatedTranslations = translations.map(t => 
      t.key === key 
        ? { ...t, [targetLanguage]: value }
        : t
    );
    setTranslations(updatedTranslations);
    
    // Mark as modified
    setModifiedKeys(prev => new Set(prev).add(key));
  };

  const handleSave = async (key: string) => {
    const translation = translations.find(t => t.key === key);
    if (!translation) return;

    try {
      // Save to backend
      await api.post('/admin/translations', {
        key: key,
        translations: {
          [targetLanguage]: translation[targetLanguage]
        }
      });

      // Remove from modified set
      setModifiedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });

      setToastMessage('Tõlge salvestatud!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error saving translation:', error);
      setToastMessage('Viga tõlke salvestamisel');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleAddNew = async () => {
    if (!newTranslation.key) {
      setToastMessage('Sisesta tõlke võti');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      // Create new translation entry
      const newEntry: TranslationEntry = {
        key: newTranslation.key,
        en: '',
        et: '',
        lv: '',
        lt: '',
        fi: '',
        sv: ''
      };
      
      // Set source and target values
      newEntry[sourceLanguage] = newTranslation.sourceText;
      newEntry[targetLanguage] = newTranslation.targetText;

      // Add to local state
      setTranslations([...translations, newEntry]);

      // Save to backend
      await api.post('/admin/translations', {
        key: newTranslation.key,
        translations: {
          [sourceLanguage]: newTranslation.sourceText,
          [targetLanguage]: newTranslation.targetText
        }
      });

      setIsAddingNew(false);
      setNewTranslation({
        key: '',
        sourceText: '',
        targetText: ''
      });
      setToastMessage('Uus tõlge lisatud!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error adding translation:', error);
      setToastMessage('Viga tõlke lisamisel');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Kas oled kindel, et soovid kustutada tõlke "${key}"?`)) {
      return;
    }

    try {
      // Remove from local state
      setTranslations(translations.filter(t => t.key !== key));

      // Delete from backend
      await api.delete(`/admin/translations/${encodeURIComponent(key)}`);

      setToastMessage('Tõlge kustutatud!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting translation:', error);
      setToastMessage('Viga tõlke kustutamisel');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tõlgete haldus</h2>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Lisa uus tõlge
        </button>
      </div>

      {/* Language selectors and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lähtekeel
            </label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sihtkeel
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {languages.filter(lang => lang.code !== sourceLanguage).map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategooria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Kõik kategooriad</option>
              {getCategories().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Otsi
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Otsi võtme või teksti järgi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add new translation form */}
      {isAddingNew && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lisa uus tõlge</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Võti (nt: common.newKey)
              </label>
              <input
                type="text"
                value={newTranslation.key}
                onChange={(e) => setNewTranslation({...newTranslation, key: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {languages.find(l => l.code === sourceLanguage)?.flag} Lähtekeel ({sourceLanguage})
                </label>
                <input
                  type="text"
                  value={newTranslation.sourceText}
                  onChange={(e) => setNewTranslation({...newTranslation, sourceText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {languages.find(l => l.code === targetLanguage)?.flag} Sihtkeel ({targetLanguage})
                </label>
                <input
                  type="text"
                  value={newTranslation.targetText}
                  onChange={(e) => setNewTranslation({...newTranslation, targetText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="h-4 w-4" />
                Lisa
              </button>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setNewTranslation({
                    key: '',
                    sourceText: '',
                    targetText: ''
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
                Tühista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Translations table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Võti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {languages.find(l => l.code === sourceLanguage)?.flag} Lähtekeel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {languages.find(l => l.code === targetLanguage)?.flag} Sihtkeel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tegevused
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTranslations.map(translation => (
                <tr key={translation.key} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {translation.key}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    <div className="max-w-xs truncate" title={translation[sourceLanguage]}>
                      {translation[sourceLanguage] || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={translation[targetLanguage] || ''}
                        onChange={(e) => handleTranslationChange(translation.key, e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      {modifiedKeys.has(translation.key) && (
                        <button
                          onClick={() => handleSave(translation.key)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Salvesta"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(translation.key)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}