import type { MetricCardProps } from './metric-card.types'
import SurfaceCard from './surface-card'

export default function MetricCard({ label, note, value }: MetricCardProps) {
    return (
        <SurfaceCard className="p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
            <div className="text-text-subtle text-[11px] font-semibold tracking-[0.2em] uppercase">
                {label}
            </div>
            <div className="text-text mt-2 text-3xl font-black">{value}</div>
            <div className="text-text-muted mt-1 text-xs leading-relaxed">
                {note}
            </div>
        </SurfaceCard>
    )
}
