import { cn } from '@/lib/cn'

import type { WidgetFrameProps } from './widget.types'

import { getWidgetHeight, getWidgetWidth } from './widget.utils'

interface WidgetErrorProps extends WidgetFrameProps {
    message: string
}

export default function WidgetError({ message, style }: WidgetErrorProps) {
    const width = getWidgetWidth(style)
    const height = getWidgetHeight(style)
    return (
        <div
            className={cn(
                'border-loss/30 border bg-[linear-gradient(180deg,rgba(16,32,51,0.96)_0%,rgba(7,17,31,0.98)_100%)]',
                style === 'topbar'
                    ? 'flex items-center justify-center overflow-hidden rounded-xl px-3 text-center'
                    : 'rounded-[18px] p-3.5 text-center'
            )}
            style={{ height, width }}>
            <div
                className={cn(
                    'text-loss font-bold',
                    style === 'topbar' ? 'text-[10px]' : 'text-[11px]'
                )}
                role="alert">
                {message}
            </div>
        </div>
    )
}
