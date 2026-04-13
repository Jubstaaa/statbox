import type { SectionHeadingProps } from './section-heading.types'

export default function SectionHeading({
    children,
    eyebrow,
    title,
}: SectionHeadingProps) {
    return (
        <div className="mb-12 text-center">
            <p className="text-accent-2 mb-3 text-[11px] font-semibold tracking-[0.22em] uppercase">
                {eyebrow}
            </p>
            <h2 className="text-text mb-3 text-3xl font-black sm:text-4xl">
                {title}
            </h2>
            {children ? (
                <p className="text-text-muted mx-auto max-w-2xl leading-relaxed">
                    {children}
                </p>
            ) : null}
        </div>
    )
}
