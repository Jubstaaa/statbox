import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RiotRateLimitedError } from '@/lib/riot/riot.errors'

import { GET } from './route'

const PUUID = 'b'.repeat(78)

const resolvePuuidByRiotId = vi.hoisted(() => vi.fn())

vi.mock('@/lib/riot/riot', () => ({ resolvePuuidByRiotId }))

function call(params: Record<string, string>) {
    const query = new URLSearchParams(params).toString()

    return GET(
        new NextRequest(`https://statbox.live/api/summoner/resolve?${query}`)
    )
}

afterEach(() => {
    vi.clearAllMocks()
})

describe('GET /api/summoner/resolve', () => {
    it('answers with the PUUID and lets the edge keep it for a day', async () => {
        resolvePuuidByRiotId.mockResolvedValue(PUUID)

        const response = await call({
            name: 'Hide on bush',
            region: 'KR',
            tag: '#KR1',
        })

        expect(response.status).toBe(200)
        expect(await response.json()).toEqual({ puuid: PUUID, region: 'KR' })
        expect(response.headers.get('cache-control')).toBe(
            'public, max-age=3600, s-maxage=86400'
        )
        expect(resolvePuuidByRiotId).toHaveBeenCalledWith(
            'Hide on bush',
            'KR1',
            'KR'
        )
    })

    it('answers 404 when the Riot ID does not exist', async () => {
        resolvePuuidByRiotId.mockResolvedValue(null)

        const response = await call({
            name: 'nobody',
            region: 'NA',
            tag: 'NA1',
        })

        expect(response.status).toBe(404)
        expect(response.headers.get('cache-control')).toBe('no-store')
    })

    it.each([
        ['an empty name', { name: ' ', region: 'NA', tag: 'NA1' }],
        [
            'a name longer than Riot allows',
            { name: 'x'.repeat(17), region: 'NA', tag: 'NA1' },
        ],
        [
            'a name with URL syntax',
            { name: 'a/../b', region: 'NA', tag: 'NA1' },
        ],
        ['a tag with URL syntax', { name: 'abc', region: 'NA', tag: 'a?b' }],
        ['an unknown region', { name: 'abc', region: 'MARS', tag: 'NA1' }],
    ])('rejects %s without calling Riot', async (_, params) => {
        const response = await call(params)

        expect(response.status).toBe(400)
        expect(resolvePuuidByRiotId).not.toHaveBeenCalled()
    })

    it('answers 503 with Retry-After while Riot is rate limiting', async () => {
        resolvePuuidByRiotId.mockRejectedValue(new RiotRateLimitedError(7))

        const response = await call({ name: 'abc', region: 'NA', tag: 'NA1' })

        expect(response.status).toBe(503)
        expect(response.headers.get('retry-after')).toBe('7')
    })
})
