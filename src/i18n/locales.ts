export const locales = ['en', 'fr'] as const

export type Locale = (typeof locales)[number]

export const baseLocale: Locale = 'en'
