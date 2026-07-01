import type { NextRequest } from 'next/server'
import { z } from 'zod'

import { decodeWidgetRoutePayload } from '@/components/widget-generator/widget-generator.payload'
import { fetchRiotDataByPuuid } from '@/lib/riot/riot'
import { rankedQueueSchema, regionSchema } from '@/lib/riot/riot.schemas'
import type { RankedQueue, Region } from '@/lib/riot/riot.types'

const querySchema = z.object({
    queue: rankedQueueSchema.optional(),
    region: regionSchema,
    session: z.string().optional(),
})

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const rawPayload = request.nextUrl.pathname.split('/').pop()?.trim() ?? ''
    const payload = decodeURIComponent(rawPayload)
    const decodedPayload = decodeWidgetRoutePayload(payload)
    const parsed = querySchema.safeParse({
        queue: searchParams.get('queue') ?? undefined,
        region: searchParams.get('region') ?? '',
        session: searchParams.get('session') ?? undefined,
    })

    if ((!parsed.success && !decodedPayload) || !payload) {
        return Response.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const queue =
        decodedPayload?.queue ??
        (parsed.success ? (parsed.data.queue ?? 'solo') : 'solo')
    const fallbackRegion = parsed.success ? parsed.data.region : null
    const region = decodedPayload?.region ?? fallbackRegion
    if (!region) {
        return Response.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    try {
        const data = decodedPayload
            ? await fetchRiotDataByPuuid(
                  decodedPayload.puuid,
                  region as Region,
                  queue as RankedQueue
              )
            : await fetchRiotDataByPuuid(
                  payload,
                  region as Region,
                  queue as RankedQueue
              )
        return Response.json(data)
    } catch {
        return Response.json({ error: 'Summoner not found' }, { status: 404 })
    }
}
