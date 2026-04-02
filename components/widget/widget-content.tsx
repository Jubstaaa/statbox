import type { WidgetStyle } from '@/lib/riot/riot.types'

import ClassicWidget from './classic-widget'
import CompactWidget from './compact-widget'
import MinimalWidget from './minimal-widget'
import TopbarWidget from './topbar-widget'
import type { ComputedData } from './widget.types'
import { getWidgetHeight, getWidgetWidth } from './widget.utils'

const widgetVariants = {
    classic: ClassicWidget,
    compact: CompactWidget,
    minimal: MinimalWidget,
    topbar: TopbarWidget,
} satisfies Record<WidgetStyle, React.ComponentType<ComputedData>>

export default function WidgetContent({
    data,
    style,
}: {
    data: ComputedData
    style: WidgetStyle
}) {
    const WidgetVariant = widgetVariants[style]
    const width = getWidgetWidth(style)
    const height = getWidgetHeight(style)

    return (
        <div style={{ height, width }}>
            <WidgetVariant {...data} />
        </div>
    )
}
