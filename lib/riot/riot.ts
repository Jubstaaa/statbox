import { Constants, LolApi, RiotApi } from 'twisted'
import type {
    AccountAPIRegionGroups,
    RegionGroups,
    Regions,
} from 'twisted/dist/constants/regions'

import { kv } from '@/lib/kv'

import type { RankedQueue, Region } from './riot.types'
import type { MatchEntry, RiotData } from './riot.types'

const RIOT_API_KEY = process.env.RIOT_API_KEY!

const riotApi = new RiotApi({ key: RIOT_API_KEY, rateLimitRetry: true })
const lolApi = new LolApi({ key: RIOT_API_KEY, rateLimitRetry: true })

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
const ACCOUNT_CACHE_TTL_SECONDS = 60 * 60 * 24
const MATCH_CACHE_TTL_SECONDS = 60 * 60 * 24 * 90
const SUMMONER_CACHE_TTL_SECONDS = 60 * 60 * 6

interface CachedAccount {
    gameName: string
    puuid: string
    tagLine: string
}

interface CachedMatchParticipant {
    assists: number
    championId: number
    championName: string
    deaths: number
    gameEndedInEarlySurrender: boolean
    kills: number
    puuid: string
    win: boolean
}

interface CachedMatchDetail {
    gameDuration: number
    gameEndTimestamp: number
    matchId: string
    participants: CachedMatchParticipant[]
    queueId: number
}

interface CachedSummoner {
    profileIconId: number
    summonerLevel: number
}

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

function getMatchCacheKey(matchId: string) {
    return `riot:match:${matchId}`
}

function getAccountCacheKey(puuid: string) {
    return `riot:account:${puuid}`
}

function getSummonerCacheKey(puuid: string, region: Region) {
    return `riot:summoner:${region}:${puuid}`
}

async function getCachedAccount(
    puuid: string,
    regionGroup: RegionGroups
): Promise<CachedAccount> {
    const cached = await kv.get<CachedAccount>(getAccountCacheKey(puuid))
    if (cached) return cached

    const response = await riotApi.Account.getByPUUID(
        puuid,
        regionGroup as AccountAPIRegionGroups
    )

    const account: CachedAccount = {
        gameName: response.response.gameName,
        puuid: response.response.puuid,
        tagLine: response.response.tagLine,
    }

    await kv.set(getAccountCacheKey(puuid), account, {
        ex: ACCOUNT_CACHE_TTL_SECONDS,
    })

    return account
}

async function getCachedMatchDetail(
    matchId: string,
    regionGroup: RegionGroups
): Promise<CachedMatchDetail | null> {
    const cached = await kv.get<CachedMatchDetail>(getMatchCacheKey(matchId))
    if (cached) return cached

    const response = await lolApi.MatchV5.get(matchId, regionGroup).catch(
        () => null
    )
    if (!response) return null

    const detail: CachedMatchDetail = {
        gameDuration: response.response.info.gameDuration,
        gameEndTimestamp: response.response.info.gameEndTimestamp,
        matchId: response.response.metadata.matchId,
        participants: response.response.info.participants.map(participant => ({
            assists: participant.assists,
            championId: participant.championId,
            championName: participant.championName,
            deaths: participant.deaths,
            gameEndedInEarlySurrender: participant.gameEndedInEarlySurrender,
            kills: participant.kills,
            puuid: participant.puuid,
            win: participant.win,
        })),
        queueId: response.response.info.queueId,
    }

    await kv.set(getMatchCacheKey(matchId), detail, {
        ex: MATCH_CACHE_TTL_SECONDS,
    })

    return detail
}

async function getCachedSummoner(
    puuid: string,
    region: Region,
    twistedRegion: Regions
): Promise<CachedSummoner> {
    const cached = await kv.get<CachedSummoner>(
        getSummonerCacheKey(puuid, region)
    )
    if (cached) return cached

    const response = await lolApi.Summoner.getByPUUID(puuid, twistedRegion)

    const summoner: CachedSummoner = {
        profileIconId: response.response.profileIconId,
        summonerLevel: response.response.summonerLevel,
    }

    await kv.set(getSummonerCacheKey(puuid, region), summoner, {
        ex: SUMMONER_CACHE_TTL_SECONDS,
    })

    return summoner
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
    const expectedQueueId = queue === 'solo' ? 420 : 440

    const [account, summoner, matchIdsRes, leagueRes] = await Promise.all([
        getCachedAccount(puuid, regionGroup),
        getCachedSummoner(puuid, resolvedRegion, twistedRegion),
        lolApi.MatchV5.list(puuid, regionGroup, {
            count: 20,
            queue: queue === 'solo' ? 420 : 440,
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
                    match!.gameDuration < 300,
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
