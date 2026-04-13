import { Ratelimit } from '@upstash/ratelimit'

import { kv } from './kv'

export const ratelimit = new Ratelimit({
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    redis: kv,
})

export async function checkRateLimit(request: Request) {
    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        request.headers.get('x-real-ip') ??
        'anonymous'

    const { success } = await ratelimit.limit(ip)

    if (!success) {
        return Response.json({ error: 'Too many requests' }, { status: 429 })
    }

    return null
}
