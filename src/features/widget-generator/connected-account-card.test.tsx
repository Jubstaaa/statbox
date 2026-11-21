import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import ConnectedAccountCard from './connected-account-card'
import { SummonerRequestError } from './widget-generator.api'

function ignore() {
    return undefined
}

function renderFailed(error: unknown) {
    return renderToStaticMarkup(
        <ConnectedAccountCard
            query={{ data: undefined, error, isError: true, isLoading: false }}
            onChangeAccount={ignore}
            onOpenBuilder={ignore}
            onRetry={ignore}
        />
    )
}

describe('ConnectedAccountCard', () => {
    it('offers a retry, not another account, while Riot is rate limiting', () => {
        const html = renderFailed(new SummonerRequestError(503, 'busy'))

        expect(html).toMatch(/rate limiting/i)
        expect(html).toContain('Try again')
        expect(html).not.toContain('Change account')
        expect(html).not.toMatch(/another account/i)
    })

    it('asks for a new account when the saved one is gone', () => {
        const html = renderFailed(new SummonerRequestError(404, 'gone'))

        expect(html).toMatch(/no longer found/i)
        expect(html).toContain('Change account')
    })
})
