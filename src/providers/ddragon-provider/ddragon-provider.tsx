'use client'

import { createContext, useContext } from 'react'

import type { DdragonProviderProps } from './ddragon-provider.types'

const DdragonVersionContext = createContext<string | null>(null)

export function useDdragonVersion() {
    const version = useContext(DdragonVersionContext)

    if (!version) {
        throw new Error('useDdragonVersion must be used within DdragonProvider')
    }

    return version
}

export default function DdragonProvider({
    children,
    version,
}: DdragonProviderProps) {
    return (
        <DdragonVersionContext value={version}>
            {children}
        </DdragonVersionContext>
    )
}
