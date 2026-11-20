'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '@/lib/zod-config'

export const QUERY_CLIENT_DEFAULT_OPTIONS = {
    queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        // The API lets browsers reuse a summoner answer for 60 s, so a screen
        // that mounts right after another fetched it reads the cache instead.
        // The widget's polling interval is unaffected.
        staleTime: 60_000,
    },
} as const

interface QueryProviderProps {
    children: ReactNode
}

export default function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: QUERY_CLIENT_DEFAULT_OPTIONS,
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
