import type { NextRequest } from 'next/server'
import { z } from 'zod'

import { checkRateLimit } from '@/lib/rate-limit'
import { resolvePuuidByRiotId } from '@/lib/riot/riot'
import { regionSchema } from '@/lib/riot/riot.schemas'
import type { Region } from '@/lib/riot/riot.types'

const querySchema = z.object({
    name: z.string().trim().min(1),
    region: regionSchema,
    tag: z
        .string()
        .trim()
        .transform(value => value.replace(/^#/, ''))
        .pipe(z.string().min(1).max(5)),
})

export async function GET(request: NextRequest) {
    const rateLimitError = await checkRateLimit(request)
    if (rateLimitError) return rateLimitError

    const parsed = querySchema.safeParse({
        name: request.nextUrl.searchParams.get('name') ?? '',
        region: request.nextUrl.searchParams.get('region') ?? '',
        tag: request.nextUrl.searchParams.get('tag') ?? '',
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
