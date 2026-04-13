import React from 'react'

import Card from '@/components/card/card'
import { cn } from '@/lib/cn'

import type { SurfaceCardProps } from './surface-card.types'

export default function SurfaceCard({ children, className }: SurfaceCardProps) {
    return (
        <Card
            className={cn(
                'border-border-hover bg-[linear-gradient(180deg,rgba(16,32,51,0.94)_0%,rgba(10,20,35,0.92)_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.35)]',
                className
            )}>
            {children}
        </Card>
    )
}
