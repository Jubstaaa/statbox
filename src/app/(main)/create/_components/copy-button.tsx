'use client'

import { Check, Copy, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import Button from '@/components/button'

export interface CopyButtonProps {
    text: string
}

type CopyState = 'copied' | 'failed' | 'idle'

const RESET_AFTER_MS = 2000

const ANNOUNCEMENTS: Record<CopyState, string> = {
    copied: 'Copied',

    failed: 'Copy failed, select the URL and copy it manually',
    idle: '',
}

export default function CreateCopyButton({ text }: CopyButtonProps) {
    const [state, setState] = useState<CopyState>('idle')

    useEffect(() => {
        if (state === 'idle') return

        const timer = setTimeout(() => {
            setState('idle')
        }, RESET_AFTER_MS)

        return () => {
            clearTimeout(timer)
        }
    }, [state])

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(text).then(
            () => {
                setState('copied')
            },
            (error: unknown) => {
                console.error('[copy-button] clipboard write failed:', error)
                setState('failed')
            }
        )
    }, [text])

    const Icon = { copied: Check, failed: X, idle: Copy }[state]

    return (
        <>
            <Button onClick={handleCopy} size="sm" variant="outline">
                <Icon
                    aria-hidden="true"
                    className={
                        state === 'copied' ? 'text-win h-3 w-3' : 'h-3 w-3'
                    }
                />
                {
                    { copied: 'Copied', failed: 'Copy failed', idle: 'Copy' }[
                        state
                    ]
                }
            </Button>
            <span className="sr-only" role="status">
                {ANNOUNCEMENTS[state]}
            </span>
        </>
    )
}
