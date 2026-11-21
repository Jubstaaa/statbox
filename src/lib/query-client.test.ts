import { describe, expect, it } from 'vitest'

import { createQueryClient } from './query-client'

const httpError = (status: number) =>
    Object.assign(new Error(`status ${status}`), { status })

describe('createQueryClient', () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry

    it('retries a server or network failure once', () => {
        expect(typeof retry).toBe('function')
        if (typeof retry !== 'function') return

        expect(retry(0, httpError(502))).toBe(true)
        expect(retry(0, new TypeError('Failed to fetch'))).toBe(true)
        expect(retry(1, httpError(502))).toBe(false)
    })

    it('never retries an answer the client caused', () => {
        if (typeof retry !== 'function') return

        expect(retry(0, httpError(400))).toBe(false)
        expect(retry(0, httpError(404))).toBe(false)
    })
})
