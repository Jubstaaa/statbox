import { cn } from '@/lib/cn'

import SurfaceCard from '../surface-card/surface-card'

import type { FeatureCardProps } from './feature-card.types'

export default function FeatureCard({ item }: FeatureCardProps) {
    const IconComponent = item.icon

    return (
        <SurfaceCard className="p-6 shadow-[0_20px_55px_rgba(0,0,0,0.2)]">
            <div
                className={cn(
                    'mb-5 flex h-11 w-11 items-center justify-center rounded-2xl',
                    item.className
                )}>
                <IconComponent className="h-5 w-5 text-white" />{' '}
            </div>
            <h3 className="text-text mb-2 text-base font-bold">{item.title}</h3>
            <p className="text-text-muted text-sm leading-relaxed">
                {item.description}
            </p>
        </SurfaceCard>
    )
}
