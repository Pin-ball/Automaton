import en from '@src/i18n/locales/en.json'
import fr from '@src/i18n/locales/fr.json'
import { describe, expect, it } from 'vitest'

function keys(messages: object, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? keys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

describe('locales', () => {
  it('translate the same keys in every language', () => {
    expect(keys(fr).sort()).toEqual(keys(en).sort())
  })

  it('leave no translation empty', () => {
    for (const messages of [en, fr]) {
      expect(Object.values(messages).flatMap((group) => Object.values(group))).not.toContain('')
    }
  })
})
