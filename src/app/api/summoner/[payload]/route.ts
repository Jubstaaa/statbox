import type { NextRequest } from 'next/server'

import {
    errorResponse,
    jsonResponse,
    riotFailureResponse,
} from '@/app/api/summoner/_lib/responses'
import { parseWidgetTarget } from '@/features/widget-generator/widget-generator.payload'
import { fetchRiotDataByPuuid } from '@/lib/riot/riot'

// The server keeps widget data for five minutes; the edge and the browser may
// reuse a response for one more, well inside the widget's 120 s poll.
const CACHE_CONTROL = 'public, max-age=60, s-maxage=60'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ payload: string }> }
) {
    const { payload } = await params
    const target = parseWidgetTarget(payload, request.nextUrl.searchParams)

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
