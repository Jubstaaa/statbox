import { cn } from '@/lib/cn'

import type { ButtonProps } from './button.types'
import { buttonSizes, buttonVariants } from './button.utils'

export default function Button({
    children,
    className,
    fullWidth,
    size = 'md',
    variant = 'primary',
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
                buttonVariants[variant],
                buttonSizes[size],
                fullWidth && 'w-full',
                className
            )}
            {...props}>
            {children}
        </button>
    )
}
