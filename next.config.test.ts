import { describe, expect, it } from 'vitest'

import nextConfig from './next.config'

async function headersFor(path: string) {
    const rules = (await nextConfig.headers?.()) ?? []
    const matching = rules.filter(rule =>
        new RegExp(`^${rule.source.replace('/:path*', '(/.*)?')}$`).test(path)
    )

    return Object.fromEntries(
        matching.flatMap(rule =>
            rule.headers.map(header => [header.key.toLowerCase(), header.value])
        )
    )
}

describe('security headers', () => {
    it('sends the baseline headers on every page', async () => {
        const headers = await headersFor('/')

        expect(headers['strict-transport-security']).toBe(
            'max-age=31536000; includeSubDomains'
        )
        expect(headers['x-content-type-options']).toBe('nosniff')
        expect(headers['referrer-policy']).toBe(
            'strict-origin-when-cross-origin'
        )
        expect(headers['permissions-policy']).toContain('camera=()')
    })

    it('forbids framing of the site pages', async () => {
        const headers = await headersFor('/create')

        expect(headers['content-security-policy']).toContain(
            "frame-ancestors 'none'"
        )
        expect(headers['x-frame-options']).toBe('DENY')
    })

    it('keeps the widget embeddable in overlay tools', async () => {
        const headers = await headersFor('/widget/abc')

        expect(headers['content-security-policy']).toContain(
            "default-src 'self'"
        )
        expect(headers['content-security-policy']).not.toContain(
            'frame-ancestors'
        )
        expect(headers['x-frame-options']).toBeUndefined()
    })

    it('allows only the origins the site actually loads from', async () => {
        const csp = (await headersFor('/'))['content-security-policy'] ?? ''

        expect(csp).toContain(
            "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com"
        )
        expect(csp).toContain(
            "connect-src 'self' https://cloudflareinsights.com"
        )
        expect(csp).toContain("object-src 'none'")
    })
})

describe('performance config', () => {
    it('inlines the Tailwind stylesheet so it does not block first render', () => {
        expect(nextConfig.experimental?.inlineCss).toBe(true)
    })
})
