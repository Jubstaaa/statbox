import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean
    children: ReactNode
}

export default function Chip({
    active = false,
    children,
    className,
    ...props
}: ChipProps) {
    return (
        <button
            aria-pressed={active}
            className={cn(
                'min-w-14 rounded-xl border px-3 py-2 text-xs font-semibold tracking-[0.08em] transition',
                active
                    ? 'border-accent bg-accent text-bg-base'
                    : 'border-border-secondary bg-bg-elevated text-text-muted hover:border-border-hover hover:text-text',
                className
            )}
            type="button"
            {...props}>
            {children}
        </button>
    )
}
