'use client'

import Button, { buttonClassName } from '@/components/button'

export default function GlobalError({
    error,
    retry,
}: {
    error: unknown
    retry: () => void
}) {
    const digest = digestOf(error)

    return (
        <html className="dark" lang="en">
            <title>Something broke · StatBox</title>
            <body className="bg-background text-foreground">
                <main className="text-text bg-page min-h-screen">
                    <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
                        <div className="space-y-6">
                            <p className="text-loss text-[11px] font-semibold tracking-[0.22em] uppercase">
                                Application error
                            </p>
                            <div className="space-y-3">
                                <h1 className="text-text text-5xl font-black tracking-tight">
                                    Something broke.
                                </h1>
                                <p className="text-text-muted max-w-xl text-sm leading-relaxed">
                                    StatBox hit an unexpected error. Try again,
                                    and if it keeps happening, open an issue on
                                    GitHub.
                                </p>
                                {digest ? (
                                    <p className="text-text-subtle text-xs">
                                        Error reference: {digest}
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button onClick={retry}>Try again</Button>
                                <a
                                    className={buttonClassName({
                                        variant: 'secondary',
                                    })}
                                    href="https://github.com/Jubstaaa/statbox/issues/new/choose"
                                    rel="noopener noreferrer"
                                    target="_blank">
                                    Open issue
                                </a>
                            </div>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    )
}

function digestOf(error: unknown): string | undefined {
    if (!(error instanceof Error) || !('digest' in error)) return undefined

    return typeof error.digest === 'string' ? error.digest : undefined
}
