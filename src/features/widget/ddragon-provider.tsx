'use client'

import type { ReactNode } from 'react'

import { createContext, useContext } from 'react'

export interface DdragonProviderProps {
    children: ReactNode
    version: string
}

const DdragonVersionContext = createContext<null | string>(null)

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

export function useDdragonVersion() {
    const version = useContext(DdragonVersionContext)

    if (!version) {
        throw new Error('useDdragonVersion must be used within DdragonProvider')
    }

    return version
}
