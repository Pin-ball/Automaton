import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import frMessages from './locales/fr.json'
import type { Locale } from './locales.ts'
import { baseLocale, locales } from './locales.ts'

type Resources = typeof en

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: Resources }
  }
}

const fr: Resources = frMessages

export const resources: Record<Locale, { translation: Resources }> = {
  en: { translation: en },
  fr: { translation: fr },
}

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: [...locales],
    load: 'languageOnly',
    fallbackLng: baseLocale,
    initAsync: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'automaton:locale',
      caches: ['localStorage'],
      convertDetectedLanguage: (language) => language.split('-')[0] ?? language,
    },
  })
