import WidgetContent from './widget-content'
import WidgetError from './widget.error'
import WidgetLoader from './widget.loader'
import type { WidgetProps } from './widget.types'
import { computeWidgetData } from './widget.utils'

export default function Widget({
    data,
    isError = false,
    isLoading = false,
    session,
    style,
}: WidgetProps) {
    if (isLoading || !data) return <WidgetLoader style={style} />
    if (isError) return <WidgetError style={style} />

    return (
        <WidgetContent
            data={computeWidgetData({ data, session })}
            style={style}
        />
    )
}
