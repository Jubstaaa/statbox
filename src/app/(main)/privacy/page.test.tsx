// @vitest-environment happy-dom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import PrivacyPage from './page'

function pageText() {
    return render(<PrivacyPage />).container.textContent.replaceAll(/\s+/g, ' ')
}

describe('privacy page', () => {
    it('discloses the server-side cache and how long it keeps a player', () => {
        const text = pageText()

        expect(text).toMatch(/server[^.]*cache/i)
        expect(text).toContain('90 days')
        expect(text).toContain('PUUID')
    })

    it('discloses the cache snapshots each deploy keeps', () => {
        expect(pageText()).toMatch(/three[^.]*snapshots/i)
    })

    it('names Cloudflare among the services that see requests', () => {
        expect(pageText()).toContain('Cloudflare')
    })

    it('warns that a widget link carries the PUUID', () => {
        expect(pageText()).toMatch(/widget link[^.]*PUUID/i)
    })

    it('marks identifiers up as code instead of literal backticks', () => {
        expect(pageText()).not.toContain('`')
    })
})
