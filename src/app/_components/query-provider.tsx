'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '@/lib/zod-config'

const QUERY_CLIENT_DEFAULT_OPTIONS = {
    queries: {
        refetchOnWindowFocus: false,
        retry: 1,
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
