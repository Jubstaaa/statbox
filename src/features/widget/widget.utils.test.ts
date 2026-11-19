import { describe, expect, it } from 'vitest'

import type { MatchEntry, RiotData } from '@/lib/riot/riot.types'

import {
    computeWidgetData,
    formatTierRank,
    getMatchResultColors,
    getWidgetHeight,
    getWidgetWidth,
} from './widget.utils'

describe('formatTierRank', () => {
    it('formats tier and rank', () => {
        expect(formatTierRank('GOLD', 'IV')).toBe('GOLD IV')
    })

    it('returns Unranked for UNRANKED tier', () => {
        expect(formatTierRank('UNRANKED', '')).toBe('Unranked')
    })
})

describe('getMatchResultColors', () => {
    it('returns win colors', () => {
        const result = getMatchResultColors({ isRemake: false, win: true })
        expect(result.color).toBe('#5ef2a2')
    })

    it('returns loss colors', () => {
        const result = getMatchResultColors({ isRemake: false, win: false })
        expect(result.color).toBe('#ff7a8a')
    })

    it('returns remake colors', () => {
        const result = getMatchResultColors({ isRemake: true, win: false })
        expect(result.color).toBe('#adc4db')
    })
})

describe('getWidgetWidth / getWidgetHeight', () => {
    it('returns correct classic dimensions', () => {
        expect(getWidgetWidth('classic')).toBe('300px')
        expect(getWidgetHeight('classic')).toBe('500px')
    })

    it('returns correct topbar dimensions', () => {
        expect(getWidgetWidth('topbar')).toBe('460px')
        expect(getWidgetHeight('topbar')).toBe('40px')
    })
})

const makeMatch = (
    overrides: Partial<MatchEntry> & { matchId: string }
): MatchEntry => ({
    assists: 5,
    champion: 'Ahri',
    championId: 103,
    deaths: 3,
    isRemake: false,
    kills: 7,
    timestamp: '2025-01-01T00:00:00.000Z',
    win: true,
    ...overrides,
})

const makeRiotData = (matchHistory: MatchEntry[]): RiotData => ({
    gameName: 'Test',
    hotStreak: false,
    leaguePoints: 50,
    losses: 5,
    matchHistory,
    profileIconId: 1,
    puuid: 'test-puuid',
    rank: 'II',
    summonerLevel: 100,
    tagLine: 'TST',
    tier: 'GOLD',
    wins: 10,
})

describe('computeWidgetData', () => {
    it('computes win/loss stats correctly', () => {
        const matches = [
            makeMatch({ matchId: '1', win: true }),
            makeMatch({ matchId: '2', win: false }),
            makeMatch({ matchId: '3', win: true }),
        ]
        const result = computeWidgetData({
            data: makeRiotData(matches),
            session: null,
        })

        expect(result.sessionWins).toBe(2)
        expect(result.sessionLosses).toBe(1)
        expect(result.winRate).toBe(67)
    })

    it('excludes remakes from stats', () => {
        const matches = [
            makeMatch({ matchId: '1', win: true }),
            makeMatch({ isRemake: true, matchId: '2', win: false }),
        ]
        const result = computeWidgetData({
            data: makeRiotData(matches),
            session: null,
        })

        expect(result.sessionWins).toBe(1)
        expect(result.sessionLosses).toBe(0)
        expect(result.sessionGames).toBe(1)
    })

    it('filters by session timestamp', () => {
        const matches = [
            makeMatch({
                matchId: '1',
                timestamp: '2025-01-02T00:00:00.000Z',
                win: true,
            }),
            makeMatch({
                matchId: '2',
                timestamp: '2024-12-31T00:00:00.000Z',
                win: false,
            }),
        ]
        const session = new Date('2025-01-01T12:00:00.000Z').getTime()
        const result = computeWidgetData({
            data: makeRiotData(matches),
            session,
        })

        expect(result.sessionWins).toBe(1)
        expect(result.sessionLosses).toBe(0)
    })

    it('returns null winRate when no games', () => {
        const result = computeWidgetData({
            data: makeRiotData([]),
            session: null,
        })

        expect(result.winRate).toBeNull()
    })

    it('computes KDA correctly', () => {
        const matches = [
            makeMatch({
                assists: 10,
                deaths: 5,
                kills: 10,
                matchId: '1',
            }),
        ]
        const result = computeWidgetData({
            data: makeRiotData(matches),
            session: null,
        })

        expect(result.avgKills).toBe(10)
        expect(result.avgDeaths).toBe(5)
        expect(result.avgAssists).toBe(10)
        expect(result.kdaRatio).toBe('4.00')
    })

    it('returns null kdaRatio when zero deaths', () => {
        const matches = [makeMatch({ deaths: 0, kills: 5, matchId: '1' })]
        const result = computeWidgetData({
            data: makeRiotData(matches),
            session: null,
        })

        expect(result.kdaRatio).toBeNull()
    })

    it('limits recent matches to display count', () => {
        const matches = Array.from({ length: 10 }, (_, i) =>
            makeMatch({ matchId: String(i) })
        )
        const result = computeWidgetData({
            data: makeRiotData(matches),
            session: null,
        })

        expect(result.recent).toHaveLength(5)
    })
})
