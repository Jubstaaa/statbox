import type { WidgetFrameProps } from './widget.types'
import { getWidgetWidth } from './widget.utils'

export default function WidgetError({ style }: WidgetFrameProps) {
    const width = getWidgetWidth(style)
    return (
        <div
            className="border-loss/30 rounded-[18px] border bg-[linear-gradient(180deg,rgba(16,32,51,0.96)_0%,rgba(7,17,31,0.98)_100%)] p-3.5 text-center"
            style={{ width }}>
            <div className="text-loss text-[11px] font-bold">
                Failed to load summoner data.
            </div>
        </div>
    )
}
