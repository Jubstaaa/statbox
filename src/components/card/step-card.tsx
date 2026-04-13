import type { StepCardProps } from './step-card.types'
import SurfaceCard from './surface-card'

export default function StepCard({ description, step, title }: StepCardProps) {
    return (
        <SurfaceCard className="p-6 text-center shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
            <div className="bg-accent text-bg-base mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-base font-black shadow-[0_12px_32px_rgba(244,201,93,0.2)]">
                {step}
            </div>
            <h3 className="text-text mb-2 text-base font-bold">{title}</h3>
            <p className="text-text-muted text-sm leading-relaxed">
                {description}
            </p>
        </SurfaceCard>
    )
}
