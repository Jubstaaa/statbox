import type { RankedQueue, Region, WidgetStyle } from '@/lib/riot/riot.types'

export const REGIONS: Region[] = [
    'BR',
    'EUNE',
    'EUW',
    'JP',
    'KR',
    'LAN',
    'LAS',
    'ME',
    'NA',
    'OCE',
    'RU',
    'SG',
    'TR',
    'TW',
    'VN',
]

export const STYLES: {
    id: WidgetStyle
    desc: string
    label: string
}[] = [
    { desc: 'Full card with match history', id: 'classic', label: 'Classic' },
    { desc: 'Horizontal strip', id: 'minimal', label: 'Minimal' },
    { desc: 'Small square, big numbers', id: 'compact', label: 'Compact' },
    {
        desc: 'Broadcast ribbon for top overlays',
        id: 'topbar',
        label: 'Topbar',
    },
]

export const VALID_REGIONS = new Set<Region>(REGIONS)

export const VALID_WIDGET_STYLES = new Set<WidgetStyle>([
    'classic',
    'minimal',
    'compact',
    'topbar',
])

export const VALID_QUEUES = new Set<RankedQueue>(['solo', 'flex'])

export const BUILDER_PUUID_STORAGE_KEY = 'statbox.builder.puuid'
export const BUILDER_SETTINGS_STORAGE_KEY = 'statbox.builder.settings'
