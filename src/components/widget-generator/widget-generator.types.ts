import type {
    RankedQueue,
    Region,
    RiotData,
    WidgetStyle,
} from '@/lib/riot/riot.types'

export type SessionMode = 'all-day' | 'from-time'

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

export interface WidgetUrls {
    widgetUrl: string
}

export interface ResolveSummonerParams {
    name: string
    region: Region
    tag: string
}

export interface BuilderSettings {
    queue: RankedQueue
    region: Region
    sessionMode: SessionMode
    sessionTime: string | null
    style: WidgetStyle
}

export interface WidgetRoutePayload extends BuilderSettings {
    puuid: RiotData['puuid']
}
