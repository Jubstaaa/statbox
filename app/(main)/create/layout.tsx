export default function CreateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mb-8 max-w-2xl">
                <p className="text-accent-2 text-[11px] font-semibold tracking-[0.22em] uppercase">
                    Builder
                </p>
                <h1 className="text-text mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                    Pick the final widget with your own data inside it
                </h1>
                <p className="text-text-muted mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
                    Preview every layout, choose the one that fits your scene,
                    then copy the browser source URL.
                </p>
            </div>
            {children}
        </div>
    )
}
