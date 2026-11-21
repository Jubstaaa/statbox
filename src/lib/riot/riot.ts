import { Constants } from 'twisted'
import { z } from 'zod'

import { cachedLoader } from './riot.cache'
import { lolApi, riotApi } from './riot.client'
import {
    MATCH_FETCH_COUNT,
    QUEUE_ID_FLEX,
    QUEUE_ID_SOLO,
    REMAKE_DURATION_THRESHOLD_SECONDS,
} from './riot.constants'
import { isRiotNotFound } from './riot.errors'
import { callRiot } from './riot.gate'
import { riotDataSchema } from './riot.schemas'
import type {
    MatchEntry,
    RankedQueue,
    Region,
    RiotData,
    TwistedRegion,
    TwistedRegionGroup,
} from './riot.types'

const { RegionGroups: RG, Regions: R } = Constants

const REGION_MAP: Record<Region, TwistedRegion> = {
    BR: R.BRAZIL,
    EUNE: R.EU_EAST,
    EUW: R.EU_WEST,
    JP: R.JAPAN,
    KR: R.KOREA,
    LAN: R.LAT_NORTH,
    LAS: R.LAT_SOUTH,
    ME: R.MIDDLE_EAST,
    NA: R.AMERICA_NORTH,
    OCE: R.OCEANIA,
    RU: R.RUSSIA,
    SG: R.SINGAPORE,
    TR: R.TURKEY,
    TW: R.TAIWAN,
    VN: R.VIETNAM,
}

const REGION_GROUP_MAP: Record<Region, TwistedRegionGroup> = {
    BR: RG.AMERICAS,
    EUNE: RG.EUROPE,
    EUW: RG.EUROPE,
    JP: RG.ASIA,
    KR: RG.ASIA,
    LAN: RG.AMERICAS,
    LAS: RG.AMERICAS,
    ME: RG.EUROPE,
    NA: RG.AMERICAS,
    OCE: RG.SEA,
    RU: RG.EUROPE,
    SG: RG.SEA,
    TR: RG.EUROPE,
    TW: RG.SEA,
    VN: RG.SEA,
}

const QUEUE = {
    flex: { id: QUEUE_ID_FLEX, leagueType: 'RANKED_FLEX_SR' },
    solo: { id: QUEUE_ID_SOLO, leagueType: 'RANKED_SOLO_5x5' },
} as const satisfies Record<RankedQueue, { id: number; leagueType: string }>

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function accountRoute(region: Region) {
    return Constants.regionToRegionGroupForAccountAPI(REGION_MAP[region])
}

const accountSchema = z.object({ gameName: z.string(), tagLine: z.string() })

const getAccount = cachedLoader({
    key: ([puuid]) => `account:${puuid}`,
    load: async (puuid: string, region: Region) => {
        const route = accountRoute(region)
        const { response } = await callRiot(route, () =>
            riotApi.Account.getByPUUID(puuid, route)
        )

        return { gameName: response.gameName, tagLine: response.tagLine }
    },
    schema: accountSchema,
    ttlSeconds: DAY,
})

const summonerSchema = z.object({
    profileIconId: z.number(),
    summonerLevel: z.number(),
})

const getSummoner = cachedLoader({
    key: ([puuid, region]) => `summoner:${region}:${puuid}`,
    load: async (puuid: string, region: Region) => {
        const platform = REGION_MAP[region]
        const { response } = await callRiot(platform, () =>
            lolApi.Summoner.getByPUUID(puuid, platform)
        )

        return {
            profileIconId: response.profileIconId,
            summonerLevel: response.summonerLevel,
        }
    },
    schema: summonerSchema,
    ttlSeconds: 6 * HOUR,
})

const matchDetailSchema = z
    .object({
        gameDuration: z.number(),
        gameEndTimestamp: z.number(),
        matchId: z.string(),
        participants: z.array(
            z.object({
                assists: z.number(),
                championId: z.number(),
                championName: z.string(),
                deaths: z.number(),
                gameEndedInEarlySurrender: z.boolean(),
                kills: z.number(),
                puuid: z.string(),
                win: z.boolean(),
            })
        ),
        queueId: z.number(),
    })
    .nullable()

