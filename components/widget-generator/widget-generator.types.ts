import type {
    RankedQueue,
    Region,
    RiotData,
    WidgetStyle,
} from '@/lib/riot/riot.types'

export interface WidgetPreviewPanelProps {
    initialData: RiotData
    session: number | null
    style: WidgetStyle
}

export interface UrlBlockProps {
    action?: React.ReactNode
    description: string
    label: string
    url: string
}

export interface WidgetRoutePayload {
    puuid: string
    queue: RankedQueue
    region: Region
    sessionMode?: 'all-day' | 'from-time'
    sessionStartedAt?: number | null
    sessionTime?: string | null
    style: WidgetStyle
}

export interface LegacyWidgetRoutePayload {
    name: string
    region: Region
    style: WidgetStyle
    tag: string
}

export interface BuilderSettings {
    queue: RankedQueue
    region: Region
    sessionMode: 'all-day' | 'from-time'
    sessionTime: string | null
    style: WidgetStyle
}

export interface ResolveSummonerParams {
    name: string
    region: Region
    tag: string
}
