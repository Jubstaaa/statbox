import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    buildSessionTimestampFromTime,
    buildWidgetUrls,
    decodeWidgetRoutePayload,
    getCurrentDateTimeInputValue,
    resolveSessionTimestamp,
} from './widget-generator.payload'

const PUUID = 'd'.repeat(78)
const NOW = new Date(2026, 10, 19, 18, 45, 30)

beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
})

afterEach(() => {
    vi.useRealTimers()
})

function payloadOf(url: string) {
    return url.split('/widget/')[1] ?? ''
}

describe('widget route payload', () => {
    it('round-trips every builder setting', () => {
        const settings = {
            puuid: PUUID,
            queue: 'flex',
            region: 'EUW',
            sessionMode: 'from-time',
            sessionTime: '2026-11-19T17:30',
            style: 'topbar',
        } as const

        const { widgetUrl } = buildWidgetUrls(settings)

        expect(widgetUrl.startsWith('https://statbox.live/widget/')).toBe(true)
        expect(decodeWidgetRoutePayload(payloadOf(widgetUrl))).toEqual(settings)
    })

    it('rejects a payload whose session time is not a datetime-local value', () => {
        const { widgetUrl } = buildWidgetUrls({
            puuid: PUUID,
            queue: 'solo',
            region: 'KR',
            sessionMode: 'from-time',
            sessionTime: '2026-11-19 17:30',
            style: 'classic',
        })

        expect(decodeWidgetRoutePayload(payloadOf(widgetUrl))).toBeNull()
    })

    it.each(['', 'not-lz', '%%%'])('returns null for garbage %j', value => {
        expect(decodeWidgetRoutePayload(value)).toBeNull()
    })
})

describe('session timestamps', () => {
    it('formats now as a datetime-local value to the minute', () => {
        expect(getCurrentDateTimeInputValue()).toBe('2026-11-19T18:45')
    })

    it('starts an all-day session at local midnight', () => {
        expect(resolveSessionTimestamp({ sessionMode: 'all-day' })).toBe(
            new Date(2026, 10, 19).getTime()
        )
    })

    it('reads a datetime-local start time', () => {
        expect(buildSessionTimestampFromTime('2026-11-19T17:30')).toBe(
            new Date(2026, 10, 19, 17, 30).getTime()
        )
    })

    it('reads a bare HH:mm start time as today', () => {
        expect(buildSessionTimestampFromTime('09:05')).toBe(
            new Date(2026, 10, 19, 9, 5).getTime()
        )
    })

    it('never starts a session in the future', () => {
        expect(buildSessionTimestampFromTime('2026-11-20T10:00')).toBe(
            NOW.getTime()
        )
    })

    it.each(['24:00', '9:5', '2026-11-19T25:00', 'soon'])(
        'rejects %j',
        value => {
            expect(buildSessionTimestampFromTime(value)).toBeNull()
        }
    )

    it('falls back to midnight when a from-time session has no valid time', () => {
        expect(
            resolveSessionTimestamp({
                sessionMode: 'from-time',
                sessionTime: 'soon',
            })
        ).toBe(new Date(2026, 10, 19).getTime())
    })
})
