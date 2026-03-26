import Spinner from '@/components/spinner/spinner'

import type { WidgetFrameProps } from './widget.types'
import { getWidgetHeight, getWidgetWidth } from './widget.utils'

export default function WidgetLoader({ style }: WidgetFrameProps) {
    const width = getWidgetWidth(style)
    const height = getWidgetHeight(style)

    return (
        <div
            className="border-hover flex flex-col items-center justify-center gap-2.5 rounded-[18px] border bg-[linear-gradient(180deg,rgba(16,32,51,0.95)_0%,rgba(7,17,31,0.98)_100%)] p-3.5"
            style={{ height, width }}>
            <Spinner className="h-8 w-8" />
            <div className="text-text-muted text-[11px] font-bold tracking-[0.08em] uppercase">
                Loading widget
            </div>
        </div>
    )
}
