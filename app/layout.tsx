import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'

import QueryProvider from '@/providers/query-provider/query-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

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
            {gaMeasurementId ? (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                          window.dataLayer = window.dataLayer || [];
                          function gtag(){dataLayer.push(arguments);}
                          gtag('js', new Date());
                          gtag('config', '${gaMeasurementId}');
                        `}
                    </Script>
                </>
            ) : null}
            <body
                className={`${inter.className} bg-background text-foreground`}>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    )
}
