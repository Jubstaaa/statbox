import type { NextRequest } from 'next/server'

import { z } from 'zod'

import {
    errorResponse,
    jsonResponse,
    riotFailureResponse,
} from '@/app/api/summoner/_lib/responses'
import { resolvePuuidByRiotId } from '@/lib/riot/riot'
import { regionSchema } from '@/lib/riot/riot.schemas'

const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400'

const noUrlSyntax = (value: string) =>
    !/[/?#%\\]/.test(value) && !/^\.+$/.test(value)

const querySchema = z.object({
    name: z.string().trim().min(1).max(16).refine(noUrlSyntax),
    region: regionSchema,
    tag: z
        .string()
        .trim()
        .transform(value => value.replace(/^#/, ''))
        .pipe(z.string().min(1).max(5).refine(noUrlSyntax)),
})

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const parsed = querySchema.safeParse({
        name: searchParams.get('name'),
        region: searchParams.get('region'),
        tag: searchParams.get('tag'),
    })

    if (!parsed.success) return errorResponse(400, 'Invalid parameters')

    const { name, region, tag } = parsed.data

    try {
        const puuid = await resolvePuuidByRiotId(name, tag, region)
        if (!puuid) return errorResponse(404, 'Summoner not found')

        return jsonResponse({ puuid, region }, CACHE_CONTROL)
    } catch (error) {
        return riotFailureResponse('api/summoner/resolve', error)
    }
}
