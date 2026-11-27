import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

function contentSecurityPolicy({ framable }: { framable: boolean }) {
    return [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://static.cloudflareinsights.com`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' blob: data:",
        "font-src 'self'",
        "connect-src 'self' https://cloudflareinsights.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        ...(framable ? [] : ["frame-ancestors 'none'"]),
        'upgrade-insecure-requests',
    ].join('; ')
}

const baseHeaders = [
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
    },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=()',
    },
]

const nextConfig: NextConfig = {
    experimental: {
        inlineCss: true,
    },
    headers() {
        return Promise.resolve([
            { headers: baseHeaders, source: '/:path*' },
            {
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: contentSecurityPolicy({ framable: false }),
                    },
                    { key: 'X-Frame-Options', value: 'DENY' },
                ],

                source: '/((?!widget/).*)',
            },
            {
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: contentSecurityPolicy({ framable: true }),
                    },
                ],
                source: '/widget/:path*',
            },
        ])
    },
    images: {
        deviceSizes: [96],
        imageSizes: [48],

        maximumDiskCacheSize: 100_000_000,

        remotePatterns: ['profileicon', 'champion'].map(set => ({
            hostname: 'ddragon.leagueoflegends.com',
            pathname: `/cdn/*/img/${set}/**`,
            protocol: 'https' as const,
            search: '',
        })),
    },

    output: 'standalone',
}

export default nextConfig
