import { type InputHTMLAttributes, useId } from 'react'

import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    description?: string | undefined
    error?: string | undefined
    label: string
}

export default function Input({
    className,
    description,
    error,
    label,
    ...props
}: InputProps) {
    const id = useId()
    const descriptionId = description ? `${id}-description` : undefined
    const errorId = error ? `${id}-error` : undefined
    const describedBy =
        [descriptionId, errorId].filter(Boolean).join(' ') || undefined

    return (
        <label className={cn('flex flex-col gap-1.5', className)}>
            <span className="text-text-strong text-[11px] font-semibold tracking-[0.18em] uppercase">
                {label}
            </span>
            <input
                aria-describedby={describedBy}
                aria-invalid={error ? true : undefined}
                className={cn(
                    'bg-bg-elevated text-text placeholder:text-text-subtle h-12 rounded-2xl border px-4 text-sm transition outline-none focus-visible:ring-2',
                    getInputStateClasses(error)
                )}
                {...props}
            />
            {description ? (
                <span className="text-text-subtle text-xs" id={descriptionId}>
                    {description}
                </span>
            ) : null}
            {error ? (
                <span className="text-loss text-xs" id={errorId}>
                    {error}
                </span>
            ) : null}
        </label>
    )
}

function getInputStateClasses(error?: string) {
    return error
        ? 'border-loss/50 focus:border-loss focus-visible:ring-loss/60'
        : 'border-border-secondary focus:border-accent focus-visible:ring-accent/60'
}
