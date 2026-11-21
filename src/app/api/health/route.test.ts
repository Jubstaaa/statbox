import { afterEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

const checkCacheHealth = vi.hoisted(() => vi.fn())

vi.mock('@/lib/cache', () => ({ checkCacheHealth }))

afterEach(() => {
    vi.restoreAllMocks()
})

describe('GET /api/health', () => {
    it('answers 200 when the cache database is usable', async () => {
        checkCacheHealth.mockResolvedValue(undefined)

        const response = await GET()

        expect(response.status).toBe(200)
        expect(await response.json()).toEqual({ status: 'ok' })
        expect(response.headers.get('cache-control')).toBe('no-store')
    })

    it('answers 503 and reports when the cache database is not', async () => {
        checkCacheHealth.mockRejectedValue(new Error('SQLITE_CANTOPEN'))
        const reported = vi.spyOn(console, 'error').mockImplementation(() => {})

        const response = await GET()

        expect(response.status).toBe(503)
        expect(await response.json()).toEqual({ status: 'unavailable' })
        expect(response.headers.get('cache-control')).toBe('no-store')
        expect(reported).toHaveBeenCalled()
    })
})
