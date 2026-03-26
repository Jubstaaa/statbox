import type { SectionLabelProps } from '../widget.types'

export default function SectionLabel({ children }: SectionLabelProps) {
    return (
        <div className="text-text-subtle mb-2 text-[9px] font-extrabold tracking-[0.16em] uppercase">
            {children}
        </div>
    )
}
