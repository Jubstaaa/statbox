import type { NextRequest } from 'next/server'
import { z } from 'zod'

import { resolvePuuidByRiotId } from '@/lib/riot/riot'
import { regionSchema } from '@/lib/riot/riot.schemas'

import {
    errorResponse,
    jsonResponse,
    riotFailureResponse,
} from '../_lib/responses'

// A Riot ID points at the same PUUID until the player renames, so the edge can
// answer repeat lookups for a day.
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400'

// Riot game names are at most 16 characters and tags at most 5. Characters that
// carry URL structure are refused outright: twisted puts both into the request
// path with encodeURI, which leaves them intact.
const noUrlSyntax = (value: string) => !/[/?#%\\]/.test(value)

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
