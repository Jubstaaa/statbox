import type { ComponentType } from 'react'

export interface FeatureCardItemProps {
    className?: string
    description: string
    icon: ComponentType<{ className?: string }>
    title: string
}

export interface FeatureCardProps {
    item: FeatureCardItemProps
}
