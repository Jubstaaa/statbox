// @vitest-environment happy-dom
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import DdragonProvider from '@/features/widget/ddragon-provider'

import CreateView from './page'

const noop = () => undefined

vi.mock('./use-create-page', () => ({
    useCreatePage: () => ({
        createStyleSelectHandler: () => noop,
        handleAllDaySession: noop,
        handleChangeAccount: noop,
        handleFlexQueue: noop,
        handleFromTimeSession: noop,
        handleSessionTimeChange: noop,
        handleSoloQueue: noop,
        isError: false,
        isLoading: false,
        maxSessionTime: '2026-11-20T12:00',
        previewSession: null,
        puuid: 'p'.repeat(78),
        queue: 'flex',
        sessionMode: 'from-time',
        sessionTime: '2026-11-20T09:00',
        storageReady: true,
        style: 'topbar',
        summonerData: {
            gameName: 'Faker',
            hotStreak: false,
            leaguePoints: 1,
            losses: 1,
            matchHistory: [],
            profileIconId: 6,
            puuid: 'p'.repeat(78),
            rank: 'I',
            summonerLevel: 1,
            tagLine: 'KR1',
            tier: 'GOLD',
            wins: 1,
        },
        tierColor: '#fff',
        urls: { widgetUrl: 'https://statbox.live/widget/x' },
    }),
}))

afterEach(cleanup)

function pressedIn(groupName: RegExp) {
    return within(screen.getByRole('group', { name: groupName }))
        .getAllByRole('button')
        .map(button => [
            button.textContent,
            button.getAttribute('aria-pressed'),
        ])
}

function renderPage() {
    render(
        <DdragonProvider version="16.23.1">
            <CreateView />
        </DdragonProvider>
    )
}

describe('CreateView', () => {
    it('exposes which layout, queue and session mode are selected', () => {
        renderPage()

        expect(pressedIn(/layout/i)).toContainEqual([
            expect.stringContaining('Topbar'),
            'true',
        ])
        expect(
            pressedIn(/layout/i).filter(([, p]) => p === 'true')
        ).toHaveLength(1)
        expect(pressedIn(/queue/i)).toEqual([
            ['SoloQ', 'false'],
            ['Flex', 'true'],
        ])
        expect(pressedIn(/session/i)).toEqual([
            ['All day', 'false'],
            ['Start time', 'true'],
        ])
    })

    it('labels the session start input and shows its focus', () => {
        renderPage()

        const input = screen.getByLabelText(/session start/i)

        expect(input.getAttribute('type')).toBe('datetime-local')
        expect(input.className).toContain('focus-visible:ring-2')
    })

    it('keeps only phrasing content inside the layout buttons', () => {
        renderPage()

        for (const button of within(
            screen.getByRole('group', { name: /layout/i })
        ).getAllByRole('button')) {
            expect(button.querySelector('div')).toBeNull()
        }
    })
})
