import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import './zod-config'

describe('zod config', () => {
    it('keeps zod off its eval-based fast path, which the CSP forbids', () => {
        expect(z.config().jitless).toBe(true)
    })
})
