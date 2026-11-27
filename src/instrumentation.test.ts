import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

const dir = mkdtempSync(join(tmpdir(), 'statbox-startup-'))

afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.resetModules()
})

afterAll(() => {
    rmSync(dir, { force: true, recursive: true })
})

async function startServerOn(file: string, runtime = 'nodejs') {
    vi.stubEnv('CACHE_DATABASE_URI', `file:${join(dir, file)}`)
    vi.stubEnv('NEXT_RUNTIME', runtime)
    const { register } = await import('./instrumentation')
    const { checkCacheHealth } = await import('@/lib/cache')
    await register()

    return checkCacheHealth
}

describe('server startup', () => {
    it('creates the cache schema so an empty data directory is healthy', async () => {
        const checkCacheHealth = await startServerOn('fresh.db')

        await expect(checkCacheHealth()).resolves.toBeUndefined()
    })

    it('keeps the health check failing when the database file is unreadable', async () => {
        writeFileSync(join(dir, 'garbage.db'), 'this is not a SQLite database')
        const reported = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined)

        const checkCacheHealth = await startServerOn('garbage.db')

        expect(reported).toHaveBeenCalled()
        await expect(checkCacheHealth()).rejects.toThrow()
    })

    it('leaves the cache alone in the edge runtime', async () => {
        const checkCacheHealth = await startServerOn('edge.db', 'edge')

        await expect(checkCacheHealth()).rejects.toThrow()
    })
})
