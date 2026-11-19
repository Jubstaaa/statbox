import { GenericError, RateLimitError } from 'twisted'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type RateLimits = ConstructorParameters<typeof RateLimitError>[0]

const PUUID = 'p'.repeat(78)

const store = new Map<string, unknown>()

vi.mock('@/lib/cache', () => ({
    getCache: () => ({
        get: async (key: string) => store.get(key),
        set: async (key: string, value: unknown) => {
            store.set(key, structuredClone(value))
        },
    }),
}))

const api = vi.hoisted(() => ({
    getAccountByPuuid: vi.fn(),
    getAccountByRiotId: vi.fn(),
    getLeague: vi.fn(),
    getMatch: vi.fn(),
    getSummoner: vi.fn(),
    listMatches: vi.fn(),
}))

vi.mock('./riot.client', () => ({
    lolApi: {
        League: { byPUUID: api.getLeague },
        MatchV5: { get: api.getMatch, list: api.listMatches },
        Summoner: { getByPUUID: api.getSummoner },
    },
    riotApi: {
        Account: {
            getByPUUID: api.getAccountByPuuid,
            getByRiotId: api.getAccountByRiotId,
        },
    },
}))

function notFound() {
    return new GenericError({} as RateLimits, {
        message: 'Not found',
        name: 'HttpError',
        response: { status: 404 },
    })
}

function match(
    matchId: string,
    overrides: {
        gameDuration?: number
        gameEndedInEarlySurrender?: boolean
        queueId?: number
        win?: boolean
    } = {}
) {
    return {
        response: {
            info: {
                gameDuration: overrides.gameDuration ?? 1800,
                gameEndTimestamp: Date.UTC(2026, 10, 19, 12),
                participants: [
                    {
                        assists: 7,
                        championId: 103,
                        championName: 'Ahri',
                        deaths: 2,
                        gameEndedInEarlySurrender:
                            overrides.gameEndedInEarlySurrender ?? false,
                        kills: 5,
                        puuid: PUUID,
                        win: overrides.win ?? true,
                    },
                ],
                queueId: overrides.queueId ?? 420,
            },
            metadata: { matchId },
        },
    }
}

beforeEach(() => {
    store.clear()
    vi.resetModules()
    api.getAccountByPuuid.mockResolvedValue({
        response: { gameName: 'Faker', puuid: PUUID, tagLine: 'KR1' },
    })
    api.getSummoner.mockResolvedValue({
        response: { profileIconId: 6, summonerLevel: 700 },
    })
    api.getLeague.mockResolvedValue({
        response: [
            {
                hotStreak: true,
                leaguePoints: 812,
                losses: 90,
                queueType: 'RANKED_SOLO_5x5',
                rank: 'I',
                tier: 'CHALLENGER',
                wins: 120,
            },
        ],
    })
    api.listMatches.mockResolvedValue({ response: ['KR_1'] })
    api.getMatch.mockImplementation(async (id: string) => match(id))
})

afterEach(() => {
    vi.clearAllMocks()
})

async function loadRiot() {
    return import('./riot')
}

