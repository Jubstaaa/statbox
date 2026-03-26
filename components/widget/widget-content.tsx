import type { WidgetStyle } from '@/lib/riot/riot.types'

import ClassicWidget from './variants/classic-widget'
import CompactWidget from './variants/compact-widget'
import MinimalWidget from './variants/minimal-widget'
import TopbarWidget from './variants/topbar-widget'
import type { ComputedData } from './widget.types'

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

    return <WidgetVariant {...data} />
}
