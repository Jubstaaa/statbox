import { cn } from '@/lib/cn'

import type { SpinnerProps } from './spinner.types'

export default function Spinner({ className }: SpinnerProps) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'border-accent/25 border-t-accent inline-block h-6 w-6 animate-spin rounded-full border-2',
                className
            )}
        />
    )
}
