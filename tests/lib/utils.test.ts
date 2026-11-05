import { cn } from '@src/lib/utils.ts'
import { describe, expect, it } from 'vitest'

describe('cn', () => {
  it('lets later classes override conflicting ones', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('drops falsy values', () => {
    expect(cn('base', false && 'hidden', undefined, { active: true, idle: false })).toBe(
      'base active',
    )
  })
})
