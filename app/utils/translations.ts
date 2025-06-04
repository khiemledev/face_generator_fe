import enTranslations from '../i18n/en.json'
import viTranslations from '../i18n/vi.json'

export const translations = {
  en: enTranslations,
  vi: viTranslations,
}

export type TranslationKey = keyof typeof enTranslations

export function getTranslation(language: 'en' | 'vi', key: string): string {
  const keys = key.split('.')
  let value: any = translations[language]
  
  for (const k of keys) {
    if (value === undefined) return key
    value = value[k]
  }
  
  return value || translations['en'][key] || key
} 