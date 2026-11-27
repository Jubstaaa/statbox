import { type Client, createClient } from '@libsql/client'

export interface Cache {
    get(key: string): Promise<unknown>
    set(key: string, value: unknown, options?: CacheSetOptions): Promise<void>
}

interface CacheSetOptions {
    ttl?: number
}

const DEFAULT_TTL_SECONDS = 300

const PRUNE_CHANCE = 0.02

let client: Client | undefined
let schema: Promise<void> | undefined

export async function checkCacheHealth(): Promise<void> {
    await getClient().execute('SELECT 1 FROM cache LIMIT 1')
}

export function getCache({ namespace }: { namespace: string }): Cache {
    const scoped = (key: string) => `${namespace}:${key}`

    return {
        async get(key) {
            try {
                await initCacheSchema()

                const result = await getClient().execute({
                    args: [scoped(key), Date.now()],
                    sql: 'SELECT value FROM cache WHERE key = ? AND expires_at > ?',
                })
                const value = result.rows[0]?.value

                if (typeof value !== 'string') return undefined

                return JSON.parse(value) as unknown
            } catch (error) {
                report(`get ${scoped(key)}`, error)

                return undefined
            }
        },

        async set(key, value, options) {
            try {
                await initCacheSchema()

                const ttl = options?.ttl ?? DEFAULT_TTL_SECONDS

                await getClient().execute({
                    args: [
                        scoped(key),
                        JSON.stringify(value),
                        Date.now() + ttl * 1000,
                    ],
                    sql: 'INSERT INTO cache (key, value, expires_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at',
                })

                if (Math.random() < PRUNE_CHANCE) await prune()
            } catch (error) {
                report(`set ${scoped(key)}`, error)
            }
        },
    }
}

export function initCacheSchema(): Promise<void> {
    schema ??= (async () => {
        const db = getClient()
        await db.execute(
            'CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires_at INTEGER NOT NULL)'
        )
        await db.execute(
            'CREATE INDEX IF NOT EXISTS cache_expires_at ON cache (expires_at)'
        )
    })().catch((error: unknown) => {
        schema = undefined
        throw error
    })

    return schema
}

function getClient(): Client {
    client ??= createClient({
        url: process.env.CACHE_DATABASE_URI ?? 'file:./statbox-cache.db',
    })

    return client
}

async function prune(): Promise<void> {
    await getClient().execute({
        args: [Date.now()],
        sql: 'DELETE FROM cache WHERE expires_at <= ?',
    })
}

function report(operation: string, error: unknown): void {
    console.error(`[cache] ${operation} failed:`, error)
}
