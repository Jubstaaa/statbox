import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { SummonerRequestError } from '@/features/widget-generator/widget-generator.api'

import CreateError from './create-error'

describe('CreateError', () => {
    it('says Riot is rate limiting instead of blaming the account', () => {
        const html = renderToStaticMarkup(
            <CreateError error={new SummonerRequestError(503, 'busy')} />
        )

        expect(html).toMatch(/rate limiting/i)
        expect(html).not.toMatch(/find that account|riot id/i)
    })

    it('says the account is gone when Riot no longer finds it', () => {
        const html = renderToStaticMarkup(
            <CreateError error={new SummonerRequestError(404, 'gone')} />
        )

        expect(html).toMatch(/no longer found/i)
    })
})
