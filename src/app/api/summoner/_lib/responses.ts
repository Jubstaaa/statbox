import {
    getRiotErrorStatus,
    RiotRateLimitedError,
} from '@/lib/riot/riot.errors'

const NO_STORE = { 'Cache-Control': 'no-store' }

export function errorResponse(
    status: number,
    error: string,
    headers: Record<string, string> = {}
) {
    return Response.json(
        { error },
        { headers: { ...NO_STORE, ...headers }, status }
    )
}

export function jsonResponse(body: unknown, cacheControl: string) {
    return Response.json(body, { headers: { 'Cache-Control': cacheControl } })
}

export function riotFailureResponse(route: string, error: unknown) {
    if (error instanceof RiotRateLimitedError) {
        return errorResponse(503, 'Riot API is busy, try again shortly', {
            'Retry-After': String(error.retryAfterSeconds),
        })
    }

    const status = getRiotErrorStatus(error)
    if (status === 404) return errorResponse(404, 'Summoner not found')

    console.error(`[${route}] Riot request failed`, { error, status })

    return errorResponse(502, 'Riot API request failed')
}
