import type { WidgetStyle } from '@/lib/riot/riot.types'

export function getWidgetWidth(style: WidgetStyle) {
    return style === 'topbar'
        ? '460px'
        : style === 'minimal'
          ? '480px'
          : style === 'compact'
            ? '260px'
            : '300px'
}

export function getWidgetHeight(style: WidgetStyle) {
    return style === 'topbar'
        ? '40px'
        : style === 'minimal'
          ? '72px'
          : style === 'compact'
            ? '250px'
            : '380px'
}

export function formatTierRank(tier: string, rank: string) {
    return tier === 'UNRANKED' ? 'Unranked' : `${tier} ${rank}`
}
