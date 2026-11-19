import { NextRequest } from 'next/server'
import { GenericError } from 'twisted'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildWidgetUrls } from '@/features/widget-generator/widget-generator.payload'
import { RiotRateLimitedError } from '@/lib/riot/riot.errors'

import { GET } from './route'

const PUUID = 'a'.repeat(78)

const fetchRiotDataByPuuid = vi.hoisted(() => vi.fn())

vi.mock('@/lib/riot/riot', () => ({ fetchRiotDataByPuuid }))

function call(segment: string, query = '') {
    const request = new NextRequest(
        `https://statbox.live/api/summoner/${segment}${query}`
    )

    return GET(request, { params: Promise.resolve({ payload: segment }) })
}

afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
})

describe('GET /api/summoner/[payload]', () => {
    it('answers with data the edge may cache briefly', async () => {
        fetchRiotDataByPuuid.mockResolvedValue({ puuid: PUUID })

        const response = await call(PUUID, '?region=KR&queue=flex')

        expect(response.status).toBe(200)
        expect(await response.json()).toEqual({ puuid: PUUID })
        expect(response.headers.get('cache-control')).toBe(
            'public, max-age=60, s-maxage=60'
        )
        expect(fetchRiotDataByPuuid).toHaveBeenCalledWith(PUUID, 'KR', 'flex')
    })

    it('defaults to the solo queue', async () => {
        fetchRiotDataByPuuid.mockResolvedValue({ puuid: PUUID })

        await call(PUUID, '?region=EUW')

        expect(fetchRiotDataByPuuid).toHaveBeenCalledWith(PUUID, 'EUW', 'solo')
    })

    it('reads puuid, region and queue from a widget payload', async () => {
        fetchRiotDataByPuuid.mockResolvedValue({ puuid: PUUID })
        const { widgetUrl } = buildWidgetUrls({
            puuid: PUUID,
            queue: 'flex',
            region: 'TR',
            sessionMode: 'all-day',
            sessionTime: null,
            style: 'compact',
        })
        const payload = widgetUrl.split('/widget/')[1] ?? ''

        const response = await call(payload)

        expect(response.status).toBe(200)
        expect(fetchRiotDataByPuuid).toHaveBeenCalledWith(PUUID, 'TR', 'flex')
    })

    it.each([
        ['a malformed PUUID', 'x/../../riot/account', '?region=KR'],
        ['a missing region', PUUID, ''],
        ['an unknown region', PUUID, '?region=MARS'],
    ])('rejects %s without calling Riot', async (_, segment, query) => {
        const response = await call(segment, query)

        expect(response.status).toBe(400)
        expect(response.headers.get('cache-control')).toBe('no-store')
        expect(fetchRiotDataByPuuid).not.toHaveBeenCalled()
    })

    it('answers 404 for a player Riot does not know', async () => {
        fetchRiotDataByPuuid.mockRejectedValue(
            new GenericError({} as never, {
                message: 'Not found',
                name: 'HttpError',
                response: { status: 404 },
            })
        )

        const response = await call(PUUID, '?region=KR')

        expect(response.status).toBe(404)
        expect(response.headers.get('cache-control')).toBe('no-store')
    })

    it('answers 503 with Retry-After while Riot is rate limiting', async () => {
        fetchRiotDataByPuuid.mockRejectedValue(new RiotRateLimitedError(42))

        const response = await call(PUUID, '?region=KR')

        expect(response.status).toBe(503)
        expect(response.headers.get('retry-after')).toBe('42')
        expect(response.headers.get('cache-control')).toBe('no-store')
    })

    it('answers 502 and logs any other upstream failure', async () => {
        const log = vi.spyOn(console, 'error').mockImplementation(() => {})
        fetchRiotDataByPuuid.mockRejectedValue(new Error('socket hang up'))

        const response = await call(PUUID, '?region=KR')

        expect(response.status).toBe(502)
        expect(response.headers.get('cache-control')).toBe('no-store')
        expect(log).toHaveBeenCalled()
    })
})
