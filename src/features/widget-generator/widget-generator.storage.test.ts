// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { BuilderSettings } from './widget-generator.payload'
import {
    BuilderStorageError,
    clearBuilderAccount,
    getBuilderAccount,
    saveBuilderAccount,
    subscribeToBuilderAccount,
    updateBuilderSettings,
} from './widget-generator.storage'

// The keys are the on-disk contract with browsers that already saved an
// account, so they are spelled out rather than imported.
const ACCOUNT_KEY = 'statbox.builder.account'
const LEGACY_PUUID_KEY = 'statbox.builder.puuid'
const LEGACY_SETTINGS_KEY = 'statbox.builder.settings'

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
    storageSpies.splice(0).forEach(spy => {
        spy.mockRestore()
    })
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

    it('stores the account and its settings as one record', () => {
        saveBuilderAccount({ puuid: PUUID, settings: SETTINGS })

        expect(window.localStorage.length).toBe(1)
        expect(
            JSON.parse(window.localStorage.getItem(ACCOUNT_KEY) ?? '')
        ).toEqual({ puuid: PUUID, settings: SETTINGS })
    })

    // Two keys written one after the other could pair the old PUUID with the
    // new region when the second write failed. Whatever write fails, the
    // stored account must be the old one or the new one, never a mix.
    it('never pairs one account with the settings of another', () => {
        const next = {
            puuid: 'h'.repeat(78),
            settings: { ...SETTINGS, region: 'NA' as const },
        }
        saveBuilderAccount({ puuid: PUUID, settings: SETTINGS })
        const setItem = window.localStorage.setItem.bind(window.localStorage)
        let writes = 0
        storageSpies.push(
            vi
                .spyOn(window.localStorage, 'setItem')
                .mockImplementation((key: string, value: string) => {
                    writes += 1
                    if (writes > 1) {
                        throw new DOMException('full', 'QuotaExceededError')
                    }
                    setItem(key, value)
                })
        )

        try {
            saveBuilderAccount(next)
        } catch (error) {
            expect(error).toBeInstanceOf(BuilderStorageError)
        }

        expect([{ puuid: PUUID, settings: SETTINGS }, next]).toContainEqual(
            getBuilderAccount()
        )
    })

    it('moves an account saved under the two old keys into one record', () => {
        window.localStorage.setItem(LEGACY_PUUID_KEY, PUUID)
        window.localStorage.setItem(
            LEGACY_SETTINGS_KEY,
            JSON.stringify(SETTINGS)
        )

        expect(getBuilderAccount()).toEqual({
            puuid: PUUID,
            settings: SETTINGS,
        })
        expect(window.localStorage.getItem(LEGACY_PUUID_KEY)).toBeNull()
        expect(window.localStorage.getItem(LEGACY_SETTINGS_KEY)).toBeNull()
        expect(
            JSON.parse(window.localStorage.getItem(ACCOUNT_KEY) ?? '')
        ).toEqual({ puuid: PUUID, settings: SETTINGS })
    })

    describe('when the browser refuses the migration write', () => {
        function seedLegacyAccountAndRefuseWrites() {
            window.localStorage.setItem(LEGACY_PUUID_KEY, PUUID)
            window.localStorage.setItem(
                LEGACY_SETTINGS_KEY,
                JSON.stringify(SETTINGS)
            )
            const refusal = vi
                .spyOn(window.localStorage, 'setItem')
                .mockImplementation(() => {
                    throw new DOMException('full', 'QuotaExceededError')
                })
            storageSpies.push(refusal)

            return refusal
        }

        // The module warns about blocked storage once per page, so each test
        // loads a fresh copy to see its own warning.
        async function loadStore() {
            vi.resetModules()
            return import('./widget-generator.storage')
        }

        it('still uses the account, keeps the old keys and reports the refusal', async () => {
            seedLegacyAccountAndRefuseWrites()
            const warn = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => undefined)
            const store = await loadStore()

            expect(store.getBuilderAccount()).toEqual({
                puuid: PUUID,
                settings: SETTINGS,
            })
            expect(window.localStorage.getItem(LEGACY_PUUID_KEY)).toBe(PUUID)
            expect(
                window.localStorage.getItem(LEGACY_SETTINGS_KEY)
            ).not.toBeNull()
            expect(warn).toHaveBeenCalledOnce()
        })

        it('forgets the old keys too on disconnect', async () => {
            const refusal = seedLegacyAccountAndRefuseWrites()
            vi.spyOn(console, 'warn').mockImplementation(() => undefined)
            const store = await loadStore()
            store.getBuilderAccount()
            refusal.mockRestore()

            store.clearBuilderAccount()

            expect(window.localStorage.length).toBe(0)
            expect(store.getBuilderAccount()).toBeNull()
        })
    })

    it('has no account when the old keys hold a PUUID without settings, so no region is guessed', () => {
        window.localStorage.setItem(LEGACY_PUUID_KEY, PUUID)

        expect(getBuilderAccount()).toBeNull()
    })

    it.each([
        ['a malformed PUUID', { puuid: 'not-a-puuid', settings: SETTINGS }],
        ['missing settings', { puuid: PUUID }],
        [
            'settings for an unknown region',
            { puuid: PUUID, settings: { ...SETTINGS, region: 'MARS' } },
        ],
    ])('has no account for %s', (_, record) => {
        window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(record))

        expect(getBuilderAccount()).toBeNull()
    })

    it('has no account for an unparseable record', () => {
        window.localStorage.setItem(ACCOUNT_KEY, '{')

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

        expect(() => {
            saveBuilderAccount({ puuid: PUUID, settings: SETTINGS })
        }).toThrow(BuilderStorageError)
    })
})
