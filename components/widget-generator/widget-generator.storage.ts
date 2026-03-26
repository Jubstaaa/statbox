import {
    BUILDER_PUUID_STORAGE_KEY,
    BUILDER_SETTINGS_STORAGE_KEY,
    VALID_QUEUES,
    VALID_REGIONS,
    VALID_WIDGET_STYLES,
} from './widget-generator.constants'
import type { BuilderSettings } from './widget-generator.types'

function isValidDateTimeValue(value: string) {
    return /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):([0-5]\d)$/.test(value)
}

export function getStoredBuilderPuuid() {
    if (typeof window === 'undefined') return null

    return window.localStorage.getItem(BUILDER_PUUID_STORAGE_KEY)?.trim() || null
}

export function setStoredBuilderPuuid(puuid: string) {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(BUILDER_PUUID_STORAGE_KEY, puuid)
}

export function clearStoredBuilderPuuid() {
    if (typeof window === 'undefined') return

    window.localStorage.removeItem(BUILDER_PUUID_STORAGE_KEY)
}

export function getStoredBuilderSettings(): BuilderSettings | null {
    if (typeof window === 'undefined') return null

    try {
        const raw = window.localStorage.getItem(BUILDER_SETTINGS_STORAGE_KEY)
        if (!raw) return null

        const parsed = JSON.parse(raw) as Partial<BuilderSettings>
        if (
            typeof parsed.region !== 'string' ||
            typeof parsed.queue !== 'string' ||
            !VALID_QUEUES.has(parsed.queue as BuilderSettings['queue']) ||
            !VALID_REGIONS.has(parsed.region as BuilderSettings['region']) ||
            typeof parsed.sessionMode !== 'string' ||
            !['all-day', 'from-time'].includes(parsed.sessionMode) ||
            !(
                parsed.sessionTime === null ||
                (typeof parsed.sessionTime === 'string' &&
                    isValidDateTimeValue(parsed.sessionTime))
            ) ||
            typeof parsed.style !== 'string' ||
            !VALID_WIDGET_STYLES.has(parsed.style as BuilderSettings['style'])
        ) {
            return null
        }

        return {
            queue: parsed.queue as BuilderSettings['queue'],
            region: parsed.region as BuilderSettings['region'],
            sessionMode: parsed.sessionMode as BuilderSettings['sessionMode'],
            sessionTime: parsed.sessionTime ?? null,
            style: parsed.style as BuilderSettings['style'],
        }
    } catch {
        return null
    }
}

export function setStoredBuilderSettings(settings: BuilderSettings) {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(
        BUILDER_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings),
    )
}

export function clearStoredBuilderSettings() {
    if (typeof window === 'undefined') return

    window.localStorage.removeItem(BUILDER_SETTINGS_STORAGE_KEY)
}
