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

// The value of an <input type="datetime-local">, minute precision.
export const sessionDateTimeSchema = z.iso.datetime({
    local: true,
    precision: -1,
})
const sessionClockTimeSchema = z.iso.time({ precision: -1 })
export const sessionModeSchema = z.enum(['all-day', 'from-time'])

export type SessionMode = z.infer<typeof sessionModeSchema>

export interface BuilderSettings {
    queue: RankedQueue
    region: Region
    sessionMode: SessionMode
    sessionTime: string | null
    style: WidgetStyle
}

interface WidgetRoutePayload extends BuilderSettings {
    puuid: string
}

const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm"

// A real payload compresses to about 150 characters and expands to about 200.
// LZW output can grow quadratically with its input, so the segment is capped
// before decompressing and the result before parsing: an uncapped segment of a
// few kilobytes expands to tens of megabytes inside a 256 MB container.
const MAX_PAYLOAD_LENGTH = 512
const MAX_DECOMPRESSED_LENGTH = 1024

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
    if (payload.length > MAX_PAYLOAD_LENGTH) return null

    try {
        const decoded = decompressFromEncodedURIComponent(payload)
        if (!decoded || decoded.length > MAX_DECOMPRESSED_LENGTH) return null

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

export interface WidgetTarget {
    // A function, not a value: an all-day session has to roll over at midnight
    // for an overlay that stays open across it.
    getSession: () => null | number
    puuid: string
    queue: RankedQueue
    region: Region
    style: WidgetStyle
}

// Links from before the payload format carry the PUUID bare, with region,
// queue and session start in the query string.
const legacyTargetSchema = z.object({
    puuid: puuidSchema,
    queue: rankedQueueSchema.default('solo'),
    region: regionSchema,
    session: z.coerce.number().int().positive().optional().catch(undefined),
})

// The one reader of widget URLs, shared by the widget page and the summoner
// API so both accept and refuse exactly the same links.
export function parseWidgetTarget(
    segment: string,
    searchParams: URLSearchParams
): null | WidgetTarget {
    const decoded = decodeWidgetRoutePayload(segment)

    if (decoded) {
        return {
            getSession: () => resolveSessionTimestamp(decoded),
            puuid: decoded.puuid,
            queue: decoded.queue,
            region: decoded.region,
            style: decoded.style,
        }
    }

    const legacy = legacyTargetSchema.safeParse({
        puuid: segment,
        queue: searchParams.get('queue') ?? undefined,
        region: searchParams.get('region'),
        session: searchParams.get('session') ?? undefined,
    })
    if (!legacy.success) return null

    const { session = null, ...target } = legacy.data

    return {
        ...target,
        getSession: () => session,
        style: 'classic',
    }
}

export function buildWidgetUrls({
    puuid,
    queue,
    region,
    sessionMode,
    sessionTime,
    style,
}: WidgetRoutePayload) {
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
