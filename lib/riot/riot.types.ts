import type { RANKED_QUEUES, REGIONS, WIDGET_STYLES } from './riot.constants'

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
