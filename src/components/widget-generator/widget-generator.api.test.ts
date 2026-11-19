import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchSummonerByPuuid } from './widget-generator.api'

const PUUID = 'c'.repeat(78)

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('fetchSummonerByPuuid', () => {
    it('asks for one URL per player, region and queue, revalidating every time', async () => {
        const fetchMock = vi.fn(async () => Response.json({ puuid: PUUID }))
        vi.stubGlobal('fetch', fetchMock)

        await fetchSummonerByPuuid({
            puuid: PUUID,
            queue: 'flex',
            region: 'KR',
        })

        expect(fetchMock).toHaveBeenCalledWith(
            `/api/summoner/${PUUID}?queue=flex&region=KR`,
            // Revalidating keeps a long browser TTL injected by the CDN from
            // freezing a stream overlay on old numbers.
            { cache: 'no-cache' }
        )
    })

    it('throws when the API answers with an error', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Response.json({}, { status: 503 }))
        )

        await expect(
            fetchSummonerByPuuid({ puuid: PUUID, queue: 'solo', region: 'KR' })
        ).rejects.toThrow()
    })
})
