'use client'

import Button from '@/components/button/button'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html className="dark" lang="en">
            <body className="bg-background text-foreground">
                <main className="text-text min-h-screen bg-[radial-gradient(circle_at_top,rgba(10,200,185,0.1),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(244,201,93,0.1),transparent_22%),linear-gradient(180deg,#07111f_0%,#060e1a_45%,#07111f_100%)]">
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
                                {error.message ? (
                                    <p className="text-text-subtle text-xs">
                                        {error.message}
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button onClick={reset}>Try again</Button>
                                <a
                                    href="https://github.com/Jubstaaa/statbox/issues/new/choose"
                                    rel="noopener noreferrer"
                                    target="_blank">
                                    <Button variant="secondary">
                                        Open issue
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    )
}
