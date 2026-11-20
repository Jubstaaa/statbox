import { GAME_COLORS } from './widget.constants'

interface KdaLineProps {
    assists: string | number
    deaths: string | number
    kdaRatio?: string | null
    kills: string | number
}

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
            <span style={{ color: GAME_COLORS.accent }}>{assists}</span>
            {kdaRatio ? (
                <span className="text-text-muted ml-1.5">{kdaRatio} KDA</span>
            ) : null}
        </span>
    )
}
