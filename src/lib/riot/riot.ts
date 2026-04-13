import { Constants } from 'twisted'
import type {
    AccountAPIRegionGroups,
    RegionGroups,
    Regions,
} from 'twisted/dist/constants/regions'

import {
    getCachedAccount,
    getCachedMatchDetail,
    getCachedSummoner,
} from './riot.cache'
import { lolApi, riotApi } from './riot.client'
import {
    MATCH_FETCH_COUNT,
    QUEUE_ID_FLEX,
    QUEUE_ID_SOLO,
    REMAKE_DURATION_THRESHOLD_SECONDS,
} from './riot.constants'
import type { MatchEntry, RiotData } from './riot.types'
import type { RankedQueue, Region } from './riot.types'

const { RegionGroups: RG, Regions: R } = Constants

const REGION_MAP: Record<Region, Regions> = {
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

const REGION_GROUP_MAP: Record<Region, RegionGroups> = {
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

const puuidRegionCache = new Map<string, Region>()

export async function resolvePuuidByRiotId(
    name: string,
    tag: string,
    region: Region
) {
    const regionGroup = REGION_GROUP_MAP[region]
    const { response: account } = await riotApi.Account.getByRiotId(
        name,
        tag,
        regionGroup as AccountAPIRegionGroups
    )

    puuidRegionCache.set(account.puuid, region)

    return account.puuid
}

async function resolveRegionByPuuid(puuid: string) {
    return puuidRegionCache.get(puuid) ?? null
}

export async function fetchRiotDataByPuuid(
    puuid: string,
    region?: Region,
    queue: RankedQueue = 'solo'
): Promise<RiotData> {
    const resolvedRegion = region ?? (await resolveRegionByPuuid(puuid))
    if (!resolvedRegion) {
        throw new Error('Summoner region not found')
    }
    const twistedRegion = REGION_MAP[resolvedRegion]
    const regionGroup = REGION_GROUP_MAP[resolvedRegion]
    const expectedQueueId = queue === 'solo' ? QUEUE_ID_SOLO : QUEUE_ID_FLEX

    const [account, summoner, matchIdsRes, leagueRes] = await Promise.all([
        getCachedAccount(puuid, regionGroup),
        getCachedSummoner(puuid, resolvedRegion, twistedRegion),
        lolApi.MatchV5.list(puuid, regionGroup, {
            count: MATCH_FETCH_COUNT,
            queue: queue === 'solo' ? QUEUE_ID_SOLO : QUEUE_ID_FLEX,
        }).catch(() => ({ response: [] })),
        lolApi.League.byPUUID(puuid, twistedRegion).catch(() => ({
            response: [],
        })),
    ])

    const rankedQueue = leagueRes.response.find(
        l =>
            l.queueType ===
            (queue === 'solo' ? 'RANKED_SOLO_5x5' : 'RANKED_FLEX_SR')
    )

    const matchDetails = await Promise.all(
        matchIdsRes.response.map(matchId =>
            getCachedMatchDetail(matchId, regionGroup)
        )
    )

    const matchHistory: MatchEntry[] = matchDetails
        .filter(Boolean)
        .map(match => {
            if (match!.queueId !== expectedQueueId) return null
            const participant = match!.participants.find(p => p.puuid === puuid)
            if (!participant) return null

            return {
                assists: participant.assists,
                champion: participant.championName,
                championId: participant.championId,
                deaths: participant.deaths,
                isRemake:
                    participant.gameEndedInEarlySurrender ||
                    match!.gameDuration < REMAKE_DURATION_THRESHOLD_SECONDS,
                kills: participant.kills,
                matchId: match!.matchId,
                timestamp: new Date(match!.gameEndTimestamp).toISOString(),
                win: participant.win,
            }
        })
        .filter(Boolean) as MatchEntry[]

    return {
        gameName: account.gameName,
        hotStreak: rankedQueue?.hotStreak ?? false,
        leaguePoints: rankedQueue?.leaguePoints ?? 0,
        losses: rankedQueue?.losses ?? 0,
        matchHistory,
        profileIconId: summoner.profileIconId,
        puuid,
        rank: rankedQueue?.rank ?? '',
        summonerLevel: summoner.summonerLevel,
        tagLine: account.tagLine,
        tier: rankedQueue?.tier ?? 'UNRANKED',
        wins: rankedQueue?.wins ?? 0,
    }
}
