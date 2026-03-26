import { z } from 'zod'

import {
    rankedQueueSchema,
    regionSchema,
    widgetStyleSchema,
} from '@/lib/riot/riot.schemas'

import {
    BUILDER_PUUID_STORAGE_KEY,
    BUILDER_SETTINGS_STORAGE_KEY,
} from './widget-generator.constants'
import type { BuilderSettings } from './widget-generator.types'

function isValidDateTimeValue(value: string) {
    return /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):([0-5]\d)$/.test(value)
}

const builderSettingsSchema = z.object({
    queue: rankedQueueSchema,
    region: regionSchema,
    sessionMode: z.enum(['all-day', 'from-time']),
    sessionTime: z.string().refine(isValidDateTimeValue).nullable(),
    style: widgetStyleSchema,
})

export function getStoredBuilderPuuid() {
    if (typeof window === 'undefined') return null

    return (
        window.localStorage.getItem(BUILDER_PUUID_STORAGE_KEY)?.trim() || null
    )
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

        const parsed = builderSettingsSchema.safeParse(JSON.parse(raw))
        if (!parsed.success) return null

        return parsed.data as BuilderSettings
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
