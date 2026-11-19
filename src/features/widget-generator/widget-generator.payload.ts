import { format, parse, startOfToday } from 'date-fns'
import {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
} from 'lz-string'
import { z } from 'zod'

import {
    puuidSchema,
    rankedQueueSchema,
    regionSchema,
    widgetStyleSchema,
} from '@/lib/riot/riot.schemas'
import type { RankedQueue, Region, WidgetStyle } from '@/lib/riot/riot.types'

import type { SessionMode, WidgetRoutePayload } from './widget-generator.types'

// The value of an <input type="datetime-local">, minute precision.
export const sessionDateTimeSchema = z.iso.datetime({
    local: true,
    precision: -1,
})
const sessionClockTimeSchema = z.iso.time({ precision: -1 })
export const sessionModeSchema = z.enum(['all-day', 'from-time'])

const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm"

function encodeWidgetRoutePayload(payload: WidgetRoutePayload) {
    return compressToEncodedURIComponent(JSON.stringify(payload))
}

const widgetRoutePayloadSchema = z.object({
    puuid: puuidSchema,
    queue: rankedQueueSchema,
    region: regionSchema,
    sessionMode: sessionModeSchema.optional(),
    sessionTime: sessionDateTimeSchema.nullable().optional(),
    style: widgetStyleSchema,
})

export function decodeWidgetRoutePayload(
    payload: string
): WidgetRoutePayload | null {
    try {
        const decoded = decompressFromEncodedURIComponent(payload)
        if (!decoded) return null

        const parsed = widgetRoutePayloadSchema.safeParse(JSON.parse(decoded))
        if (!parsed.success) return null

        return {
            puuid: parsed.data.puuid,
            queue: parsed.data.queue,
            region: parsed.data.region,
            sessionMode: parsed.data.sessionMode ?? 'all-day',
            sessionTime: parsed.data.sessionTime ?? null,
            style: parsed.data.style,
        }
    } catch {
        return null
    }
}

export function buildWidgetUrls({
    puuid,
    queue,
    region,
    sessionMode,
    sessionTime,
    style,
}: {
    puuid: string
    queue: RankedQueue
    region: Region
    sessionMode: SessionMode
    sessionTime: string | null
    style: WidgetStyle
}) {
    const base =
        typeof window !== 'undefined'
            ? window.location.origin
            : 'https://statbox.live'
    const payload = encodeWidgetRoutePayload({
        puuid,
        queue,
        region,
        sessionMode,
        sessionTime,
        style,
    })

    return { widgetUrl: `${base}/widget/${payload}` }
}

function clampSessionTimestamp(timestamp: number) {
    return Math.min(timestamp, Date.now())
}

export function getCurrentDateTimeInputValue() {
    return format(new Date(), DATETIME_LOCAL_FORMAT)
}

// Accepts the datetime-local value the builder stores, or a bare HH:mm (today)
// from older widget links. Returns null for anything else.
export function buildSessionTimestampFromTime(value: string) {
    if (sessionDateTimeSchema.safeParse(value).success) {
        return clampSessionTimestamp(new Date(value).getTime())
    }

    if (!sessionClockTimeSchema.safeParse(value).success) return null

    return clampSessionTimestamp(parse(value, 'HH:mm', new Date()).getTime())
}

export function resolveSessionTimestamp({
    sessionMode,
    sessionTime,
}: {
    sessionMode: SessionMode
    sessionTime?: string | null
}) {
    const fromTime =
        sessionMode === 'from-time' && sessionTime
            ? buildSessionTimestampFromTime(sessionTime)
            : null

    return fromTime ?? startOfToday().getTime()
}
