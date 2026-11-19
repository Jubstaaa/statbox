import { cn } from '@/lib/cn'

import type { WidgetFrameProps } from './widget.types'
import { getWidgetHeight, getWidgetWidth } from './widget.utils'

export default function WidgetError({ style }: WidgetFrameProps) {
    const width = getWidgetWidth(style)
    const height = getWidgetHeight(style)
    return (
        <div
            style={{ height, width }}
            className={cn(
                'border-loss/30 border bg-[linear-gradient(180deg,rgba(16,32,51,0.96)_0%,rgba(7,17,31,0.98)_100%)]',
                style === 'topbar'
                    ? 'flex items-center justify-center overflow-hidden rounded-xl px-3 text-center'
                    : 'rounded-[18px] p-3.5 text-center'
            )}>
            <div
                className={cn(
                    'text-loss font-bold',
                    style === 'topbar' ? 'text-[10px]' : 'text-[11px]'
                )}>
                Failed to load summoner data.
            </div>
        </div>
    )
}
