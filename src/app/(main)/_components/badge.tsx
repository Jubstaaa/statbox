import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface BadgeProps {
    children: ReactNode
    className?: string
    tone?: 'default' | 'accent' | 'success'
}

const tones = {
    accent: 'border-accent/30 bg-accent/12 text-accent',
    default: 'border-border-secondary bg-bg-base/60 text-text-muted',
    success: 'border-win/30 bg-win/12 text-win',
} as const

export default function Badge({
    children,
    className,
    tone = 'default',
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase',
                tones[tone],
                className
            )}>
            {children}
        </span>
    )
}
