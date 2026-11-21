import { parseWidgetTarget } from '@/features/widget-generator/widget-generator.payload'
import type { RankedQueue, Region, WidgetStyle } from '@/lib/riot/riot.types'

interface ResolvedWidget {
    getSession: () => null | number
    style: WidgetStyle
    target: null | { puuid: string; queue: RankedQueue; region: Region }
}

const NO_TARGET: ResolvedWidget = {
    getSession: () => null,
    style: 'classic',
    target: null,
}

// The segment comes straight from a URL anyone can type, so a bad escape must
// render the widget's error state instead of throwing into the error boundary.
function safeDecode(segment: string) {
    try {
        return decodeURIComponent(segment)
    } catch {
        return null
    }
}

export function resolveWidgetTarget(
    segment: string,
    searchParams: URLSearchParams
): ResolvedWidget {
    const payload = safeDecode(segment)
    const parsed = payload ? parseWidgetTarget(payload, searchParams) : null
    if (!parsed) return NO_TARGET

    const { getSession, style, ...target } = parsed

    return { getSession, style, target }
}
