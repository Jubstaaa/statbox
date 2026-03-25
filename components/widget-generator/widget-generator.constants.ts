import type { Region, WidgetStyle } from '@/lib/riot/riot.types'

export const REGIONS: Region[] = ['TR', 'EUW', 'EUNE', 'NA', 'KR']

export const STYLES: {
    id: WidgetStyle
    desc: string
    label: string
}[] = [
    {
        desc: 'Full card with match history',
        id: 'classic',
        label: 'Classic',
    },
    {
        desc: 'Horizontal strip',
        id: 'minimal',
        label: 'Minimal',
    },
    {
        desc: 'Small square, big numbers',
        id: 'compact',
        label: 'Compact',
    },
]
