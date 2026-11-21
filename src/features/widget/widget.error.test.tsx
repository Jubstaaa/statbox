import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import Widget from './widget'

describe('widget error state', () => {
    it('shows why the widget has no data', () => {
        const html = renderToStaticMarkup(
            <Widget
                isError
                data={null}
                errorMessage="Riot rate limited, retrying…"
                session={null}
                style="classic"
            />
        )

        expect(html).toContain('Riot rate limited, retrying…')
    })
})
