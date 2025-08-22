import en from '@/messages/en.json';
import et from '@/messages/et.json';
import lv from '@/messages/lv.json';
import lt from '@/messages/lt.json';
import fi from '@/messages/fi.json';
import sv from '@/messages/sv.json';

type Messages = typeof en;

const messages: Record<string, Messages> = {
  en,
  et,
  lv,
  lt,
  fi,
  sv
};

export function getTranslations() {
  const language = typeof window !== 'undefined' 
    ? localStorage.getItem('userLanguage') || 'en'
    : 'en';
  
  return messages[language] || messages.en;
}

export function t(key: string): string {
  const translations = getTranslations();
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
  }
  
  return String(value);
}