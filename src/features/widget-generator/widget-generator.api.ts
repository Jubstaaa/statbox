import { queryOptions, skipToken } from '@tanstack/react-query'
import { z } from 'zod'

import type { RankedQueue, Region } from '@/lib/riot/riot.types'

import {
    puuidSchema,
    regionSchema,
    riotDataSchema,
} from '@/lib/riot/riot.schemas'

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

interface SummonerTarget {
    puuid: string
    queue: RankedQueue
    region: Region
}

export class SummonerRequestError extends Error {
    constructor(
        readonly status: number,
        message: string
    ) {
        super(message)
        this.name = 'SummonerRequestError'
    }
}

export async function fetchSummonerByPuuid({
    puuid,
    queue,
    region,
}: SummonerTarget) {
    const params = new URLSearchParams({ queue, region })

    const response = await fetch(
        `/api/summoner/${encodeURIComponent(puuid)}?${params.toString()}`,
        { cache: 'no-cache' }
    )

    return readBody(response, riotDataSchema)
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

export function summonerQueryOptions(target: null | SummonerTarget) {
    return queryOptions({
        queryFn: target ? () => fetchSummonerByPuuid(target) : skipToken,
        queryKey: ['summoner', target?.puuid, target?.region, target?.queue],
    })
}

async function readBody<T>(response: Response, schema: z.ZodType<T>) {
    if (!response.ok) {
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
