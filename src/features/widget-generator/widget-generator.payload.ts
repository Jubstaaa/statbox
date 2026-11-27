import { format, parse, startOfToday } from 'date-fns'
import {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
} from 'lz-string'
import { z } from 'zod'

import type { RankedQueue, Region, WidgetStyle } from '@/lib/riot/riot.types'

import {
    puuidSchema,
    rankedQueueSchema,
    regionSchema,
    widgetStyleSchema,
} from '@/lib/riot/riot.schemas'

const sessionDateTimeSchema = z.iso.datetime({
    local: true,
    precision: -1,
})
const sessionClockTimeSchema = z.iso.time({ precision: -1 })
const sessionModeSchema = z.enum(['all-day', 'from-time'])

export type SessionMode = z.infer<typeof sessionModeSchema>

export const builderSettingsSchema = z.object({
    queue: rankedQueueSchema,
    region: regionSchema,
    sessionMode: sessionModeSchema,
    sessionTime: sessionDateTimeSchema.nullable(),
    style: widgetStyleSchema,
})

export type BuilderSettings = z.infer<typeof builderSettingsSchema>

export const DEFAULT_BUILDER_SETTINGS = {
    queue: 'solo',
    sessionMode: 'all-day',
    sessionTime: null,
    style: 'classic',
} as const satisfies Omit<BuilderSettings, 'region'>

type WidgetRoutePayload = BuilderSettings & { puuid: string }

const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm"

const MAX_PAYLOAD_LENGTH = 512
const MAX_DECOMPRESSED_LENGTH = 1024

function encodeWidgetRoutePayload(payload: WidgetRoutePayload) {
    return compressToEncodedURIComponent(JSON.stringify(payload))
}

const widgetRoutePayloadSchema = builderSettingsSchema.extend({
    puuid: puuidSchema,
    sessionMode: sessionModeSchema.default(
        DEFAULT_BUILDER_SETTINGS.sessionMode
    ),
    sessionTime: sessionDateTimeSchema.nullable().default(null),
})

export interface WidgetTarget {
    getSession: () => null | number
    puuid: string
    queue: RankedQueue
    region: Region
    style: WidgetStyle
}

export function decodeWidgetRoutePayload(
    payload: string
): null | WidgetRoutePayload {
    if (payload.length > MAX_PAYLOAD_LENGTH) return null

    try {
        const decoded = decompressFromEncodedURIComponent(payload)
        if (!decoded || decoded.length > MAX_DECOMPRESSED_LENGTH) return null

        const parsed = widgetRoutePayloadSchema.safeParse(JSON.parse(decoded))

        return parsed.success ? parsed.data : null
    } catch {
        return null
    }
}

const legacyTargetSchema = z.object({
    puuid: puuidSchema,
    queue: rankedQueueSchema.default(DEFAULT_BUILDER_SETTINGS.queue),
    region: regionSchema,
    session: z.coerce.number().int().positive().optional().catch(undefined),
})

export function buildSessionTimestampFromTime(value: string) {
    if (sessionDateTimeSchema.safeParse(value).success) {
        return clampSessionTimestamp(new Date(value).getTime())
    }

    if (!sessionClockTimeSchema.safeParse(value).success) return null

    return clampSessionTimestamp(parse(value, 'HH:mm', new Date()).getTime())
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

export function getCurrentDateTimeInputValue() {
    return format(new Date(), DATETIME_LOCAL_FORMAT)
}

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
        style: DEFAULT_BUILDER_SETTINGS.style,
    }
}

export function resolveSessionTimestamp({
    sessionMode,
    sessionTime,
}: {
    sessionMode: SessionMode
    sessionTime?: null | string
}) {
    const fromTime =
        sessionMode === 'from-time' && sessionTime
            ? buildSessionTimestampFromTime(sessionTime)
            : null

    return fromTime ?? startOfToday().getTime()
}

function clampSessionTimestamp(timestamp: number) {
    return Math.min(timestamp, Date.now())
}
