'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import { createQueryClient } from '@/lib/query-client'

import '@/lib/zod-config'

interface QueryProviderProps {
    children: ReactNode
}

export default function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(createQueryClient)

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
