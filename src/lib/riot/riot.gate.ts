import { RateLimitError } from 'twisted'

import { RiotRateLimitedError } from './riot.errors'

// Riot omits Retry-After on some 429s (underlying service limits); back off
// briefly anyway rather than hammering a limiter that just refused us.
const DEFAULT_RETRY_AFTER_SECONDS = 10

// Riot counts rate limits per routing value (euw1, europe, …), so a 429 on one
// must not stop calls to the others. Keyed by routing value, so it stays as
// small as the list of Riot regions.
const blockedUntil = new Map<string, number>()

function remainingSeconds(routing: string, now: number): number {
    const until = blockedUntil.get(routing) ?? 0

    return Math.max(0, Math.ceil((until - now) / 1000))
}

// twisted's own retry would hold the HTTP request open for the whole
// Retry-After (up to minutes on an app limit) and then try again for every
// queued caller. Instead the first 429 closes the gate for that routing value
// and every caller fails fast until Riot said it is safe to try again.
// No circuit-breaker library opens for a server-supplied duration, hence this.
export async function callRiot<T>(
    routing: string,
    request: () => Promise<T>
): Promise<T> {
    const waiting = remainingSeconds(routing, Date.now())
    if (waiting > 0) throw new RiotRateLimitedError(waiting)

    try {
        return await request()
    } catch (error) {
        if (!(error instanceof RateLimitError)) throw error

        const retryAfter =
            error.rateLimits.RetryAfter || DEFAULT_RETRY_AFTER_SECONDS
        blockedUntil.set(
            routing,
            Math.max(
                blockedUntil.get(routing) ?? 0,
                Date.now() + retryAfter * 1000
            )
        )

        throw new RiotRateLimitedError(retryAfter)
    }
}
