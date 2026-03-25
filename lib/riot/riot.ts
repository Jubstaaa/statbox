import { Constants, LolApi, RiotApi } from 'twisted'
import type {
    AccountAPIRegionGroups,
    RegionGroups,
    Regions,
} from 'twisted/dist/constants/regions'

import type { RankedQueue, Region } from './riot.types'
import type { MatchEntry, RiotData } from './riot.types'

const RIOT_API_KEY = process.env.RIOT_API_KEY!

const riotApi = new RiotApi({ key: RIOT_API_KEY, rateLimitRetry: true })
const lolApi = new LolApi({ key: RIOT_API_KEY, rateLimitRetry: true })

const { RegionGroups: RG, Regions: R } = Constants

const REGION_MAP: Record<Region, Regions> = {
    EUNE: R.EU_EAST,
    EUW: R.EU_WEST,
    KR: R.KOREA,
    NA: R.AMERICA_NORTH,
    TR: R.TURKEY,
}

const REGION_GROUP_MAP: Record<Region, RegionGroups> = {
    EUNE: RG.EUROPE,
    EUW: RG.EUROPE,
    KR: RG.ASIA,
    NA: RG.AMERICAS,
    TR: RG.EUROPE,
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

export async function fetchRiotData(
    name: string,
    tag: string,
    region: Region,
    queue: RankedQueue = 'solo'
): Promise<RiotData> {
    const puuid = await resolvePuuidByRiotId(name, tag, region)

    return fetchRiotDataByPuuid(puuid, region, queue)
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

    const [accountRes, summonerRes, matchIdsRes, leagueRes] = await Promise.all(
        [
            riotApi.Account.getByPUUID(
                puuid,
                regionGroup as AccountAPIRegionGroups
            ),
            lolApi.Summoner.getByPUUID(puuid, twistedRegion),
            lolApi.MatchV5.list(puuid, regionGroup, {
                count: 20,
                queue: queue === 'solo' ? 420 : 440,
            }).catch(() => ({ response: [] })),
            lolApi.League.byPUUID(puuid, twistedRegion).catch(() => ({
                response: [],
            })),
        ]
    )

    const account = accountRes.response
    const rankedQueue = leagueRes.response.find(
        l =>
            l.queueType ===
            (queue === 'solo' ? 'RANKED_SOLO_5x5' : 'RANKED_FLEX_SR')
    )

    const matchDetails = await Promise.all(
        matchIdsRes.response.map(id =>
            lolApi.MatchV5.get(id, regionGroup).catch(() => null)
        )
    )

    const matchHistory: MatchEntry[] = matchDetails
        .filter(Boolean)
        .map(match => {
            const info = match!.response.info
            if (info.queueId !== expectedQueueId) return null
            const participant = info.participants.find(p => p.puuid === puuid)
            if (!participant) return null
            return {
                assists: participant.assists,
                champion: participant.championName,
                championId: participant.championId,
                deaths: participant.deaths,
                kills: participant.kills,
                matchId: match!.response.metadata.matchId,
                timestamp: new Date(info.gameEndTimestamp).toISOString(),
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
        profileIconId: summonerRes.response.profileIconId,
        puuid,
        rank: rankedQueue?.rank ?? '',
        summonerLevel: summonerRes.response.summonerLevel,
        tagLine: account.tagLine,
        tier: rankedQueue?.tier ?? 'UNRANKED',
        wins: rankedQueue?.wins ?? 0,
    }
}
