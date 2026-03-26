import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import QueryProvider from '@/providers/query-provider/query-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    applicationName: 'StatBox',
    description:
        'Free OBS browser source widget for League of Legends streamers. Show live rank, LP, recent matches, and session-based W/L on stream.',
    icons: {
        apple: '/logo.svg',
        icon: '/logo.svg',
        shortcut: '/logo.svg',
    },
    keywords: [
        'League of Legends',
        'OBS widget',
        'stream widget',
        'Riot API',
        'Browser Source',
        'LoL overlay',
        'Twitch overlay',
        'StatBox',
    ],
    manifest: '/site.webmanifest',
    metadataBase: new URL('https://statbox.live'),
    openGraph: {
        description:
            'Free OBS browser source widget for League of Legends streamers. Show live rank, LP, recent matches, and session-based W/L on stream.',
        siteName: 'StatBox',
        title: 'StatBox',
        type: 'website',
        url: 'https://statbox.live',
    },
    title: {
        default: 'StatBox',
        template: '%s | StatBox',
    },
    twitter: {
        card: 'summary',
        description:
            'Free OBS browser source widget for League of Legends streamers.',
        title: 'StatBox',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html className="dark" lang="en">
            <body
                className={`${inter.className} bg-background text-foreground`}>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    )
}
