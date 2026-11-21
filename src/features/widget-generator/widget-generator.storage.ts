import { useSyncExternalStore } from 'react'

import { z } from 'zod'

import { puuidSchema } from '@/lib/riot/riot.schemas'

import {
    BUILDER_PUUID_STORAGE_KEY,
    BUILDER_SETTINGS_STORAGE_KEY,
} from './widget-generator.constants'
import {
    type BuilderSettings,
    builderSettingsSchema,
} from './widget-generator.payload'

interface BuilderAccount {
    puuid: string
    settings: BuilderSettings
}

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

export class BuilderStorageError extends Error {
    constructor(cause: unknown) {
        super('The browser refused to store the builder account', { cause })
        this.name = 'BuilderStorageError'
    }
}

const listeners = new Set<() => void>()
let snapshot: { account: BuilderAccount | null; key: string } | undefined
let reportedBlockedStorage = false

function notify() {
    for (const listener of listeners) listener()
}

// Storage can be blocked outright (site data disabled, some private modes);
// the builder then simply has no saved account. Warned once, not per render.
function readStorage() {
    try {
        return [
            window.localStorage.getItem(BUILDER_PUUID_STORAGE_KEY),
            window.localStorage.getItem(BUILDER_SETTINGS_STORAGE_KEY),
        ] as const
    } catch (error) {
        if (!reportedBlockedStorage) {
            reportedBlockedStorage = true
            console.warn('[builder] browser storage is unavailable:', error)
        }

        return [null, null] as const
    }
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

    const [puuid, settings] = readStorage()
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

// Throws BuilderStorageError: connecting an account that cannot be kept would
// look like success and then lose it on the next page.
export function saveBuilderAccount({ puuid, settings }: BuilderAccount) {
    try {
        window.localStorage.setItem(
            BUILDER_SETTINGS_STORAGE_KEY,
            JSON.stringify(settings)
        )
        window.localStorage.setItem(BUILDER_PUUID_STORAGE_KEY, puuid)
    } catch (error) {
        throw new BuilderStorageError(error)
    } finally {
        notify()
    }
}

// Writes only when `puuid` is still the stored account, so a page opened for
// one account never overwrites the settings of one another tab connected.
// Returns whether the settings were stored.
export function updateBuilderSettings(
    puuid: string,
    settings: BuilderSettings
): boolean {
    if (getBuilderAccount()?.puuid !== puuid) return false

    try {
        window.localStorage.setItem(
            BUILDER_SETTINGS_STORAGE_KEY,
            JSON.stringify(settings)
        )
    } catch (error) {
        console.error('[builder] could not store the settings:', error)
        return false
    }

    notify()
    return true
}

export function clearBuilderAccount() {
    try {
        window.localStorage.removeItem(BUILDER_PUUID_STORAGE_KEY)
        window.localStorage.removeItem(BUILDER_SETTINGS_STORAGE_KEY)
    } catch (error) {
        console.error('[builder] could not clear the saved account:', error)
    } finally {
        notify()
    }
}
