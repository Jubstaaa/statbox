import { cn } from '@/lib/cn'

import type { InputProps } from './input.types'
import { getInputStateClasses } from './input.utils'

export default function Input({
    className,
    description,
    error,
    label,
    ...props
}: InputProps) {
    return (
        <label className={cn('flex flex-col gap-1.5', className)}>
            <span className="text-text-strong text-[11px] font-semibold tracking-[0.18em] uppercase">
                {label}
            </span>
            <input
                className={cn(
                    'bg-bg-elevated text-text placeholder:text-text-subtle h-12 rounded-2xl border px-4 text-sm transition outline-none',
                    getInputStateClasses(error)
                )}
                {...props}
            />
            {description ? (
                <span className="text-text-subtle text-xs">{description}</span>
            ) : null}
            {error ? <span className="text-loss text-xs">{error}</span> : null}
        </label>
    )
}
