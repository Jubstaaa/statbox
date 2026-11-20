import { useSyncExternalStore } from 'react'

import { z } from 'zod'

import {
    puuidSchema,
    rankedQueueSchema,
    regionSchema,
    widgetStyleSchema,
} from '@/lib/riot/riot.schemas'

import {
    BUILDER_PUUID_STORAGE_KEY,
    BUILDER_SETTINGS_STORAGE_KEY,
} from './widget-generator.constants'
import {
    type BuilderSettings,
    sessionDateTimeSchema,
    sessionModeSchema,
} from './widget-generator.payload'

interface BuilderAccount {
    puuid: string
    settings: BuilderSettings
}

const builderSettingsSchema = z.object({
    queue: rankedQueueSchema,
    region: regionSchema,
    sessionMode: sessionModeSchema,
    sessionTime: sessionDateTimeSchema.nullable(),
    style: widgetStyleSchema,
})

// The PUUID and its settings are one record: a PUUID without settings has no
// region, and guessing one sends every Riot call to the wrong platform.
const builderAccountSchema = z.object({
    puuid: z.string().trim().pipe(puuidSchema),
    settings: z
        .string()
        .transform((raw, context) => {
            try {
                return JSON.parse(raw) as unknown
            } catch {
                context.addIssue({ code: 'custom', message: 'Invalid JSON' })
                return z.NEVER
            }
        })
        .pipe(builderSettingsSchema),
})

const listeners = new Set<() => void>()
let snapshot: { account: BuilderAccount | null; key: string } | undefined

function notify() {
    for (const listener of listeners) listener()
}

export function subscribeToBuilderAccount(listener: () => void) {
    listeners.add(listener)
    // Another tab connecting or changing the account.
    window.addEventListener('storage', listener)

    return () => {
        listeners.delete(listener)
        window.removeEventListener('storage', listener)
    }
}

export function getBuilderAccount(): BuilderAccount | null {
    if (typeof window === 'undefined') return null

    const puuid = window.localStorage.getItem(BUILDER_PUUID_STORAGE_KEY)
    const settings = window.localStorage.getItem(BUILDER_SETTINGS_STORAGE_KEY)
    const key = JSON.stringify([puuid, settings])

    // useSyncExternalStore needs the same object back while storage is unchanged.
    if (snapshot?.key !== key) {
        const parsed = builderAccountSchema.safeParse({ puuid, settings })
        snapshot = { account: parsed.success ? parsed.data : null, key }
    }

    return snapshot.account
}

export function useBuilderAccount() {
    return useSyncExternalStore(
        subscribeToBuilderAccount,
        getBuilderAccount,
        () => null
    )
}

export function saveBuilderAccount({ puuid, settings }: BuilderAccount) {
    window.localStorage.setItem(
        BUILDER_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
    )
    window.localStorage.setItem(BUILDER_PUUID_STORAGE_KEY, puuid)
    notify()
}

export function saveBuilderSettings(settings: BuilderSettings) {
    window.localStorage.setItem(
        BUILDER_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
    )
    notify()
}

export function clearBuilderAccount() {
    window.localStorage.removeItem(BUILDER_PUUID_STORAGE_KEY)
    window.localStorage.removeItem(BUILDER_SETTINGS_STORAGE_KEY)
    notify()
}
