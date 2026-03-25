export type Region =
    | 'BR'
    | 'EUNE'
    | 'EUW'
    | 'JP'
    | 'KR'
    | 'LAN'
    | 'LAS'
    | 'ME'
    | 'NA'
    | 'OCE'
    | 'RU'
    | 'SG'
    | 'TR'
    | 'TW'
    | 'VN'
export type RankedQueue = 'solo' | 'flex'
export type WidgetStyle = 'classic' | 'minimal' | 'compact' | 'topbar'

export interface MatchEntry {
    assists: number
    champion: string
    championId: number
    deaths: number
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
