import Spinner from '@/components/spinner/spinner'
import { cn } from '@/lib/cn'

import type { WidgetFrameProps } from './widget.types'
import { getWidgetHeight, getWidgetWidth } from './widget.utils'

export default function WidgetLoader({ style }: WidgetFrameProps) {
    const width = getWidgetWidth(style)
    const height = getWidgetHeight(style)

    return (
        <div
            style={{ height, width }}
            className={cn(
                'border-hover border bg-[linear-gradient(180deg,rgba(16,32,51,0.95)_0%,rgba(7,17,31,0.98)_100%)]',
                style === 'topbar'
                    ? 'flex items-center justify-center gap-2 overflow-hidden rounded-xl border-white/10 px-3'
                    : 'flex flex-col items-center justify-center gap-2.5 rounded-[18px] p-3.5'
            )}>
            <Spinner
                className={cn(
                    'shrink-0',
                    style === 'topbar' ? 'h-4 w-4' : 'h-8 w-8'
                )}
            />
            <div
                className={cn(
                    'text-text-muted font-bold tracking-[0.08em] uppercase',
                    style === 'topbar' ? 'text-[10px]' : 'text-[11px]'
                )}>
                Loading widget
            </div>
        </div>
    )
}
