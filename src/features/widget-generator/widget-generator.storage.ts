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

const ACCOUNT_STORAGE_KEY = 'statbox.builder.account'

const LEGACY_PUUID_STORAGE_KEY = 'statbox.builder.puuid'
const LEGACY_SETTINGS_STORAGE_KEY = 'statbox.builder.settings'

const builderAccountSchema = z.object({
    puuid: z.string().trim().pipe(puuidSchema),
    settings: builderSettingsSchema,
})

export class BuilderStorageError extends Error {
    constructor(cause: unknown) {
        super('The browser refused to store the builder account', { cause })
        this.name = 'BuilderStorageError'
    }
}

function parseJson(raw: null | string): unknown {
    if (raw === null) return null
    try {
        return JSON.parse(raw) as unknown
    } catch {
        return null
    }
}

const listeners = new Set<() => void>()
let snapshot: undefined | { account: BuilderAccount | null; key: null | string }
let reportedBlockedStorage = false

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

export function getBuilderAccount(): BuilderAccount | null {
    if (typeof window === 'undefined') return null

    const key = readStorage()

    if (snapshot?.key !== key) {
        const parsed = builderAccountSchema.safeParse(parseJson(key))
        snapshot = { account: parsed.success ? parsed.data : null, key }
    }

    return snapshot.account
}

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

export function subscribeToBuilderAccount(listener: () => void) {
    migrateLegacyAccount()
    listeners.add(listener)

    window.addEventListener('storage', listener)

    return () => {
        listeners.delete(listener)
        window.removeEventListener('storage', listener)
    }
}

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

export function useBuilderAccount() {
    return useSyncExternalStore(
        subscribeToBuilderAccount,
        getBuilderAccount,
        () => null
    )
}

function migrateLegacyAccount() {
    try {
        const storage = window.localStorage
        if (storage.getItem(ACCOUNT_STORAGE_KEY) !== null) return

        const record = readLegacyRecord(storage)
        if (record === null) return

        storage.setItem(ACCOUNT_STORAGE_KEY, record)
        storage.removeItem(LEGACY_PUUID_STORAGE_KEY)
        storage.removeItem(LEGACY_SETTINGS_STORAGE_KEY)
    } catch (error) {
        reportBlockedStorage(error)
    }
}

function notify() {
    for (const listener of listeners) listener()
}

function readLegacyRecord(storage: Storage): null | string {
    const puuid = storage.getItem(LEGACY_PUUID_STORAGE_KEY)
    const settings = parseJson(storage.getItem(LEGACY_SETTINGS_STORAGE_KEY))
    const parsed = builderAccountSchema.safeParse({ puuid, settings })

    return parsed.success ? JSON.stringify(parsed.data) : null
}

function readStorage(): null | string {
    try {
        const storage = window.localStorage

        return storage.getItem(ACCOUNT_STORAGE_KEY) ?? readLegacyRecord(storage)
    } catch (error) {
        reportBlockedStorage(error)

        return null
    }
}

function reportBlockedStorage(error: unknown) {
    if (reportedBlockedStorage) return
    reportedBlockedStorage = true
    console.warn('[builder] browser storage is unavailable:', error)
}
