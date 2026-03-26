import type { MatchEntry, RiotData, WidgetStyle } from '@/lib/riot/riot.types'

export type WidgetData = RiotData
export type WidgetMatch = MatchEntry

export interface WidgetProps {
    data: WidgetData | null
    isError?: boolean
    isLoading?: boolean
    session: number | null
    style: WidgetStyle
}

export interface ComputedData {
    avgAssists: number
    avgDeaths: number
    avgKills: number
    data: WidgetData
    kdaRatio: string | null
    recent: WidgetMatch[]
    session: number | null
    sessionGames: number
    sessionLosses: number
    sessionWins: number
    tierColor: string
    winRate: number | null
}

export interface KdaLineProps {
    assists: string | number
    deaths: string | number
    kdaRatio?: string | null
    kills: string | number
}

export interface ScoreBoxProps {
    color: string
    label: string
    value: string
}

export interface StripStatProps {
    color: string
    label: string
    value: string
}

export interface SectionLabelProps {
    children: React.ReactNode
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
