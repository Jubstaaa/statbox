import type { RegionGroups, Regions } from 'twisted/dist/constants/regions'

import { kv } from '@/lib/kv'

import { lolApi, riotApi } from './riot.client'
import type { Region } from './riot.types'

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

function getMatchCacheKey(matchId: string) {
    return `riot:match:${matchId}`
}

function getAccountCacheKey(puuid: string) {
    return `riot:account:${puuid}`
}

function getSummonerCacheKey(puuid: string, region: Region) {
    return `riot:summoner:${region}:${puuid}`
}

export async function getCachedAccount(
    puuid: string,
    regionGroup: RegionGroups
): Promise<CachedAccount> {
    const cached = await kv.get<CachedAccount>(getAccountCacheKey(puuid))
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

    await kv.set(getAccountCacheKey(puuid), account, {
        ex: ACCOUNT_CACHE_TTL_SECONDS,
    })

    return account
}

export async function getCachedMatchDetail(
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

export async function getCachedSummoner(
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
