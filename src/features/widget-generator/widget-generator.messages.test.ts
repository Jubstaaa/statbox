import { describe, expect, it } from 'vitest'

import { SummonerRequestError } from './widget-generator.api'
import { describeLookupError } from './widget-generator.messages'
import { BuilderStorageError } from './widget-generator.storage'

describe('describeLookupError', () => {
    it.each([
        [new SummonerRequestError(404, 'x'), /not found/i],
        [new SummonerRequestError(503, 'x'), /busy/i],
        [new SummonerRequestError(400, 'x'), /name and tag/i],
        [new SummonerRequestError(502, 'x'), /couldn.t reach riot/i],
        [new TypeError('Failed to fetch'), /couldn.t reach riot/i],
        [new BuilderStorageError(new Error('quota')), /browser/i],
    ])('explains %o', (error, message) => {
        expect(describeLookupError(error)).toMatch(message)
    })
})
