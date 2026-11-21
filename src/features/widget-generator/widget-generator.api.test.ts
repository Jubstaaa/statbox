import { skipToken } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
    fetchSummonerByPuuid,
    resolveSummoner,
    summonerQueryOptions,
    SummonerRequestError,
} from './widget-generator.api'

const PUUID = 'c'.repeat(78)

const RIOT_DATA = {
    gameName: 'Hide on bush',
    hotStreak: false,
    leaguePoints: 50,
    losses: 10,
    matchHistory: [],
    profileIconId: 6,
    puuid: PUUID,
    rank: 'I',
    summonerLevel: 300,
    tagLine: 'KR1',
    tier: 'CHALLENGER',
    wins: 20,
}

function respondWith(body: unknown, status = 200) {
    const fetchMock = vi.fn(async () => Response.json(body, { status }))
    vi.stubGlobal('fetch', fetchMock)

    return fetchMock
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('fetchSummonerByPuuid', () => {
    it('asks for one URL per player, region and queue, revalidating every time', async () => {
        const fetchMock = respondWith(RIOT_DATA)

        await expect(
            fetchSummonerByPuuid({ puuid: PUUID, queue: 'flex', region: 'KR' })
        ).resolves.toEqual(RIOT_DATA)

        expect(fetchMock).toHaveBeenCalledWith(
            `/api/summoner/${PUUID}?queue=flex&region=KR`,
            // Revalidating keeps a long browser TTL injected by the CDN from
            // freezing a stream overlay on old numbers.
            { cache: 'no-cache' }
        )
    })

    it('carries the status and message of an error answer', async () => {
        respondWith({ error: 'Riot API is busy, try again shortly' }, 503)

        const error = await fetchSummonerByPuuid({
            puuid: PUUID,
            queue: 'solo',
            region: 'KR',
        }).catch((caught: unknown) => caught)

        expect(error).toBeInstanceOf(SummonerRequestError)
        expect(error).toMatchObject({
            message: 'Riot API is busy, try again shortly',
            status: 503,
        })
    })

    it('keeps the status when an error page is not JSON', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(
                async () =>
                    new Response('<html>Bad gateway</html>', { status: 502 })
            )
        )

        await expect(
            fetchSummonerByPuuid({ puuid: PUUID, queue: 'solo', region: 'KR' })
        ).rejects.toMatchObject({ status: 502 })
    })

    it('rejects a body that is not summoner data', async () => {
        respondWith({ puuid: PUUID })

        await expect(
            fetchSummonerByPuuid({ puuid: PUUID, queue: 'solo', region: 'KR' })
        ).rejects.toThrow()
    })
})

describe('resolveSummoner', () => {
    it('returns the PUUID and region', async () => {
        respondWith({ puuid: PUUID, region: 'KR' })

        await expect(
            resolveSummoner({ name: 'Hide on bush', region: 'KR', tag: 'KR1' })
        ).resolves.toEqual({ puuid: PUUID, region: 'KR' })
    })

    it('rejects a PUUID of the wrong shape', async () => {
        respondWith({ puuid: '../x', region: 'KR' })

        await expect(
            resolveSummoner({ name: 'a', region: 'KR', tag: 'KR1' })
        ).rejects.toThrow()
    })
})

describe('summonerQueryOptions', () => {
    it('keys a summoner by player, region and queue', () => {
        expect(
            summonerQueryOptions({ puuid: PUUID, queue: 'flex', region: 'KR' })
                .queryKey
        ).toEqual(['summoner', PUUID, 'KR', 'flex'])
    })

    it('does not fetch without a target', () => {
        expect(summonerQueryOptions(null).queryFn).toBe(skipToken)
    })
})
