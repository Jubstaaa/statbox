'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { QUERY_CLIENT_DEFAULT_OPTIONS } from './query-provider.constants'
import type { QueryProviderProps } from './query-provider.types'

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
