import pThrottle from 'p-throttle'
import pTimeout from 'p-timeout'
import { RateLimitError } from 'twisted'

import { RiotRateLimitedError } from './riot.errors'

const DEFAULT_RETRY_AFTER_SECONDS = 10

const blockedUntil = new Map<string, number>()

const SHORT_WINDOW = { interval: 1000, limit: 20 }
const LONG_WINDOW = { interval: 120_000, limit: 100 }

const MAX_QUEUE_WAIT_MS = 10_000
const BUDGET_RETRY_AFTER_SECONDS = 30

const SHORT_QUEUE_CAP =
    (SHORT_WINDOW.limit * MAX_QUEUE_WAIT_MS) / SHORT_WINDOW.interval

function budgetExhausted() {
    return new RiotRateLimitedError(BUDGET_RETRY_AFTER_SECONDS)
}

function createBudget() {
    const longWindow = pThrottle({ ...LONG_WINDOW, strict: true })(() =>
        Promise.resolve()
    )
    const shortWindow = pThrottle({ ...SHORT_WINDOW, strict: true })((
        signal: AbortSignal
    ) => {
        signal.throwIfAborted()
        if (longWindow.queueSize > 0) throw budgetExhausted()

        return longWindow()
    })

    return { longWindow, shortWindow }
}

const budgets = new Map<string, ReturnType<typeof createBudget>>()

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

function remainingSeconds(routing: string, now: number): number {
    const until = blockedUntil.get(routing) ?? 0

    return Math.max(0, Math.ceil((until - now) / 1000))
}

async function waitForBudget(routing: string) {
    let budget = budgets.get(routing)
    if (!budget) {
        budget = createBudget()
        budgets.set(routing, budget)
    }

    if (
        budget.longWindow.queueSize > 0 ||
        budget.shortWindow.queueSize >= SHORT_QUEUE_CAP
    ) {
        throw budgetExhausted()
    }

    const gaveUp = new AbortController()
    try {
        await pTimeout(budget.shortWindow(gaveUp.signal), {
            message: budgetExhausted(),
            milliseconds: MAX_QUEUE_WAIT_MS,
        })
    } catch (error) {
        gaveUp.abort()
        throw error
    }
}
