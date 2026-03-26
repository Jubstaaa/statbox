import type { ChangeEvent } from 'react'

import type { WidgetUrls } from '@/components/widget-generator/widget-generator.types'
import type { RankedQueue, RiotData, WidgetStyle } from '@/lib/riot/riot.types'

export interface CreateErrorProps {
    error?: Error & { digest?: string }
    reset?: () => void
}

export interface CreatePageState {
    createStyleSelectHandler: (value: WidgetStyle) => () => void
    handleAllDaySession: () => void
    handleChangeAccount: () => void
    handleFlexQueue: () => void
    handleFromTimeSession: () => void
    handleSessionTimeChange: (event: ChangeEvent<HTMLInputElement>) => void
    handleSoloQueue: () => void
    isError: boolean
    isLoading: boolean
    maxSessionTime: string
    previewSession: number | null
    puuid: string | null
    queue: RankedQueue
    sessionMode: 'all-day' | 'from-time'
    sessionTime: string
    storageReady: boolean
    style: WidgetStyle
    summonerData: RiotData | null
    tierColor: string
    urls: WidgetUrls | null
}
