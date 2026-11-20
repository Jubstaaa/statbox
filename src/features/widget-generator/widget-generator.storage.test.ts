// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
    BUILDER_PUUID_STORAGE_KEY,
    BUILDER_SETTINGS_STORAGE_KEY,
} from './widget-generator.constants'
import type { BuilderSettings } from './widget-generator.payload'
import {
    clearBuilderAccount,
    getBuilderAccount,
    saveBuilderAccount,
    saveBuilderSettings,
    subscribeToBuilderAccount,
} from './widget-generator.storage'

const PUUID = 'e'.repeat(78)
const SETTINGS: BuilderSettings = {
    queue: 'solo',
    region: 'KR',
    sessionMode: 'all-day',
    sessionTime: null,
    style: 'classic',
}

afterEach(() => {
    window.localStorage.clear()
})

describe('builder account store', () => {
    it('saves the account and its settings together', () => {
        saveBuilderAccount({ puuid: PUUID, settings: SETTINGS })

        expect(getBuilderAccount()).toEqual({
            puuid: PUUID,
            settings: SETTINGS,
        })
    })

    it('returns the same snapshot until storage changes', () => {
        saveBuilderAccount({ puuid: PUUID, settings: SETTINGS })
        const first = getBuilderAccount()

        expect(getBuilderAccount()).toBe(first)

        saveBuilderSettings({ ...SETTINGS, queue: 'flex' })

        expect(getBuilderAccount()).not.toBe(first)
        expect(getBuilderAccount()?.settings.queue).toBe('flex')
    })

    it('has no account when the settings are missing, so no region is guessed', () => {
        window.localStorage.setItem(BUILDER_PUUID_STORAGE_KEY, PUUID)

        expect(getBuilderAccount()).toBeNull()
    })

    it.each([
        ['a malformed PUUID', 'not-a-puuid', JSON.stringify(SETTINGS)],
        ['unparseable settings', PUUID, '{'],
        ['settings for an unknown region', PUUID, '{"region":"MARS"}'],
    ])('has no account for %s', (_, puuid, settings) => {
        window.localStorage.setItem(BUILDER_PUUID_STORAGE_KEY, puuid)
        window.localStorage.setItem(BUILDER_SETTINGS_STORAGE_KEY, settings)

        expect(getBuilderAccount()).toBeNull()
    })

    it('clears the PUUID and the settings', () => {
        saveBuilderAccount({ puuid: PUUID, settings: SETTINGS })

        clearBuilderAccount()

        expect(window.localStorage.length).toBe(0)
        expect(getBuilderAccount()).toBeNull()
    })

    it('notifies subscribers on every write', () => {
        const listener = vi.fn()
        const unsubscribe = subscribeToBuilderAccount(listener)

        saveBuilderAccount({ puuid: PUUID, settings: SETTINGS })
        saveBuilderSettings(SETTINGS)
        clearBuilderAccount()
        unsubscribe()
        saveBuilderSettings(SETTINGS)

        expect(listener).toHaveBeenCalledTimes(3)
    })
})
