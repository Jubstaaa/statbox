// @vitest-environment happy-dom
import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
    getBuilderAccount,
    saveBuilderAccount,
} from '@/features/widget-generator/widget-generator.storage'

import { useCreatePage } from './use-create-page'

const PUUID = 'g'.repeat(78)

const push = vi.hoisted(() => vi.fn())
const replace = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace }) }))

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function saveKoreanAccount() {
    saveBuilderAccount({
        puuid: PUUID,
        settings: {
            queue: 'flex',
            region: 'KR',
            sessionMode: 'all-day',
            sessionTime: null,
            style: 'topbar',
        },
    })
}

afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    window.localStorage.clear()
})

describe('useCreatePage', () => {
    it('loads the saved account in its own region and queue', async () => {
        const fetchMock = vi.fn(async () => Response.json({}))
        vi.stubGlobal('fetch', fetchMock)
        saveKoreanAccount()

        const { result } = renderHook(useCreatePage, { wrapper })

        expect(result.current.style).toBe('topbar')
        await waitFor(() =>
            expect(fetchMock).toHaveBeenCalledWith(
                `/api/summoner/${PUUID}?queue=flex&region=KR`,
                { cache: 'no-cache' }
            )
        )
    })

    it('saves a changed setting back to the account', () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Response.json({}))
        )
        saveKoreanAccount()
        const { result } = renderHook(useCreatePage, { wrapper })

        act(() => result.current.handleSoloQueue())

        expect(getBuilderAccount()?.settings).toMatchObject({
            queue: 'solo',
            region: 'KR',
        })
    })

    it('sends the visitor home when no account is saved', async () => {
        const fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)

        renderHook(useCreatePage, { wrapper })

        await waitFor(() => expect(replace).toHaveBeenCalledWith('/'))
        expect(fetchMock).not.toHaveBeenCalled()
        expect(window.localStorage.length).toBe(0)
    })

    it('forgets the account and its settings on change account', () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Response.json({}))
        )
        saveKoreanAccount()
        const { result } = renderHook(useCreatePage, { wrapper })

        act(() => result.current.handleChangeAccount())

        expect(window.localStorage.length).toBe(0)
        expect(push).toHaveBeenCalledWith('/')
    })
})
