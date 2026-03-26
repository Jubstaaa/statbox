import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import QueryProvider from '@/providers/query-provider/query-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    icons: {
        apple: '/logo.svg',
        icon: '/logo.svg',
        shortcut: '/logo.svg',
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
