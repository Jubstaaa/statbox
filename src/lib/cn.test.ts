import { describe, expect, it } from 'vitest'

import { cn } from './cn'

describe('cn', () => {
    it('merges class names', () => {
        expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
        expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
    })

    it('deduplicates tailwind conflicts', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4')
    })

    it('returns empty string for no inputs', () => {
        expect(cn()).toBe('')
    })

    it('handles undefined and null', () => {
        expect(cn('a', undefined, null, 'b')).toBe('a b')
    })
})
