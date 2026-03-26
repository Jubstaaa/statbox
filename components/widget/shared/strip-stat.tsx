import type { StripStatProps } from '../widget.types'

export default function StripStat({ color, label, value }: StripStatProps) {
    return (
        <div className="text-center">
            <div
                className="text-[17px] leading-none font-black"
                style={{ color }}>
                {value}
            </div>
            <div className="text-text-subtle mt-0.5 text-[8px] font-extrabold tracking-[0.14em] uppercase">
                {label}
            </div>
        </div>
    )
}
