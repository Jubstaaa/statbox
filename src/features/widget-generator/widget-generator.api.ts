import { queryOptions, skipToken } from '@tanstack/react-query'
import { z } from 'zod'

import {
    puuidSchema,
    regionSchema,
    riotDataSchema,
} from '@/lib/riot/riot.schemas'
import type { RankedQueue, Region } from '@/lib/riot/riot.types'

interface ResolveSummonerParams {
    name: string
    region: Region
    tag: string
}

const resolvedSummonerSchema = z.object({
    puuid: puuidSchema,
    region: regionSchema,
})

const errorBodySchema = z.object({ error: z.string() })

export class SummonerRequestError extends Error {
    constructor(
        readonly status: number,
        message: string
    ) {
        super(message)
        this.name = 'SummonerRequestError'
    }
}

async function readBody<T>(response: Response, schema: z.ZodType<T>) {
    if (!response.ok) {
        // The body is only a nicer message; a proxy's HTML error page has none,
        // and the status alone still tells the caller what happened.
        const body: unknown = await response.json().catch(() => null)
        const parsed = errorBodySchema.safeParse(body)

        throw new SummonerRequestError(
            response.status,
            parsed.success
                ? parsed.data.error
                : `Request failed with ${response.status}`
        )
    }

    return schema.parse(await response.json())
}

export async function resolveSummoner({
    name,
    region,
    tag,
}: ResolveSummonerParams) {
    const params = new URLSearchParams({ name, region, tag })
    const response = await fetch(`/api/summoner/resolve?${params.toString()}`)

    return readBody(response, resolvedSummonerSchema)
}

interface SummonerTarget {
    puuid: string
    queue: RankedQueue
    region: Region
}

export async function fetchSummonerByPuuid({
    puuid,
    queue,
    region,
}: SummonerTarget) {
    const params = new URLSearchParams({ queue, region })
    // Revalidate on every poll: the edge answers from its own short cache, but a
    // browser-cached copy could otherwise keep an overlay frozen for hours.
    const response = await fetch(
        `/api/summoner/${encodeURIComponent(puuid)}?${params.toString()}`,
        { cache: 'no-cache' }
    )

    return readBody(response, riotDataSchema)
}

// The one definition of a summoner query: the landing form prefetches under this
// key so the connected card and /create read the cache instead of refetching.
export function summonerQueryOptions(target: SummonerTarget | null) {
    return queryOptions({
        queryFn: target ? () => fetchSummonerByPuuid(target) : skipToken,
        queryKey: ['summoner', target?.puuid, target?.region, target?.queue],
    })
}
