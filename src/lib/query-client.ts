import { QueryClient } from '@tanstack/react-query'

// A 4xx is the request's fault (bad input, unknown player): asking again gives
// the same answer and only costs Riot quota. Network errors carry no status.
function isClientError(error: Error) {
    const status = 'status' in error ? error.status : undefined

    return typeof status === 'number' && status >= 400 && status < 500
}

export function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: (failureCount, error) =>
                    failureCount < 1 && !isClientError(error),
                // The API lets browsers reuse a summoner answer for 60 s, so a
                // screen that mounts right after another fetched it reads the
                // cache instead. The widget's polling interval is unaffected.
                staleTime: 60_000,
            },
        },
    })
}
