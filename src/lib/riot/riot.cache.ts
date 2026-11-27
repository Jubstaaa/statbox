import type { z } from 'zod'

import pMemoize from 'p-memoize'

import { getCache } from '@/lib/cache'

const cache = getCache({ namespace: 'riot' })

interface CachedLoaderOptions<Args extends unknown[], T> {
    key: (args: NoInfer<Args>) => string
    load: (...args: Args) => Promise<T>

    schema: z.ZodType<T>
    ttlSeconds: ((value: T) => number) | number
}

export function cachedLoader<Args extends unknown[], T>({
    key,
    load,
    schema,
    ttlSeconds,
}: CachedLoaderOptions<Args, T>): (...args: Args) => Promise<T> {
    return pMemoize(
        async (...args: Args): Promise<T> => {
            const cacheKey = key(args)
            const hit = schema.safeParse(await cache.get(cacheKey))
            if (hit.success) return hit.data

            const value = await load(...args)
            const ttl =
                typeof ttlSeconds === 'function'
                    ? ttlSeconds(value)
                    : ttlSeconds
            await cache.set(cacheKey, value, { ttl })

            return value
        },
        { cache: false, cacheKey: (args: Args) => key(args) }
    )
}
