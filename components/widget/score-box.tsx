import type { ScoreBoxProps } from './widget.types'

export default function ScoreBox({ color, label, value }: ScoreBoxProps) {
    return (
        <div
            className="rounded-[14px] border py-[10px] text-center"
            style={{ background: `${color}12`, borderColor: `${color}30` }}>
            <div
                className="text-[26px] leading-none font-black"
                style={{ color }}>
                {value}
            </div>
            <div className="text-text-subtle mt-1 text-[9px] font-extrabold tracking-[0.16em] uppercase">
                {label}
            </div>
        </div>
    )
}
