import type { RiotData, WidgetStyle } from '@/lib/riot/riot.types'

import WidgetContent from './widget-content'
import WidgetError from './widget.error'
import WidgetLoader from './widget.loader'
import { computeWidgetData } from './widget.utils'

interface WidgetProps {
    data: RiotData | null
    errorMessage?: string
    isError?: boolean
    isLoading?: boolean
    session: number | null
    style: WidgetStyle
}

export default function Widget({
    data,
    errorMessage = 'Failed to load summoner data.',
    isError = false,
    isLoading = false,
    session,
    style,
}: WidgetProps) {
    if (isError) return <WidgetError message={errorMessage} style={style} />
    if (isLoading || !data) return <WidgetLoader style={style} />

    return (
        <WidgetContent
            data={computeWidgetData({ data, session })}
            style={style}
        />
    )
}
