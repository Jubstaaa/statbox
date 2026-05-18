import { getCache } from '@vercel/functions'
import type { RegionGroups, Regions } from 'twisted/dist/constants/regions'

import { lolApi, riotApi } from './riot.client'
import type { RankedQueue, Region, RiotData } from './riot.types'

const cache = getCache({ namespace: 'riot' })

const ACCOUNT_TTL_SECONDS = 60 * 60 * 24
const MATCH_TTL_SECONDS = 60 * 60 * 24 * 90
const SUMMONER_TTL_SECONDS = 60 * 60 * 6
const WIDGET_TTL_SECONDS = 60

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

export interface CachedMatchDetail {
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

function getAccountKey(puuid: string) {
    return `account:${puuid}`
}

function getMatchKey(matchId: string) {
    return `match:${matchId}`
}

function getSummonerKey(puuid: string, region: Region) {
    return `summoner:${region}:${puuid}`
}

function getWidgetKey(puuid: string, region: Region, queue: RankedQueue) {
    return `widget:${region}:${queue}:${puuid}`
}

export async function getCachedAccount(
    puuid: string,
    regionGroup: RegionGroups
): Promise<CachedAccount> {
    const cached = (await cache.get(getAccountKey(puuid))) as
        | CachedAccount
        | undefined
    if (cached) return cached

    const response = await riotApi.Account.getByPUUID(
        puuid,
        regionGroup as Parameters<typeof riotApi.Account.getByPUUID>[1]
    )

    const account: CachedAccount = {
        gameName: response.response.gameName,
        puuid: response.response.puuid,
        tagLine: response.response.tagLine,
    }

    await cache.set(getAccountKey(puuid), account, {
        tags: [`puuid:${puuid}`],
        ttl: ACCOUNT_TTL_SECONDS,
    })

    return account
}

export async function getCachedMatchDetail(
    matchId: string,
    regionGroup: RegionGroups
): Promise<CachedMatchDetail | null> {
    const cached = (await cache.get(getMatchKey(matchId))) as
        | CachedMatchDetail
        | undefined
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

    await cache.set(getMatchKey(matchId), detail, {
        tags: ['match'],
        ttl: MATCH_TTL_SECONDS,
    })

    return detail
}

export async function getCachedSummoner(
    puuid: string,
    region: Region,
    twistedRegion: Regions
): Promise<CachedSummoner> {
    const cached = (await cache.get(getSummonerKey(puuid, region))) as
        | CachedSummoner
        | undefined
    if (cached) return cached

    const response = await lolApi.Summoner.getByPUUID(puuid, twistedRegion)

    const summoner: CachedSummoner = {
        profileIconId: response.response.profileIconId,
        summonerLevel: response.response.summonerLevel,
    }

    await cache.set(getSummonerKey(puuid, region), summoner, {
        tags: [`puuid:${puuid}`],
        ttl: SUMMONER_TTL_SECONDS,
    })

    return summoner
}

export async function getCachedWidgetData(
    puuid: string,
    region: Region,
    queue: RankedQueue,
    fetcher: () => Promise<RiotData>
): Promise<RiotData> {
    const key = getWidgetKey(puuid, region, queue)
    const cached = (await cache.get(key)) as RiotData | undefined
    if (cached) return cached

    const data = await fetcher()

    await cache.set(key, data, {
        tags: [`puuid:${puuid}`, 'widget'],
        ttl: WIDGET_TTL_SECONDS,
    })

    return data
}
