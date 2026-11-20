'use client'

import { useCallback, useEffect, useState } from 'react'

import { Check, Copy, X } from 'lucide-react'

import Button from '@/components/button'

export interface CopyButtonProps {
    text: string
}

type CopyState = 'copied' | 'failed' | 'idle'

const RESET_AFTER_MS = 2000

const ANNOUNCEMENTS: Record<CopyState, string> = {
    copied: 'Copied',
    // Clipboard access can be denied (permissions, insecure context); the URL
    // is still on screen to copy by hand.
    failed: 'Copy failed, select the URL and copy it manually',
    idle: '',
}

export default function CreateCopyButton({ text }: CopyButtonProps) {
    const [state, setState] = useState<CopyState>('idle')

    useEffect(() => {
        if (state === 'idle') return

        const timer = setTimeout(() => setState('idle'), RESET_AFTER_MS)

        return () => clearTimeout(timer)
    }, [state])

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text)
            setState('copied')
        } catch (error) {
            console.error('[copy-button] clipboard write failed:', error)
            setState('failed')
        }
    }, [text])

    const Icon = { copied: Check, failed: X, idle: Copy }[state]

    return (
        <>
            <Button size="sm" variant="outline" onClick={handleCopy}>
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
