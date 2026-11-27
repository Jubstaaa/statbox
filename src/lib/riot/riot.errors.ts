export class RiotRateLimitedError extends Error {
    override readonly name = 'RiotRateLimitedError'

    constructor(readonly retryAfterSeconds: number) {
        super(`Riot API rate limited, retry in ${retryAfterSeconds}s`)
    }
}

export function getRiotErrorStatus(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) return undefined
    if (!('status' in error) || typeof error.status !== 'number')
        return undefined

    return error.status
}

export function isRiotNotFound(error: unknown): boolean {
    return getRiotErrorStatus(error) === 404
}
