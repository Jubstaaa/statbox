import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import type { Cache } from './cache'

const dir = mkdtempSync(join(tmpdir(), 'statbox-cache-'))

let getCache: (options: { namespace: string }) => Cache

beforeAll(async () => {
    process.env.CACHE_DATABASE_URI = `file:${join(dir, 'cache.db')}`
    // Imported after the env var is set: the client reads it on first use.
    ;({ getCache } = await import('./cache'))
})

afterAll(() => {
    rmSync(dir, { force: true, recursive: true })
})

describe('getCache', () => {
    it('round-trips a value', async () => {
        const cache = getCache({ namespace: 'test' })
        await cache.set('key', { nested: [1, 2] }, { ttl: 60 })

        expect(await cache.get('key')).toEqual({ nested: [1, 2] })
    })

    it('returns undefined for a key that was never set', async () => {
        const cache = getCache({ namespace: 'test' })

        expect(await cache.get('absent')).toBeUndefined()
    })

    it('treats an expired entry as absent', async () => {
        const cache = getCache({ namespace: 'test' })
        await cache.set('stale', 'value', { ttl: -1 })

        expect(await cache.get('stale')).toBeUndefined()
    })

    it('overwrites an existing key rather than failing on the primary key', async () => {
        const cache = getCache({ namespace: 'test' })
        await cache.set('dup', 'first', { ttl: 60 })
        await cache.set('dup', 'second', { ttl: 60 })

        expect(await cache.get('dup')).toBe('second')
    })

    it('keeps namespaces apart', async () => {
        const riot = getCache({ namespace: 'riot' })
        const other = getCache({ namespace: 'other' })
        await riot.set('shared', 'riot-value', { ttl: 60 })
        await other.set('shared', 'other-value', { ttl: 60 })

        expect(await riot.get('shared')).toBe('riot-value')
        expect(await other.get('shared')).toBe('other-value')
    })

    it('accepts tags without persisting them', async () => {
        const cache = getCache({ namespace: 'test' })
        await cache.set('tagged', 'value', { tags: ['puuid:x'], ttl: 60 })

        expect(await cache.get('tagged')).toBe('value')
    })

    // A cache must never fail a request: every Riot call has a live fallback, so
    // an unusable database has to degrade to a miss rather than throw. The spy is
    // what makes this meaningful — without asserting that the failure was actually
    // reported, a module that quietly kept using the working database would pass.
    it('degrades to a miss and reports when the database cannot be opened', async () => {
        vi.resetModules()
        process.env.CACHE_DATABASE_URI = 'file:/nonexistent-dir/cache.db'
        const reported = vi.spyOn(console, 'error').mockImplementation(() => {})

        const { getCache: brokenGetCache } = await import('./cache')
        const cache = brokenGetCache({ namespace: 'test' })

        await expect(
            cache.set('key', 'value', { ttl: 60 })
        ).resolves.toBeUndefined()
        await expect(cache.get('key')).resolves.toBeUndefined()
        expect(reported).toHaveBeenCalled()

        reported.mockRestore()
        process.env.CACHE_DATABASE_URI = `file:${join(dir, 'cache.db')}`
    })
})
