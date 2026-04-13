import { cn } from '@/lib/cn'

import type { ChipProps } from './chip.types'

export default function Chip({
    active = false,
    children,
    className,
    ...props
}: ChipProps) {
    return (
        <button
            type="button"
            className={cn(
                'min-w-14 rounded-xl border px-3 py-2 text-xs font-semibold tracking-[0.08em] transition',
                active
                    ? 'border-accent bg-accent text-bg-base'
                    : 'border-border-secondary bg-bg-elevated text-text-muted hover:border-border-hover hover:text-text',
                className
            )}
            {...props}>
            {children}
        </button>
    )
}
