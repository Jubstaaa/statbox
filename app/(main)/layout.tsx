import type { Metadata } from 'next'
import Link from 'next/link'
import { siGithub } from 'simple-icons'

import Button from '@/components/button/button'
import Logo from '@/components/logo/logo'

export const metadata: Metadata = {
    description:
        'Real-time LoL stats widget for streamers. Session-based W/L tracking, live rank, KDA, and more. Free OBS browser source.',
    metadataBase: new URL('https://statbox.live'),
    openGraph: {
        description:
            'Real-time LoL stats widget for streamers. Session-based W/L tracking.',
        siteName: 'StatBox',
        title: 'StatBox — Stream Widget for League of Legends',
        url: 'https://statbox.live',
    },
    title: 'StatBox — Stream Widget for League of Legends',
}

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="text-text min-h-screen bg-[radial-gradient(circle_at_top,rgba(10,200,185,0.1),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(244,201,93,0.1),transparent_22%),linear-gradient(180deg,#07111f_0%,#060e1a_45%,#07111f_100%)]">
            <header className="border-border/80 bg-bg-base/85 sticky top-0 z-50 border-b backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <Link
                        className="transition-opacity hover:opacity-85"
                        href="/">
                        <Logo size="sm" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-text-muted hidden items-center gap-2 text-xs sm:flex">
                            <span className="bg-win h-2 w-2 animate-pulse rounded-full shadow-[0_0_12px_rgba(94,242,162,0.8)]" />
                            Free &amp; open source
                        </span>
                        <a
                            href="https://github.com/Jubstaaa/statbox"
                            rel="noopener noreferrer"
                            target="_blank">
                            <Button aria-label="GitHub" size="sm">
                                <svg
                                    aria-hidden="true"
                                    className="h-4 w-4 fill-current"
                                    viewBox="0 0 24 24">
                                    <path d={siGithub.path} />
                                </svg>
                            </Button>
                        </a>
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <footer className="border-border/70 border-t py-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                    <Logo size="sm" />
                    <p className="text-text-subtle text-center text-xs">
                        StatBox isn&apos;t endorsed by Riot Games. League of
                        Legends © Riot Games, Inc.
                    </p>
                    <p className="text-text-subtle text-xs">
                        Made with ❤️ by{' '}
                        <a
                            className="text-text-strong hover:text-accent"
                            href="https://ilkerbalcilar.com"
                            rel="noopener noreferrer"
                            target="_blank">
                            Jubstaaa
                        </a>
                        {' · '}
                        <a
                            className="text-text-strong hover:text-accent"
                            href="https://github.com/Jubstaaa/statbox"
                            rel="noopener noreferrer"
                            target="_blank">
                            Open source
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    )
}