const getMatchDetail = cachedLoader({
    key: ([matchId]) => `match:${matchId}`,
    load: async (matchId: string, regionGroup: TwistedRegionGroup) => {
        try {
            const { response } = await callRiot(regionGroup, () =>
                lolApi.MatchV5.get(matchId, regionGroup)
            )
            const { info, metadata } = response

            return {
                gameDuration: info.gameDuration,
                gameEndTimestamp: info.gameEndTimestamp,
                matchId: metadata.matchId,
                participants: info.participants.map(participant => ({
                    assists: participant.assists,
                    championId: participant.championId,
                    championName: participant.championName,
                    deaths: participant.deaths,
                    gameEndedInEarlySurrender:
                        participant.gameEndedInEarlySurrender,
                    kills: participant.kills,
                    puuid: participant.puuid,
                    win: participant.win,
                })),
                queueId: info.queueId,
            }
        } catch (error) {
            // A match id from the list that Riot no longer serves is skipped;
            // anything else (429, 5xx) must fail the widget, not shrink it.
            if (isRiotNotFound(error)) return null
            throw error
        }
    },
    schema: matchDetailSchema,
    // A finished match never changes.
    ttlSeconds: detail => (detail ? 90 * DAY : DAY),
})

type MatchDetail = NonNullable<z.infer<typeof matchDetailSchema>>

function toMatchEntry(
    match: MatchDetail | null,
    puuid: string,
    queue: RankedQueue
): MatchEntry[] {
    if (match?.queueId !== QUEUE[queue].id) return []

    const participant = match.participants.find(p => p.puuid === puuid)
    if (!participant) return []

    return [
        {
            assists: participant.assists,
            champion: participant.championName,
            championId: participant.championId,
            deaths: participant.deaths,
            isRemake:
                participant.gameEndedInEarlySurrender ||
                match.gameDuration < REMAKE_DURATION_THRESHOLD_SECONDS,
            kills: participant.kills,
            matchId: match.matchId,
            timestamp: new Date(match.gameEndTimestamp).toISOString(),
            win: participant.win,
        },
    ]
}

async function buildRiotData(
    puuid: string,
    region: Region,
    queue: RankedQueue
): Promise<RiotData> {
    const platform = REGION_MAP[region]
    const regionGroup = REGION_GROUP_MAP[region]

    const [account, summoner, matchIds, leagues] = await Promise.all([
        getAccount(puuid, region),
        getSummoner(puuid, region),
        callRiot(regionGroup, () =>
            lolApi.MatchV5.list(puuid, regionGroup, {
                count: MATCH_FETCH_COUNT,
                queue: QUEUE[queue].id,
            })
        ),
        callRiot(platform, () => lolApi.League.byPUUID(puuid, platform)),
    ])

    const league = leagues.response.find(
        entry => entry.queueType === QUEUE[queue].leagueType
    )
    const matches = await Promise.all(
        matchIds.response.map(matchId => getMatchDetail(matchId, regionGroup))
    )

    return {
        gameName: account.gameName,
        hotStreak: league?.hotStreak ?? false,
        leaguePoints: league?.leaguePoints ?? 0,
        losses: league?.losses ?? 0,
        matchHistory: matches.flatMap(match =>
            toMatchEntry(match, puuid, queue)
        ),
        profileIconId: summoner.profileIconId,
        puuid,
        rank: league?.rank ?? '',
        summonerLevel: summoner.summonerLevel,
        tagLine: account.tagLine,
        tier: league?.tier ?? 'UNRANKED',
        wins: league?.wins ?? 0,
    }
}

export const fetchRiotDataByPuuid = cachedLoader({
    key: ([puuid, region, queue]) => `widget:${region}:${queue}:${puuid}`,
    load: buildRiotData,
    schema: riotDataSchema,
    ttlSeconds: 5 * MINUTE,
})

const resolvedRiotIdSchema = z.object({ puuid: z.string().nullable() })

const resolveRiotId = cachedLoader({
    // Riot IDs are case-insensitive, so every spelling shares one entry.
    key: ([name, tag, region]) =>
        `riot-id:${accountRoute(region)}:${name.toLowerCase()}#${tag.toLowerCase()}`,
    load: async (name: string, tag: string, region: Region) => {
        const route = accountRoute(region)

        try {
            const { response } = await callRiot(route, () =>
                riotApi.Account.getByRiotId(name, tag, route)
            )

            return { puuid: response.puuid }
        } catch (error) {
            if (isRiotNotFound(error)) return { puuid: null }
            throw error
        }
    },
    schema: resolvedRiotIdSchema,
    // Misses are remembered briefly so repeated typos or scans cost one call,
    // but a freshly renamed account is found again within minutes.
    ttlSeconds: ({ puuid }) => (puuid ? DAY : 10 * MINUTE),
})

export async function resolvePuuidByRiotId(
    name: string,
    tag: string,
    region: Region
): Promise<null | string> {
    const { puuid } = await resolveRiotId(name, tag, region)

    return puuid
}
