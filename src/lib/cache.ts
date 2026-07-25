import { type Client, createClient } from '@libsql/client'

// Stands in for @vercel/functions' getCache, which only exists on Vercel. Backed
// by a local libsql/SQLite file — the same driver the other apps on this droplet
// already run under Alpine — bind-mounted so the cache survives redeploys.
//
// Persistence is the point, not an optimisation: match details are cached for 90
// days and the Riot API is rate limited, so an empty cache after every deploy
// costs quota, not just latency.

interface CacheSetOptions {
    // Accepted so call sites read the same as they did on Vercel, and then
    // ignored: nothing in this app invalidates by tag, so persisting them would
    // be dead weight. If tag invalidation is ever needed, that is the moment to
    // add a tags table — not before.
    tags?: string[]
    ttl?: number
}

export interface Cache {
    get(key: string): Promise<unknown>
    set(key: string, value: unknown, options?: CacheSetOptions): Promise<void>
}

const DEFAULT_TTL_SECONDS = 300
// Expired rows are skipped on read, so pruning is only about disk. Doing it on a
// small fraction of writes keeps it free of timers and cheap under load.
const PRUNE_CHANCE = 0.02

let client: Client | undefined
let schema: Promise<void> | undefined

function getClient(): Client {
    client ??= createClient({
        url: process.env.CACHE_DATABASE_URI ?? 'file:./statbox-cache.db',
    })

    return client
}

function initSchema(): Promise<void> {
    if (!schema) {
        schema = (async () => {
            const db = getClient()
            await db.execute(
                'CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires_at INTEGER NOT NULL)'
            )
            await db.execute(
                'CREATE INDEX IF NOT EXISTS cache_expires_at ON cache (expires_at)'
            )
        })().catch((error: unknown) => {
            // Never memoise a failure: a transient error would otherwise leave
            // the cache dead for the lifetime of the process.
            schema = undefined
            throw error
        })
    }

    return schema
}

async function prune(): Promise<void> {
    await getClient().execute({
        args: [Date.now()],
        sql: 'DELETE FROM cache WHERE expires_at <= ?',
    })
}

// A cache must not be able to fail a request: every Riot call has a live fallback
// path, so a broken cache should mean a slower correct response, not a 500. It is
// logged rather than swallowed so the failure is still discoverable.
function report(operation: string, error: unknown): void {
    console.error(`[cache] ${operation} failed:`, error)
}

export function getCache({ namespace }: { namespace: string }): Cache {
    const scoped = (key: string) => `${namespace}:${key}`

    return {
        async get(key) {
            try {
                await initSchema()

                const result = await getClient().execute({
                    args: [scoped(key), Date.now()],
                    sql: 'SELECT value FROM cache WHERE key = ? AND expires_at > ?',
                })
                const value = result.rows[0]?.value

                if (typeof value !== 'string') return undefined

                return JSON.parse(value)
            } catch (error) {
                report(`get ${scoped(key)}`, error)

                return undefined
            }
        },

        async set(key, value, options) {
            try {
                await initSchema()

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
