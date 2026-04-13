import SurfaceCard from './surface-card'
import type { WidgetShowcaseCardProps } from './widget-showcase-card.types'

export default function WidgetShowcaseCard({
    children,
    description,
    name,
}: WidgetShowcaseCardProps) {
    return (
        <SurfaceCard className="h-full overflow-hidden">
            <div className="border-border/80 flex min-h-45 items-center justify-center border-b bg-[radial-gradient(circle_at_top,rgba(10,200,185,0.08),transparent_48%)] p-6">
                {children}
            </div>
            <div className="p-5">
                <div className="mb-2">
                    <h3 className="text-text text-base font-bold">{name}</h3>
                </div>
                <p className="text-text-muted text-sm leading-relaxed">
                    {description}
                </p>
            </div>
        </SurfaceCard>
    )
}
