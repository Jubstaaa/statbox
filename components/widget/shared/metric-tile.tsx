import { cn } from '@/lib/cn'

export default function MetricTile({
    label,
    tone,
    value,
}: {
    label: string
    tone: 'win' | 'loss' | 'blue'
    value: string
}) {
    const textClass =
        tone === 'win'
            ? 'text-win'
            : tone === 'loss'
              ? 'text-loss'
              : 'text-[#7dd3fc]'
    const bgClass =
        tone === 'win'
            ? 'bg-win/8 border-win/25'
            : tone === 'loss'
              ? 'bg-loss/8 border-loss/25'
              : 'border-[#7dd3fc40] bg-[#7dd3fc14]'

    return (
        <div className={cn('rounded-xl border p-2 text-center', bgClass)}>
            <div className={cn('text-base leading-none font-black', textClass)}>
                {value}
            </div>
            <div className="text-text-subtle mt-1 text-[9px] font-extrabold tracking-[0.12em] uppercase">
                {label}
            </div>
        </div>
    )
}
