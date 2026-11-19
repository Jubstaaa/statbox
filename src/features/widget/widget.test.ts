import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import Widget from './widget'

describe('Widget', () => {
    it('shows the error state when loading failed before any data arrived', () => {
        const html = renderToStaticMarkup(
            createElement(Widget, {
                data: null,
                isError: true,
                session: null,
                style: 'classic',
            })
        )

        expect(html).toContain('Failed to load summoner data.')
    })
})
