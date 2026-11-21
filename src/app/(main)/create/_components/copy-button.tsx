'use client'

import { useCallback, useState } from 'react'

import { Check, Copy } from 'lucide-react'

import Button from '@/components/button'

export interface CopyButtonProps {
    text: string
}

export default function CreateCopyButton({ text }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleResetCopied = useCallback(() => {
        setCopied(false)
    }, [])

    const scheduleResetCopied = useCallback(() => {
        setTimeout(handleResetCopied, 2000)
    }, [handleResetCopied])

    const handleCopy = useCallback(() => {
        void navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            scheduleResetCopied()
        })
    }, [scheduleResetCopied, text])

    return (
        <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? (
                <Check className="text-win h-3 w-3" />
            ) : (
                <Copy className="h-3 w-3" />
            )}
            {copied ? 'Copied' : 'Copy'}
        </Button>
    )
}
