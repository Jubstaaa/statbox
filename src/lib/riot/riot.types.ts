import type { Constants } from 'twisted'

import type { RANKED_QUEUES, REGIONS, WIDGET_STYLES } from './riot.constants'

// twisted exposes its region enums only as values on Constants, so the types
// are derived from them rather than imported from a dist path.
export type TwistedRegion =
    (typeof Constants.Regions)[keyof typeof Constants.Regions]
export type TwistedRegionGroup =
    (typeof Constants.RegionGroups)[keyof typeof Constants.RegionGroups]
export type TwistedAccountRegionGroup = ReturnType<
    typeof Constants.regionToRegionGroupForAccountAPI
>

export type Region = (typeof REGIONS)[number]
export type RankedQueue = (typeof RANKED_QUEUES)[number]
export type WidgetStyle = (typeof WIDGET_STYLES)[number]

export interface MatchEntry {
    assists: number
    champion: string
    championId: number
    deaths: number
    isRemake: boolean
    kills: number
    matchId: string
    timestamp: string
    win: boolean
}

export interface RiotData {
    gameName: string
    hotStreak: boolean
    leaguePoints: number
    losses: number
    matchHistory: MatchEntry[]
    profileIconId: number
    puuid: string
    rank: string
    summonerLevel: number
    tagLine: string
    tier: string
    wins: number
}
