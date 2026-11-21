import { GenericError, RateLimitError } from 'twisted'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RiotRateLimitedError } from './riot.errors'
import { callRiot } from './riot.gate'

type RateLimits = ConstructorParameters<typeof RateLimitError>[0]

function rateLimited(retryAfter: number) {
    return new RateLimitError({ RetryAfter: retryAfter } as RateLimits)
}

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    // Lets each test start with every region's gate closed.
    vi.advanceTimersByTime(24 * 60 * 60 * 1000)
    vi.useRealTimers()
})

describe('callRiot', () => {
    it('returns what the request resolves with', async () => {
        await expect(callRiot('euw1', async () => 'ok')).resolves.toBe('ok')
    })

    it('turns a 429 into RiotRateLimitedError carrying Retry-After', async () => {
        const error = await callRiot('kr', () =>
            Promise.reject(rateLimited(30))
        ).catch((caught: unknown) => caught)

        expect(error).toBeInstanceOf(RiotRateLimitedError)
        expect((error as RiotRateLimitedError).retryAfterSeconds).toBe(30)
    })

    it('fails fast without calling Riot until Retry-After has passed', async () => {
        await callRiot('na1', () => Promise.reject(rateLimited(30))).catch(
            () => undefined
        )
        const request = vi.fn(async () => 'ok')

        vi.advanceTimersByTime(10_000)
        const error = await callRiot('na1', request).catch(
            (caught: unknown) => caught
        )

        expect(request).not.toHaveBeenCalled()
        expect(error).toBeInstanceOf(RiotRateLimitedError)
        expect((error as RiotRateLimitedError).retryAfterSeconds).toBe(20)

        vi.advanceTimersByTime(20_000)
        await expect(callRiot('na1', request)).resolves.toBe('ok')
    })

    it('only backs off the routing value that was rate limited', async () => {
        await callRiot('europe', () => Promise.reject(rateLimited(60))).catch(
            () => undefined
        )

        await expect(callRiot('asia', async () => 'ok')).resolves.toBe('ok')
    })

    it('backs off for a default period when Retry-After is missing', async () => {
        await callRiot('br1', () => Promise.reject(rateLimited(0))).catch(
            () => undefined
        )
        const error = await callRiot('br1', async () => 'ok').catch(
            (caught: unknown) => caught
        )

        expect(error).toBeInstanceOf(RiotRateLimitedError)
    })

    it('rethrows other errors unchanged and does not back off', async () => {
        const notFound = new GenericError({} as RateLimits, {
            message: 'Not found',
            name: 'HttpError',
            response: { status: 404 },
        })

        await expect(
            callRiot('tr1', () => Promise.reject(notFound))
        ).rejects.toBe(notFound)
        await expect(callRiot('tr1', async () => 'ok')).resolves.toBe('ok')
    })

    // Each test below uses routing values no other test touches, since the
    // module keeps its windows for the life of the process.
    //
    // The deployed key is a personal one: 20 calls per second and 100 per
    // two minutes, counted per routing value.
    describe('personal key budget', () => {
        function callMany(routing: string, count: number) {
            const request = vi.fn(async () => 'ok')
            const results = Array.from({ length: count }, () =>
                callRiot(routing, request).catch((caught: unknown) => caught)
            )

            return { request, results }
        }

        it('holds the 21st call within one second until the window moves', async () => {
            const { request, results } = callMany('jp1', 21)

            await vi.advanceTimersByTimeAsync(0)
            expect(request).toHaveBeenCalledTimes(20)

            await vi.advanceTimersByTimeAsync(1000)
            expect(request).toHaveBeenCalledTimes(21)
            expect(await Promise.all(results)).toEqual(Array(21).fill('ok'))
        })

        it('does not send the 101st call within two minutes', async () => {
            const { request, results } = callMany('sea', 100)
            await vi.advanceTimersByTimeAsync(10_000)
            expect(request).toHaveBeenCalledTimes(100)
            expect(await Promise.all(results)).toEqual(Array(100).fill('ok'))

            const late = callRiot('sea', request).catch(
                (caught: unknown) => caught
            )
            await vi.advanceTimersByTimeAsync(60_000)

            expect(request).toHaveBeenCalledTimes(100)
            expect(await late).toBeInstanceOf(RiotRateLimitedError)
        })

        it('keeps the budgets of routing values apart', async () => {
            callMany('ph2', 25)
            const { request } = callMany('oc1', 20)

            await vi.advanceTimersByTimeAsync(0)
            expect(request).toHaveBeenCalledTimes(20)
        })
    })
})
