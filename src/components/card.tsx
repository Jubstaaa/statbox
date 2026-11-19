import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

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
