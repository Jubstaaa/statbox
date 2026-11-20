// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { QUERY_CLIENT_DEFAULT_OPTIONS } from '@/app/_components/query-provider'
import DdragonProvider from '@/features/widget/ddragon-provider'

import WidgetGeneratorForm from './widget-generator.form'
import {
    getBuilderAccount,
    saveBuilderAccount,
} from './widget-generator.storage'

const PUUID = 'f'.repeat(78)
const RIOT_DATA = {
    gameName: 'Hide on bush',
    hotStreak: false,
    leaguePoints: 50,
    losses: 10,
    matchHistory: [],
    profileIconId: 6,
    puuid: PUUID,
    rank: 'I',
    summonerLevel: 300,
    tagLine: 'KR1',
    tier: 'CHALLENGER',
    wins: 20,
}

const push = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

let requested: string[] = []

function stubApi(resolveStatus = 200) {
    requested = []
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            requested.push(url)

            if (url.startsWith('/api/summoner/resolve')) {
                return resolveStatus === 200
                    ? Response.json({ puuid: PUUID, region: 'KR' })
                    : Response.json(
                          { error: 'nope' },
                          { status: resolveStatus }
                      )
            }

            return Response.json(RIOT_DATA)
        })
    )
}

function renderForm() {
    const client = new QueryClient({
        defaultOptions: {
            queries: { ...QUERY_CLIENT_DEFAULT_OPTIONS.queries, retry: false },
        },
    })

    return render(
        <QueryClientProvider client={client}>
            <DdragonProvider version="16.23.1">
                <WidgetGeneratorForm />
            </DdragonProvider>
        </QueryClientProvider>
    )
}

function submitRiotId() {
    fireEvent.change(screen.getByLabelText(/game name/i), {
        target: { value: 'Hide on bush' },
    })
    fireEvent.change(screen.getByLabelText(/tag/i), {
        target: { value: 'KR1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'KR' }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
}

beforeEach(() => {
    stubApi()
})

afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    window.localStorage.clear()
    push.mockClear()
})

describe('WidgetGeneratorForm', () => {
    it('saves a non-EUW account with its own region and never asks EUW', async () => {
        renderForm()

        submitRiotId()

        await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/create'))
        expect(getBuilderAccount()).toEqual({
            puuid: PUUID,
            settings: expect.objectContaining({ region: 'KR' }),
        })
        expect(requested.filter(url => url.includes('region=EUW'))).toEqual([])
        expect(
            requested.filter(url => url.startsWith(`/api/summoner/${PUUID}`))
        ).toHaveLength(1)
    })

    it.each([
        [404, /not found/i],
        [503, /busy/i],
        [502, /couldn.t reach riot/i],
    ])(
        'explains a %i lookup failure and saves nothing',
        async (status, message) => {
            stubApi(status)
            renderForm()

            submitRiotId()

            expect(await screen.findByRole('alert')).toHaveProperty(
                'textContent',
                expect.stringMatching(message)
            )
            expect(getBuilderAccount()).toBeNull()
            expect(push).not.toHaveBeenCalled()
        }
    )

    it('forgets the settings too when the account is changed', async () => {
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
        renderForm()

        fireEvent.click(
            await screen.findByRole('button', { name: /change account/i })
        )

        expect(window.localStorage.length).toBe(0)
        expect(await screen.findByLabelText(/game name/i)).toBeTruthy()
    })
})
