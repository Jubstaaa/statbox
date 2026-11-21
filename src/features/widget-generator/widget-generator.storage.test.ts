// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
    BUILDER_PUUID_STORAGE_KEY,
    BUILDER_SETTINGS_STORAGE_KEY,
} from './widget-generator.constants'
import type { BuilderSettings } from './widget-generator.payload'
import {
    BuilderStorageError,
    clearBuilderAccount,
    getBuilderAccount,
    saveBuilderAccount,
    subscribeToBuilderAccount,
    updateBuilderSettings,
} from './widget-generator.storage'

const PUUID = 'e'.repeat(78)
const SETTINGS: BuilderSettings = {
    queue: 'solo',
    region: 'KR',
    sessionMode: 'all-day',
    sessionTime: null,
    style: 'classic',
}

// happy-dom's storage is not reset by restoreAllMocks, so its spies are.
const storageSpies: { mockRestore: () => void }[] = []

afterEach(() => {
    storageSpies.splice(0).forEach(spy => spy.mockRestore())
    vi.restoreAllMocks()
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

        updateBuilderSettings(PUUID, { ...SETTINGS, queue: 'flex' })

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
        updateBuilderSettings(PUUID, SETTINGS)
        clearBuilderAccount()
        unsubscribe()
        saveBuilderAccount({ puuid: PUUID, settings: SETTINGS })

        expect(listener).toHaveBeenCalledTimes(3)
    })

    it('only updates the settings of the account they were made for', () => {
        saveBuilderAccount({ puuid: PUUID, settings: SETTINGS })

        expect(
            updateBuilderSettings('h'.repeat(78), { ...SETTINGS, region: 'NA' })
        ).toBe(false)
        expect(getBuilderAccount()?.settings.region).toBe('KR')
        expect(
            updateBuilderSettings(PUUID, { ...SETTINGS, style: 'minimal' })
        ).toBe(true)
        expect(getBuilderAccount()?.settings.style).toBe('minimal')
    })

    it('treats blocked storage as no account instead of throwing', () => {
        storageSpies.push(
            vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
                throw new DOMException('denied', 'SecurityError')
            })
        )
        vi.spyOn(console, 'warn').mockImplementation(() => undefined)

        expect(getBuilderAccount()).toBeNull()
    })

    it('reports a settings write the browser refuses', () => {
        saveBuilderAccount({ puuid: PUUID, settings: SETTINGS })
        storageSpies.push(
            vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
                throw new DOMException('full', 'QuotaExceededError')
            })
        )
        const reported = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined)

        expect(updateBuilderSettings(PUUID, SETTINGS)).toBe(false)
        expect(reported).toHaveBeenCalled()
    })

    it('fails loudly when the account itself cannot be saved', () => {
        storageSpies.push(
            vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
                throw new DOMException('full', 'QuotaExceededError')
            })
        )

        expect(() =>
            saveBuilderAccount({ puuid: PUUID, settings: SETTINGS })
        ).toThrow(BuilderStorageError)
    })
})
