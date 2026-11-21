import pThrottle from 'p-throttle'
import pTimeout from 'p-timeout'
import { RateLimitError } from 'twisted'

import { RiotRateLimitedError } from './riot.errors'

// Riot omits Retry-After on some 429s (underlying service limits); back off
// briefly anyway rather than hammering a limiter that just refused us.
const DEFAULT_RETRY_AFTER_SECONDS = 10

// Riot counts rate limits per routing value (euw1, europe, …), so a 429 on one
// must not stop calls to the others. Keyed by routing value, so it stays as
// small as the list of Riot regions.
const blockedUntil = new Map<string, number>()

// The deployed key is a personal one: 20 calls per second and 100 per two
// minutes, per routing value. A cold widget costs about 25 calls (account,
// summoner, league, match list and 20 match details), 22 of them on the
// shared regional value (europe, americas, asia, sea), so four cold widgets
// in two minutes use a region's whole budget. A warm widget polls every
// 120 s but its data is cached for 5 minutes, so it costs about two calls
// (match list, league) plus any new match per 5 minutes: the budget carries
// roughly a hundred open widgets per region once they are warm.
const SHORT_WINDOW = { interval: 1000, limit: 20 }
const LONG_WINDOW = { interval: 120_000, limit: 100 }
// A call that cannot start within this long is answered as rate limited
// instead of holding the request open for up to two minutes (Cloudflare
// drops it at 100 s); the widget keeps its last data and polls again.
const MAX_QUEUE_WAIT_MS = 10_000
const BUDGET_RETRY_AFTER_SECONDS = 30

// Strict mode is a sliding window, so no alignment with Riot's own windows
// can let two of ours fit inside one of theirs.
function createBudget() {
    const longWindow = pThrottle({ ...LONG_WINDOW, strict: true })
    const shortWindow = pThrottle({ ...SHORT_WINDOW, strict: true })

    return shortWindow(longWindow(async () => undefined))
}

const budgets = new Map<string, ReturnType<typeof createBudget>>()

// Resolves once both windows have room for one more call on `routing`.
// A caller that gave up still uses the slot it reserved, so the local
// count only ever overestimates what Riot has seen.
async function waitForBudget(routing: string) {
    let budget = budgets.get(routing)
    if (!budget) {
        budget = createBudget()
        budgets.set(routing, budget)
    }

    await pTimeout(budget(), {
        message: new RiotRateLimitedError(BUDGET_RETRY_AFTER_SECONDS),
        milliseconds: MAX_QUEUE_WAIT_MS,
    })
}

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

    await waitForBudget(routing)

    try {
        return await request()
    } catch (error) {
        if (!(error instanceof RateLimitError)) throw error

        const retryAfter =
            (error.rateLimits.RetryAfter ?? 0) || DEFAULT_RETRY_AFTER_SECONDS
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
