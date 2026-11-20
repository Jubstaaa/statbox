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

export async function fetchSummonerByPuuid({
    puuid,
    queue,
    region,
}: {
    puuid: string
    queue: RankedQueue
    region: Region
}) {
    const params = new URLSearchParams({ queue, region })
    // Revalidate on every poll: the edge answers from its own short cache, but a
    // browser-cached copy could otherwise keep an overlay frozen for hours.
    const response = await fetch(
        `/api/summoner/${encodeURIComponent(puuid)}?${params.toString()}`,
        { cache: 'no-cache' }
    )

    return readBody(response, riotDataSchema)
}

export function describeLookupError(error: unknown) {
    const status = error instanceof SummonerRequestError ? error.status : null

    switch (status) {
        case 400:
            return 'Check the name and tag: a Riot ID cannot contain those characters.'
        case 404:
            return 'Summoner not found. Check the name, tag, and region.'
        case 503:
            return 'Riot is busy right now. Try again in a minute.'
        default:
            return "Couldn't reach Riot right now. Try again shortly."
    }
}
