import type { NextRequest } from 'next/server'
import { z } from 'zod'

import {
    decodeLegacyWidgetRoutePayload,
    decodeWidgetRoutePayload,
} from '@/components/widget-generator/widget-generator.utils'
import { fetchRiotData, fetchRiotDataByPuuid } from '@/lib/riot/riot'
import type { RankedQueue, Region, RiotData } from '@/lib/riot/riot.types'

const querySchema = z.object({
    queue: z.enum(['solo', 'flex']).optional(),
    region: z.enum(['TR', 'EUW', 'EUNE', 'NA', 'KR']),
    session: z.string().optional(),
})

const CACHE_TTL = 60_000

interface CacheEntry {
    data: RiotData
    expiresAt: number
}

const cache = new Map<string, CacheEntry>()

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const puuid = request.nextUrl.pathname.split('/').pop()?.trim() ?? ''
    const decodedPayload = decodeWidgetRoutePayload(puuid)
    const legacyDecodedPayload = decodeLegacyWidgetRoutePayload(puuid)
    const parsed = querySchema.safeParse({
        queue: searchParams.get('queue') ?? undefined,
        region: searchParams.get('region') ?? '',
        session: searchParams.get('session') ?? undefined,
    })

    if (
        (!parsed.success && !decodedPayload && !legacyDecodedPayload) ||
        !puuid
    ) {
        return Response.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const queue =
        decodedPayload?.queue ??
        (parsed.success ? (parsed.data.queue ?? 'solo') : 'solo')
    const fallbackRegion = parsed.success ? parsed.data.region : null
    const region =
        decodedPayload?.region ?? legacyDecodedPayload?.region ?? fallbackRegion
    if (!region) {
        return Response.json({ error: 'Invalid parameters' }, { status: 400 })
    }
    const key = decodedPayload?.puuid
        ? `${decodedPayload.puuid}@${region}@${queue}`
        : legacyDecodedPayload
          ? `${legacyDecodedPayload.name}#${legacyDecodedPayload.tag}@${region}@${queue}`
          : `${puuid}@${region}@${queue}`

    const cached = cache.get(key)
    if (cached && cached.expiresAt > Date.now()) {
        return Response.json(cached.data, {
            headers: { 'X-Cache': 'HIT' },
        })
    }

    try {
        const data = decodedPayload
            ? await fetchRiotDataByPuuid(
                  decodedPayload.puuid,
                  region as Region,
                  queue as RankedQueue
              )
            : legacyDecodedPayload
              ? await fetchRiotData(
                    legacyDecodedPayload.name,
                    legacyDecodedPayload.tag,
                    region as Region,
                    queue as RankedQueue
                )
              : await fetchRiotDataByPuuid(
                    puuid,
                    region as Region,
                    queue as RankedQueue
                )
        cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL })
        return Response.json(data, {
            headers: { 'X-Cache': 'MISS' },
        })
    } catch {
        return Response.json({ error: 'Summoner not found' }, { status: 404 })
    }
}
