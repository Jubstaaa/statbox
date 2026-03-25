import {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
} from 'lz-string'

import type {
    RankedQueue,
    Region,
    RiotData,
    WidgetStyle,
} from '@/lib/riot/riot.types'

const VALID_REGIONS = new Set<Region>(['TR', 'EUW', 'EUNE', 'NA', 'KR'])

const VALID_WIDGET_STYLES = new Set<WidgetStyle>([
    'classic',
    'minimal',
    'compact',
])
const VALID_QUEUES = new Set<RankedQueue>(['solo', 'flex'])

const BUILDER_PUUID_STORAGE_KEY = 'statbox.builder.puuid'
const BUILDER_SETTINGS_STORAGE_KEY = 'statbox.builder.settings'

function isValidTimeValue(time: string) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
}

interface WidgetRoutePayload {
    puuid: string
    queue: RankedQueue
    region: Region
    sessionMode?: 'all-day' | 'from-time'
    sessionStartedAt?: number | null
    sessionTime?: string | null
    style: WidgetStyle
}

interface LegacyWidgetRoutePayload {
    name: string
    region: Region
    style: WidgetStyle
    tag: string
}

interface BuilderSettings {
    queue: RankedQueue
    region: Region
    sessionMode: 'all-day' | 'from-time'
    sessionTime: string | null
    style: WidgetStyle
}

interface ResolveSummonerParams {
    name: string
    region: Region
    tag: string
}

export function validateSummonerForm(name: string, tag: string) {
    const errors: { name?: string; tag?: string } = {}
    const cleanName = name.trim()
    const cleanTag = tag.trim().replace(/^#/, '')

    if (!cleanName) errors.name = 'Game Name is required'
    if (!cleanTag) errors.tag = 'Tag is required'
    else if (cleanTag.length > 10) errors.tag = 'Tag is too long'

    return { cleanName, cleanTag, errors }
}

export async function resolveSummoner({
    name,
    region,
    tag,
}: ResolveSummonerParams) {
    const params = new URLSearchParams({
        name,
        region,
        tag,
    })
    const res = await fetch(`/api/summoner/resolve?${params.toString()}`)

    if (!res.ok) {
        throw new Error('Summoner not found')
    }

    return (await res.json()) as { puuid: string; region: Region }
}

export async function fetchSummonerByPuuid({
    puuid,
    queue,
    region,
    session,
}: {
    puuid: string
    queue: RankedQueue
    region: Region
    session?: number | null
}) {
    const params = new URLSearchParams()
    params.set('queue', queue)
    params.set('region', region)

    if (typeof session === 'number') {
        params.set('session', String(session))
    }

    const query = params.toString()
    const res = await fetch(`/api/summoner/${puuid}${query ? `?${query}` : ''}`)

    if (!res.ok) {
        throw new Error('Summoner not found')
    }

    return (await res.json()) as RiotData
}

export function getStoredBuilderPuuid() {
    if (typeof window === 'undefined') return null

    const puuid = window.localStorage.getItem(BUILDER_PUUID_STORAGE_KEY)

    return puuid?.trim() || null
}

export function setStoredBuilderPuuid(puuid: string) {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(BUILDER_PUUID_STORAGE_KEY, puuid)
}

export function clearStoredBuilderPuuid() {
    if (typeof window === 'undefined') return

    window.localStorage.removeItem(BUILDER_PUUID_STORAGE_KEY)
}

export function getStoredBuilderSettings() {
    if (typeof window === 'undefined') return null

    try {
        const raw = window.localStorage.getItem(BUILDER_SETTINGS_STORAGE_KEY)
        if (!raw) return null

        const parsed = JSON.parse(raw) as Partial<BuilderSettings>
        if (
            typeof parsed.region !== 'string' ||
            typeof parsed.queue !== 'string' ||
            !VALID_QUEUES.has(parsed.queue as RankedQueue) ||
            !VALID_REGIONS.has(parsed.region as Region) ||
            typeof parsed.sessionMode !== 'string' ||
            !['all-day', 'from-time'].includes(parsed.sessionMode) ||
            !(
                parsed.sessionTime === null ||
                (typeof parsed.sessionTime === 'string' &&
                    isValidTimeValue(parsed.sessionTime))
            ) ||
            typeof parsed.style !== 'string' ||
            !VALID_WIDGET_STYLES.has(parsed.style as WidgetStyle)
        ) {
            return null
        }

        return {
            queue: parsed.queue as RankedQueue,
            region: parsed.region as Region,
            sessionMode: parsed.sessionMode as 'all-day' | 'from-time',
            sessionTime: parsed.sessionTime ?? null,
            style: parsed.style as WidgetStyle,
        }
    } catch {
        return null
    }
}

export function setStoredBuilderSettings(settings: BuilderSettings) {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(
        BUILDER_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
    )
}

export function clearStoredBuilderSettings() {
    if (typeof window === 'undefined') return

    window.localStorage.removeItem(BUILDER_SETTINGS_STORAGE_KEY)
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
                    isValidTimeValue(parsed.sessionTime))
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

        return {
            name,
            region,
            style,
            tag,
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

    return {
        widgetUrl: `${base}/widget/${payload}`,
    }
}

export function getStartOfTodayTimestamp() {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now.getTime()
}

export function clampSessionTimestamp(timestamp: number) {
    return Math.min(timestamp, Date.now())
}

export function getCurrentTimeInputValue() {
    return getTimeInputValueFromTimestamp(Date.now())
}

export function buildSessionTimestampFromTime(time: string) {
    if (!isValidTimeValue(time)) return null

    const [hoursRaw, minutesRaw] = time.split(':')
    const hours = Number(hoursRaw)
    const minutes = Number(minutesRaw)

    const date = new Date()
    date.setHours(hours, minutes, 0, 0)

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
    if (sessionMode === 'all-day') {
        return getStartOfTodayTimestamp()
    }

    if (sessionTime && isValidTimeValue(sessionTime)) {
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

export function getTimeInputValueFromTimestamp(timestamp: number | null) {
    if (!timestamp) return '00:00'

    const date = new Date(timestamp)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${hours}:${minutes}`
}
