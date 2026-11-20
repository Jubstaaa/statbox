import type { MatchEntry, RiotData, WidgetStyle } from '@/lib/riot/riot.types'

export interface ComputedData {
    avgAssists: number
    avgDeaths: number
    avgKills: number
    data: RiotData
    kdaRatio: string | null
    recent: MatchEntry[]
    session: number | null
    sessionGames: number
    sessionLosses: number
    sessionWins: number
    tierColor: string
    winRate: number | null
}

export interface WidgetFrameProps {
    style: WidgetStyle
}

export interface WidgetStyleDefinition {
    description: string
    height: string
    label: string
    style: WidgetStyle
    width: string
}
