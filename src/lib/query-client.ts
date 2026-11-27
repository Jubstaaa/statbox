import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: (failureCount, error) =>
                    failureCount < 1 && !isClientError(error),

                staleTime: 60_000,
            },
        },
    })
}

function isClientError(error: Error) {
    const status = 'status' in error ? error.status : undefined

    return typeof status === 'number' && status >= 400 && status < 500
}
