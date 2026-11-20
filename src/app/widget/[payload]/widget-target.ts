import {
    decodeWidgetRoutePayload,
    resolveSessionTimestamp,
} from '@/features/widget-generator/widget-generator.payload'
import {
    puuidSchema,
    rankedQueueSchema,
    regionSchema,
} from '@/lib/riot/riot.schemas'
import type { RankedQueue, Region, WidgetStyle } from '@/lib/riot/riot.types'

interface WidgetTarget {
    // A function, not a value: an all-day session has to roll over at midnight
    // for an overlay that stays open across it.
    getSession: () => number | null
    style: WidgetStyle
    target: null | { puuid: string; queue: RankedQueue; region: Region }
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
): WidgetTarget {
    const payload = safeDecode(segment)
    const decoded = payload ? decodeWidgetRoutePayload(payload) : null

    if (decoded) {
        return {
            getSession: () => resolveSessionTimestamp(decoded),
            style: decoded.style,
            target: {
                puuid: decoded.puuid,
                queue: decoded.queue,
                region: decoded.region,
            },
        }
    }

    // Links from before the payload format carry the PUUID bare, with region,
    // queue and session start in the query string.
    const puuid = puuidSchema.safeParse(payload)
    const region = regionSchema.safeParse(searchParams.get('region'))
    const session = Number.parseInt(searchParams.get('session') ?? '', 10)

    return {
        getSession: () => session || null,
        style: 'classic',
        target:
            puuid.success && region.success
                ? {
                      puuid: puuid.data,
                      queue: rankedQueueSchema
                          .catch('solo')
                          .parse(searchParams.get('queue')),
                      region: region.data,
                  }
                : null,
    }
}
