import { useSyncExternalStore } from 'react'

import { z } from 'zod'

import { puuidSchema } from '@/lib/riot/riot.schemas'

import {
    type BuilderSettings,
    builderSettingsSchema,
} from './widget-generator.payload'

interface BuilderAccount {
    puuid: string
    settings: BuilderSettings
}

// The PUUID and its settings are one record under one key: a PUUID without
// its settings has no region, and guessing one sends every Riot call to the
// wrong platform. A single setItem either stores the whole record or nothing.
const ACCOUNT_STORAGE_KEY = 'statbox.builder.account'
// Where builds before the single record kept the two halves.
const LEGACY_PUUID_STORAGE_KEY = 'statbox.builder.puuid'
const LEGACY_SETTINGS_STORAGE_KEY = 'statbox.builder.settings'

const builderAccountSchema = z.object({
    puuid: z.string().trim().pipe(puuidSchema),
    settings: builderSettingsSchema,
})

function parseJson(raw: null | string): unknown {
    if (raw === null) return null
    try {
        return JSON.parse(raw) as unknown
    } catch {
        return null
    }
}

export class BuilderStorageError extends Error {
    constructor(cause: unknown) {
        super('The browser refused to store the builder account', { cause })
        this.name = 'BuilderStorageError'
    }
}

const listeners = new Set<() => void>()
let snapshot: undefined | { account: BuilderAccount | null; key: null | string }
let reportedBlockedStorage = false

function notify() {
    for (const listener of listeners) listener()
}

function reportBlockedStorage(error: unknown) {
    if (reportedBlockedStorage) return
    reportedBlockedStorage = true
    console.warn('[builder] browser storage is unavailable:', error)
}

// Moves an account saved under the two old keys into the single record. If
// the browser refuses the write, the account is still used and the old keys
// stay, to be migrated on a later read.
function migrateLegacyAccount(storage: Storage): null | string {
    const puuid = storage.getItem(LEGACY_PUUID_STORAGE_KEY)
    const settings = parseJson(storage.getItem(LEGACY_SETTINGS_STORAGE_KEY))
    const parsed = builderAccountSchema.safeParse({ puuid, settings })
    if (!parsed.success) return null

    const record = JSON.stringify(parsed.data)
    try {
        storage.setItem(ACCOUNT_STORAGE_KEY, record)
        storage.removeItem(LEGACY_PUUID_STORAGE_KEY)
        storage.removeItem(LEGACY_SETTINGS_STORAGE_KEY)
    } catch (error) {
        reportBlockedStorage(error)
    }

    return record
}

// Storage can be blocked outright (site data disabled, some private modes);
// the builder then simply has no saved account. Warned once, not per render.
function readStorage(): null | string {
    try {
        const storage = window.localStorage

        return (
            storage.getItem(ACCOUNT_STORAGE_KEY) ??
            migrateLegacyAccount(storage)
        )
    } catch (error) {
        reportBlockedStorage(error)

        return null
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

    const key = readStorage()

    // useSyncExternalStore needs the same object back while storage is unchanged.
    if (snapshot === undefined || snapshot.key !== key) {
        const parsed = builderAccountSchema.safeParse(parseJson(key))
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
            ACCOUNT_STORAGE_KEY,
            JSON.stringify({ puuid, settings })
        )
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
            ACCOUNT_STORAGE_KEY,
            JSON.stringify({ puuid, settings })
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
        window.localStorage.removeItem(ACCOUNT_STORAGE_KEY)
        window.localStorage.removeItem(LEGACY_PUUID_STORAGE_KEY)
        window.localStorage.removeItem(LEGACY_SETTINGS_STORAGE_KEY)
    } catch (error) {
        console.error('[builder] could not clear the saved account:', error)
    } finally {
        notify()
    }
}