describe('fetchRiotDataByPuuid', () => {
    it('maps account, summoner, league and matches into widget data', async () => {
        const { fetchRiotDataByPuuid } = await loadRiot()

        const data = await fetchRiotDataByPuuid(PUUID, 'KR', 'solo')

        expect(data).toMatchObject({
            gameName: 'Faker',
            hotStreak: true,
            leaguePoints: 812,
            losses: 90,
            profileIconId: 6,
            rank: 'I',
            summonerLevel: 700,
            tagLine: 'KR1',
            tier: 'CHALLENGER',
            wins: 120,
        })
        expect(data.matchHistory).toEqual([
            {
                assists: 7,
                champion: 'Ahri',
                championId: 103,
                deaths: 2,
                isRemake: false,
                kills: 5,
                matchId: 'KR_1',
                timestamp: '2026-11-19T12:00:00.000Z',
                win: true,
            },
        ])
    })

    it('marks early surrenders and very short games as remakes', async () => {
        api.listMatches.mockResolvedValue({ response: ['KR_1', 'KR_2'] })
        api.getMatch.mockImplementation(async (id: string) =>
            id === 'KR_1'
                ? match(id, { gameEndedInEarlySurrender: true })
                : match(id, { gameDuration: 200 })
        )
        const { fetchRiotDataByPuuid } = await loadRiot()

        const data = await fetchRiotDataByPuuid(PUUID, 'KR', 'solo')

        expect(data.matchHistory.map(entry => entry.isRemake)).toEqual([
            true,
            true,
        ])
    })

    it('drops matches from another queue and matches that vanished', async () => {
        api.listMatches.mockResolvedValue({
            response: ['KR_1', 'KR_FLEX', 'KR_GONE'],
        })
        api.getMatch.mockImplementation(async (id: string) => {
            if (id === 'KR_GONE') throw notFound()

            return match(id, { queueId: id === 'KR_FLEX' ? 440 : 420 })
        })
        const { fetchRiotDataByPuuid } = await loadRiot()

        const data = await fetchRiotDataByPuuid(PUUID, 'KR', 'solo')

        expect(data.matchHistory.map(entry => entry.matchId)).toEqual(['KR_1'])
    })

    it('reads the flex entry for the flex queue', async () => {
        api.getLeague.mockResolvedValue({
            response: [
                { queueType: 'RANKED_SOLO_5x5', tier: 'CHALLENGER' },
                {
                    hotStreak: false,
                    leaguePoints: 10,
                    losses: 1,
                    queueType: 'RANKED_FLEX_SR',
                    rank: 'IV',
                    tier: 'GOLD',
                    wins: 2,
                },
            ],
        })
        const { fetchRiotDataByPuuid } = await loadRiot()

        const data = await fetchRiotDataByPuuid(PUUID, 'KR', 'flex')

        expect(data.tier).toBe('GOLD')
        expect(api.listMatches).toHaveBeenCalledWith(PUUID, 'ASIA', {
            count: 20,
            queue: 440,
        })
    })

    it('reports an unranked player as UNRANKED', async () => {
        api.getLeague.mockResolvedValue({ response: [] })
        const { fetchRiotDataByPuuid } = await loadRiot()

        const data = await fetchRiotDataByPuuid(PUUID, 'KR', 'solo')

        expect(data.tier).toBe('UNRANKED')
        expect(data.leaguePoints).toBe(0)
    })

    it('fails instead of caching UNRANKED when the league call is rate limited', async () => {
        api.getLeague.mockRejectedValueOnce(
            new RateLimitError({ RetryAfter: 5 } as RateLimits)
        )
        const { fetchRiotDataByPuuid } = await loadRiot()

        await expect(
            fetchRiotDataByPuuid(PUUID, 'KR', 'solo')
        ).rejects.toMatchObject({
            name: 'RiotRateLimitedError',
            retryAfterSeconds: 5,
        })
        expect([...store.keys()].some(key => key.includes('widget'))).toBe(
            false
        )
    })

    it('fails instead of caching an empty history when the match list errors', async () => {
        api.listMatches.mockRejectedValueOnce(new Error('upstream 500'))
        const { fetchRiotDataByPuuid } = await loadRiot()

        await expect(
            fetchRiotDataByPuuid(PUUID, 'EUW', 'solo')
        ).rejects.toThrow('upstream 500')
        expect([...store.keys()].some(key => key.includes('widget'))).toBe(
            false
        )
    })

    it('serves a repeat request from the cache', async () => {
        const { fetchRiotDataByPuuid } = await loadRiot()

        await fetchRiotDataByPuuid(PUUID, 'KR', 'solo')
        await fetchRiotDataByPuuid(PUUID, 'KR', 'solo')

        expect(api.getLeague).toHaveBeenCalledTimes(1)
    })

    it('collapses concurrent requests for the same widget into one upstream fetch', async () => {
        const { fetchRiotDataByPuuid } = await loadRiot()

        await Promise.all(
            Array.from({ length: 5 }, () =>
                fetchRiotDataByPuuid(PUUID, 'KR', 'solo')
            )
        )

        expect(api.getLeague).toHaveBeenCalledTimes(1)
        expect(api.listMatches).toHaveBeenCalledTimes(1)
    })

    it('refetches when a cached entry no longer matches the expected shape', async () => {
        const { fetchRiotDataByPuuid } = await loadRiot()
        await fetchRiotDataByPuuid(PUUID, 'KR', 'solo')
        for (const key of store.keys()) store.set(key, { stale: true })

        const data = await fetchRiotDataByPuuid(PUUID, 'KR', 'solo')

        expect(data.gameName).toBe('Faker')
        expect(api.getLeague).toHaveBeenCalledTimes(2)
    })
})

describe('resolvePuuidByRiotId', () => {
    it('resolves a Riot ID to its PUUID through the region group', async () => {
        api.getAccountByRiotId.mockResolvedValue({
            response: {
                gameName: 'Hide on bush',
                puuid: PUUID,
                tagLine: 'KR1',
            },
        })
        const { resolvePuuidByRiotId } = await loadRiot()

        await expect(
            resolvePuuidByRiotId('Hide on bush', 'KR1', 'KR')
        ).resolves.toBe(PUUID)
        expect(api.getAccountByRiotId).toHaveBeenCalledWith(
            'Hide on bush',
            'KR1',
            'ASIA'
        )
    })

    it('routes SEA platforms through ASIA, the only account-v1 route for them', async () => {
        api.getAccountByRiotId.mockResolvedValue({
            response: { gameName: 'x', puuid: PUUID, tagLine: 'OCE' },
        })
        const { resolvePuuidByRiotId } = await loadRiot()

        await resolvePuuidByRiotId('x', 'OCE', 'OCE')

        expect(api.getAccountByRiotId).toHaveBeenCalledWith('x', 'OCE', 'ASIA')
    })

    it('caches the answer regardless of the Riot ID letter case', async () => {
        api.getAccountByRiotId.mockResolvedValue({
            response: {
                gameName: 'Hide on bush',
                puuid: PUUID,
                tagLine: 'KR1',
            },
        })
        const { resolvePuuidByRiotId } = await loadRiot()

        await resolvePuuidByRiotId('Hide on bush', 'KR1', 'KR')
        await resolvePuuidByRiotId('hide ON bush', 'kr1', 'KR')

        expect(api.getAccountByRiotId).toHaveBeenCalledTimes(1)
    })

    it('returns null for an unknown Riot ID and remembers the miss', async () => {
        api.getAccountByRiotId.mockRejectedValue(notFound())
        const { resolvePuuidByRiotId } = await loadRiot()

        await expect(
            resolvePuuidByRiotId('nobody', 'NA1', 'NA')
        ).resolves.toBeNull()
        await expect(
            resolvePuuidByRiotId('nobody', 'NA1', 'NA')
        ).resolves.toBeNull()
        expect(api.getAccountByRiotId).toHaveBeenCalledTimes(1)
    })

    it('propagates a rate limit instead of reporting not found', async () => {
        api.getAccountByRiotId.mockRejectedValue(
            new RateLimitError({ RetryAfter: 5 } as RateLimits)
        )
        const { resolvePuuidByRiotId } = await loadRiot()

        await expect(
            resolvePuuidByRiotId('someone', 'TR1', 'TR')
        ).rejects.toMatchObject({
            name: 'RiotRateLimitedError',
            retryAfterSeconds: 5,
        })
    })
})
