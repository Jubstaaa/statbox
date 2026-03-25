export const QUERY_CLIENT_DEFAULT_OPTIONS = {
    queries: {
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 1000 * 60 * 5,
    },
} as const
