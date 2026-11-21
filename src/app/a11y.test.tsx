import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import CreateError from '@/app/(main)/create/_components/create-error'
import MainLayout from '@/app/(main)/layout'
import NotFound from '@/app/not-found'
import ChampionIcon from '@/features/widget/champion-icon'
import DdragonProvider from '@/features/widget/ddragon-provider'
import ProfileIcon from '@/features/widget/profile-icon'

const render = (element: ReactElement) => renderToStaticMarkup(element)

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
})
