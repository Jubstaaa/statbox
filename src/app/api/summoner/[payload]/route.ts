import type { NextRequest } from 'next/server'
import { z } from 'zod'

import {
    errorResponse,
    jsonResponse,
    riotFailureResponse,
} from '@/app/api/summoner/_lib/responses'
import { decodeWidgetRoutePayload } from '@/features/widget-generator/widget-generator.payload'
import { fetchRiotDataByPuuid } from '@/lib/riot/riot'
import {
    puuidSchema,
    rankedQueueSchema,
    regionSchema,
} from '@/lib/riot/riot.schemas'

// The server keeps widget data for five minutes; the edge and the browser may
// reuse a response for one more, well inside the widget's 120 s poll.
const CACHE_CONTROL = 'public, max-age=60, s-maxage=60'

const querySchema = z.object({
    puuid: puuidSchema,
    queue: rankedQueueSchema.default('solo'),
    region: regionSchema,
})

// The segment is either a PUUID with region/queue in the query, or an older
// widget payload that carries all three.
function parseTarget(segment: string, searchParams: URLSearchParams) {
    const decoded = decodeWidgetRoutePayload(segment)
    if (decoded) return decoded

    const parsed = querySchema.safeParse({
        puuid: segment,
        queue: searchParams.get('queue') ?? undefined,
        region: searchParams.get('region'),
    })

    return parsed.success ? parsed.data : null
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ payload: string }> }
) {
    const { payload } = await params
    const target = parseTarget(payload, request.nextUrl.searchParams)

    if (!target) return errorResponse(400, 'Invalid parameters')

    try {
        const data = await fetchRiotDataByPuuid(
            target.puuid,
            target.region,
            target.queue
        )

        return jsonResponse(data, CACHE_CONTROL)
    } catch (error) {
        return riotFailureResponse('api/summoner', error)
    }
}
