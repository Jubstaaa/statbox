import type { WidgetStyle } from '@/lib/riot/riot.types'

export function getWidgetWidth(style: WidgetStyle) {
    return style === 'minimal'
        ? '480px'
        : style === 'compact'
          ? '260px'
          : '300px'
}

export function getWidgetHeight(style: WidgetStyle) {
    return style === 'minimal'
        ? '72px'
        : style === 'compact'
          ? '250px'
          : '380px'
}
