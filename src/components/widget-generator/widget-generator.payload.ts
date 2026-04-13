import {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
} from 'lz-string'
import { z } from 'zod'

import {
    rankedQueueSchema,
    regionSchema,
    widgetStyleSchema,
} from '@/lib/riot/riot.schemas'
import type { RankedQueue, Region, WidgetStyle } from '@/lib/riot/riot.types'

import type { WidgetRoutePayload } from './widget-generator.types'

function isValidTimeValue(time: string) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
}

function isValidDateTimeValue(value: string) {
    return /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):([0-5]\d)$/.test(value)
}

function encodeWidgetRoutePayload(payload: WidgetRoutePayload) {
    return compressToEncodedURIComponent(JSON.stringify(payload))
}

const widgetRoutePayloadSchema = z.object({
    puuid: z.string().trim().min(1),
    queue: rankedQueueSchema,
    region: regionSchema,
    sessionMode: z.enum(['all-day', 'from-time']).optional(),
    sessionTime: z.string().refine(isValidDateTimeValue).nullable().optional(),
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
    sessionMode: 'all-day' | 'from-time'
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

function getStartOfTodayTimestamp() {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now.getTime()
}

function clampSessionTimestamp(timestamp: number) {
    return Math.min(timestamp, Date.now())
}

export function getCurrentDateTimeInputValue() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function buildSessionTimestampFromTime(value: string) {
    if (isValidDateTimeValue(value)) {
        return clampSessionTimestamp(new Date(value).getTime())
    }

    if (!isValidTimeValue(value)) return null

    const [hoursRaw, minutesRaw] = value.split(':')
    const date = new Date()
    date.setHours(Number(hoursRaw), Number(minutesRaw), 0, 0)

    return clampSessionTimestamp(date.getTime())
}

export function resolveSessionTimestamp({
    sessionMode,
    sessionTime,
}: {
    sessionMode: 'all-day' | 'from-time'
    sessionTime?: string | null
}) {
    if (sessionMode === 'all-day') return getStartOfTodayTimestamp()

    if (
        sessionTime &&
        (isValidDateTimeValue(sessionTime) || isValidTimeValue(sessionTime))
    ) {
        return buildSessionTimestampFromTime(sessionTime)
    }

    return getStartOfTodayTimestamp()
}
