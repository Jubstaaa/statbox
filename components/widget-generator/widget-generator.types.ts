import type { RiotData, WidgetStyle } from '@/lib/riot/riot.types'

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
