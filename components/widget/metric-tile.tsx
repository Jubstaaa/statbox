import { cn } from '@/lib/cn'

import { GAME_COLORS } from './widget.constants'
import type { MetricTileProps } from './widget.types'

const TONE_STYLES = {
    blue: {
        bg: `border-[${GAME_COLORS.accent}40] bg-[${GAME_COLORS.accent}14]`,
        text: `text-[${GAME_COLORS.accent}]`,
    },
    loss: { bg: 'bg-loss/8 border-loss/25', text: 'text-loss' },
    win: { bg: 'bg-win/8 border-win/25', text: 'text-win' },
} as const

export default function MetricTile({ label, tone, value }: MetricTileProps) {
    const { bg: bgClass, text: textClass } = TONE_STYLES[tone]

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
