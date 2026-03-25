import type { NextRequest } from 'next/server'
import { z } from 'zod'

import { resolvePuuidByRiotId } from '@/lib/riot/riot'
import type { Region } from '@/lib/riot/riot.types'

const querySchema = z.object({
    name: z.string().trim().min(1),
    region: z.enum(['TR', 'EUW', 'EUNE', 'NA', 'KR']),
    tag: z.string().trim().min(1).max(10),
})

export async function GET(request: NextRequest) {
    const parsed = querySchema.safeParse({
        name: request.nextUrl.searchParams.get('name') ?? '',
        region: request.nextUrl.searchParams.get('region') ?? '',
        tag: (request.nextUrl.searchParams.get('tag') ?? '').replace(/^#/, ''),
    })

    if (!parsed.success) {
        return Response.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    try {
        const puuid = await resolvePuuidByRiotId(
            parsed.data.name,
            parsed.data.tag,
            parsed.data.region as Region
        )

        return Response.json({ puuid, region: parsed.data.region })
    } catch {
        return Response.json({ error: 'Summoner not found' }, { status: 404 })
    }
}
