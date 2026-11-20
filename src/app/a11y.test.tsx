import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import CreateError from '@/app/(main)/create/_components/create-error'
import MainLayout, { metadata as mainMetadata } from '@/app/(main)/layout'
import { metadata as homeMetadata } from '@/app/(main)/page'
import { metadata as privacyMetadata } from '@/app/(main)/privacy/page'
import { metadata as termsMetadata } from '@/app/(main)/terms/page'
import GlobalError from '@/app/global-error'
import NotFound from '@/app/not-found'
import Chip from '@/features/widget-generator/chip'
import Input from '@/features/widget-generator/input'
import RegionPicker from '@/features/widget-generator/region-picker'
import ChampionIcon from '@/features/widget/champion-icon'
import DdragonProvider from '@/features/widget/ddragon-provider'
import PlayerSummary from '@/features/widget/player-summary'
import ProfileIcon from '@/features/widget/profile-icon'

const render = (element: ReactElement) => renderToStaticMarkup(element)
const noop = () => undefined
const selectRegion = () => noop

// An <a> wrapping a <button> is two nested interactive controls: one tab stop
// announces as a link, the other as a button, and they disagree on activation.
const NESTED_CONTROL = /<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<button/

describe('accessible markup', () => {
    it('does not nest buttons in links on the 404 page', () => {
        expect(render(<NotFound />)).not.toMatch(NESTED_CONTROL)
    })

    it('renders the create error as a section heading under the page h1', () => {
        const html = render(<CreateError error={null} />)

        expect(html).not.toMatch(NESTED_CONTROL)
        expect(html).not.toContain('<h1')
        expect(html).toContain('<h2')
    })

    it('gives the main layout a skip link to its main landmark', () => {
        const html = render(
            <MainLayout>
                <p>body</p>
            </MainLayout>
        )

        expect(html).toMatch(/<a[^>]*href="#main"[^>]*>Skip to content<\/a>/)
        expect(html).toMatch(/<main[^>]*id="main"/)
        expect(html).not.toMatch(NESTED_CONTROL)
    })

    it('requests icons near their rendered size and keeps them square', () => {
        const html = render(
            <DdragonProvider version="16.23.1">
                <ChampionIcon champion="Ahri" />
                <ProfileIcon iconId={6} />
            </DdragonProvider>
        )

        expect(html.match(/width="48"/g)).toHaveLength(2)
        expect(html.match(/class="[^"]*shrink-0/g)).toHaveLength(2)
    })

    it('does not nest buttons in links on the global error page', () => {
        const html = render(
            <GlobalError error={new Error('boom')} reset={noop} />
        )

        expect(html).not.toMatch(NESTED_CONTROL)
        expect(html).toMatch(/<a[^>]*href="https:\/\/github.com[^"]*issues/)
    })

    it('exposes the selected state of a chip', () => {
        expect(render(<Chip active>KR</Chip>)).toContain('aria-pressed="true"')
        expect(render(<Chip>KR</Chip>)).toContain('aria-pressed="false"')
    })

    it('groups the region chips under a visible label', () => {
        const html = render(<RegionPicker value="KR" onSelect={selectRegion} />)
        const labelId = /<span[^>]*id="([^"]+)"[^>]*>Region<\/span>/.exec(
            html
        )?.[1]

        expect(labelId).toBeDefined()
        const group = /<div[^>]*role="group"[^>]*>/.exec(html)?.[0]

        expect(group).toContain(`aria-labelledby="${labelId}"`)
    })

    it('links an input to its error message', () => {
        const html = render(<Input error="Tag is required" label="Tag" />)
        const errorId = /<span[^>]*id="([^"]+)"[^>]*>Tag is required/.exec(
            html
        )?.[1]

        expect(errorId).toBeDefined()
        expect(html).toContain('aria-invalid="true"')
        expect(html).toContain(`aria-describedby="${errorId}"`)
        expect(html).toContain('focus-visible:ring-2')
    })

    it('leaves a valid input without an error association', () => {
        const html = render(<Input label="Tag" />)

        expect(html).not.toContain('aria-invalid')
        expect(html).not.toContain('aria-describedby')
    })

    it('treats the profile icon as decoration next to the name', () => {
        const html = render(
            <DdragonProvider version="16.23.1">
                <ProfileIcon iconId={6} />
            </DdragonProvider>
        )

        expect(html).toContain('alt=""')
    })

    it('gives the hot streak marker a text alternative', () => {
        const html = render(
            <DdragonProvider version="16.23.1">
                <PlayerSummary
                    tierColor="#fff"
                    data={{
                        gameName: 'Faker',
                        hotStreak: true,
                        leaguePoints: 1,
                        losses: 1,
                        matchHistory: [],
                        profileIconId: 6,
                        puuid: 'p',
                        rank: 'I',
                        summonerLevel: 1,
                        tagLine: 'KR1',
                        tier: 'GOLD',
                        wins: 1,
                    }}
                />
            </DdragonProvider>
        )

        const marker = /<span[^>]*role="img"[^>]*>/.exec(html)?.[0]

        expect(marker).toContain('aria-label="On a win streak"')
    })
})

describe('canonical URLs', () => {
    it('does not set one site-wide in the layout', () => {
        expect(mainMetadata.alternates?.canonical).toBeUndefined()
    })

    it.each([
        ['home', homeMetadata, '/'],
        ['privacy', privacyMetadata, '/privacy'],
        ['terms', termsMetadata, '/terms'],
    ])('points %s at itself', (_, metadata, path) => {
        expect(metadata.alternates?.canonical).toBe(path)
    })
})
