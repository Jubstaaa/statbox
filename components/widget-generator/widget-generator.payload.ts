import {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
} from 'lz-string'

import type { RankedQueue, Region, WidgetStyle } from '@/lib/riot/riot.types'

import {
    VALID_QUEUES,
    VALID_REGIONS,
    VALID_WIDGET_STYLES,
} from './widget-generator.constants'
import type {
    LegacyWidgetRoutePayload,
    WidgetRoutePayload,
} from './widget-generator.types'

function isValidTimeValue(time: string) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
}

function isValidDateTimeValue(value: string) {
    return /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):([0-5]\d)$/.test(value)
}

function encodeWidgetRoutePayload(payload: WidgetRoutePayload) {
    return compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodeWidgetRoutePayload(
    payload: string
): WidgetRoutePayload | null {
    try {
        const decoded = decompressFromEncodedURIComponent(payload)
        if (!decoded) return null

        const parsed = JSON.parse(decoded) as Partial<WidgetRoutePayload>
        if (
            typeof parsed.puuid !== 'string' ||
            typeof parsed.queue !== 'string' ||
            typeof parsed.region !== 'string' ||
            typeof parsed.style !== 'string' ||
            !(
                parsed.sessionMode === undefined ||
                parsed.sessionMode === 'all-day' ||
                parsed.sessionMode === 'from-time'
            ) ||
            !(
                parsed.sessionTime === undefined ||
                parsed.sessionTime === null ||
                (typeof parsed.sessionTime === 'string' &&
                    isValidDateTimeValue(parsed.sessionTime))
            ) ||
            !(
                parsed.sessionStartedAt === undefined ||
                parsed.sessionStartedAt === null ||
                (typeof parsed.sessionStartedAt === 'number' &&
                    Number.isFinite(parsed.sessionStartedAt))
            )
        ) {
            return null
        }

        const puuid = parsed.puuid.trim()
        const queue = parsed.queue as RankedQueue
        const region = parsed.region.toUpperCase() as Region
        const style = parsed.style as WidgetStyle

        if (
            !puuid ||
            !VALID_QUEUES.has(queue) ||
            !VALID_REGIONS.has(region) ||
            !VALID_WIDGET_STYLES.has(style)
        ) {
            return null
        }

        return {
            puuid,
            queue,
            region,
            sessionMode: parsed.sessionMode ?? 'all-day',
            sessionStartedAt: parsed.sessionStartedAt ?? null,
            sessionTime: parsed.sessionTime ?? null,
            style,
        }
    } catch {
        return null
    }
}

export function decodeLegacyWidgetRoutePayload(
    payload: string
): LegacyWidgetRoutePayload | null {
    try {
        const decoded = decompressFromEncodedURIComponent(payload)
        if (!decoded) return null

        const parsed = JSON.parse(decoded) as Partial<LegacyWidgetRoutePayload>
        if (
            typeof parsed.name !== 'string' ||
            typeof parsed.region !== 'string' ||
            typeof parsed.style !== 'string' ||
            typeof parsed.tag !== 'string'
        ) {
            return null
        }

        const name = parsed.name.trim()
        const region = parsed.region.toUpperCase() as Region
        const style = parsed.style as WidgetStyle
        const tag = parsed.tag.trim().replace(/^#/, '')

        if (
            !name ||
            !tag ||
            !VALID_REGIONS.has(region) ||
            !VALID_WIDGET_STYLES.has(style)
        ) {
            return null
        }

        return { name, region, style, tag }
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
    sessionStartedAt,
    sessionTime,
}: {
    sessionMode: 'all-day' | 'from-time'
    sessionStartedAt?: number | null
    sessionTime?: string | null
}) {
    if (sessionMode === 'all-day') return getStartOfTodayTimestamp()

    if (
        sessionTime &&
        (isValidDateTimeValue(sessionTime) || isValidTimeValue(sessionTime))
    ) {
        return buildSessionTimestampFromTime(sessionTime)
    }

    if (
        typeof sessionStartedAt === 'number' &&
        Number.isFinite(sessionStartedAt)
    ) {
        return sessionStartedAt
    }

    return getStartOfTodayTimestamp()
}
