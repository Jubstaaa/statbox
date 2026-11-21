import { describe, expect, it } from 'vitest'

import { FEATURE_ITEMS, REFRESH_METRIC } from './landing.constants'

describe('landing copy', () => {
    it('states the refresh interval the widget actually polls at', () => {
        expect(REFRESH_METRIC).toBe('2m')
        expect(
            FEATURE_ITEMS.find(item => item.title === 'Set and forget')
                ?.description
        ).toContain('every 2 minutes')
    })
})
