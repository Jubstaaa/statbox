import { afterEach, describe, expect, it, vi } from 'vitest'

import { getDdragonVersion } from './ddragon'

function respondWith(body: unknown, status = 200) {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        Response.json(body, { status })
    )
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe('getDdragonVersion', () => {
    it('uses the newest version Data Dragon lists', async () => {
        respondWith(['16.23.1', '16.22.1'])

        expect(await getDdragonVersion()).toBe('16.23.1')
    })

    it.each([
        ['a non-array body', { latest: '16.24.1' }],
        ['an empty list', []],
        ['a non-string version', [1624]],
        ['an empty version string', ['']],
    ])('keeps the last good version on %s', async (_, body) => {
        respondWith(['16.23.1'])
        await getDdragonVersion()
        vi.spyOn(console, 'error').mockImplementation(() => undefined)

        respondWith(body)

        expect(await getDdragonVersion()).toBe('16.23.1')
    })

    it('keeps the last good version when the lookup fails', async () => {
        respondWith(['16.23.1'])
        await getDdragonVersion()
        vi.spyOn(console, 'error').mockImplementation(() => undefined)

        respondWith('down', 503)

        expect(await getDdragonVersion()).toBe('16.23.1')
    })
})
