import type { KdaLineProps } from '../widget.types'

export default function KdaLine({
    assists,
    deaths,
    kdaRatio,
    kills,
}: KdaLineProps) {
    return (
        <span className="text-xs font-bold">
            <span className="text-win">{kills}</span>
            <span className="text-text-subtle"> / </span>
            <span className="text-loss">{deaths}</span>
            <span className="text-text-subtle"> / </span>
            <span className="text-[#7dd3fc]">{assists}</span>
            {kdaRatio ? (
                <span className="text-text-muted ml-1.5">{kdaRatio} KDA</span>
            ) : null}
        </span>
    )
}
