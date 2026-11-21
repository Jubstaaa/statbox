import { describe, expect, it } from 'vitest'

import { SummonerRequestError } from './widget-generator.api'
import {
    describeLookupError,
    describeSavedAccountError,
    describeWidgetError,
} from './widget-generator.messages'
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

// A saved account was not typed just now, so a busy or unreachable Riot is
// worth waiting out; only a missing or invalid account needs a new one.
describe('describeSavedAccountError', () => {
    it.each([
        [new SummonerRequestError(503, 'x'), /rate limit/i, false],
        [new SummonerRequestError(502, 'x'), /couldn.t reach riot/i, false],
        [new TypeError('Failed to fetch'), /couldn.t reach riot/i, false],
        [new SummonerRequestError(404, 'x'), /no longer found/i, true],
        [new SummonerRequestError(400, 'x'), /no longer valid/i, true],
    ])('explains %o', (error, message, needsNewAccount) => {
        const described = describeSavedAccountError(error)

        expect(described.message).toMatch(message)
        expect(described.needsNewAccount).toBe(needsNewAccount)
    })

    it('never suggests another account while Riot is rate limiting', () => {
        expect(
            describeSavedAccountError(new SummonerRequestError(503, 'x'))
                .message
        ).not.toMatch(/account/i)
    })
})

describe('describeWidgetError', () => {
    it.each([
        [new SummonerRequestError(503, 'x'), /rate limited, retrying/i],
        [new SummonerRequestError(404, 'x'), /summoner not found/i],
        [new SummonerRequestError(400, 'x'), /invalid widget link/i],
        [new SummonerRequestError(502, 'x'), /riot unreachable, retrying/i],
        [new TypeError('Failed to fetch'), /riot unreachable, retrying/i],
        [null, /invalid widget link/i],
    ])('explains %o', (error, message) => {
        expect(describeWidgetError(error)).toMatch(message)
    })
})
