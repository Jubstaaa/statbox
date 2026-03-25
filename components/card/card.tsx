import { cn } from '@/lib/cn'

import type { CardProps } from './card.types'

export default function Card({ children, className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'border-border bg-bg-surface/90 rounded-3xl border',
                className
            )}
            {...props}>
            {children}
        </div>
    )
}
