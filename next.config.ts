import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

// No nonces: they would force every page to render per request, and the site is
// static apart from the Riot routes. Cloudflare Web Analytics is injected at
// the edge, hence its script and beacon origins. Champion and profile icons go
// through /_next/image, so ddragon never loads in the browser directly.
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
    async headers() {
        return [
            { headers: baseHeaders, source: '/:path*' },
            {
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: contentSecurityPolicy({ framable: false }),
                    },
                    { key: 'X-Frame-Options', value: 'DENY' },
                ],
                // Everything except the widget, which streamers may embed in
                // overlay tools that load it in a frame.
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
        ]
    },
    images: {
        remotePatterns: [
            {
                hostname: 'ddragon.leagueoflegends.com',
                protocol: 'https',
            },
        ],
    },
    // Self-hosted on a DigitalOcean droplet: standalone emits a minimal server.js
    // plus traced node_modules, which is what the runner image starts.
    output: 'standalone',
}

export default nextConfig
