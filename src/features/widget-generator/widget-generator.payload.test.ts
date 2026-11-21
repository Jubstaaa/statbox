import {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
} from 'lz-string'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    buildSessionTimestampFromTime,
    buildWidgetUrls,
    decodeWidgetRoutePayload,
    getCurrentDateTimeInputValue,
    parseWidgetTarget,
    resolveSessionTimestamp,
} from './widget-generator.payload'
import { buildOverlongValidSegment } from './widget-generator.payload.fixtures'

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

    it('refuses an oversized payload even when its content is valid', () => {
        const padded = compressToEncodedURIComponent(
            JSON.stringify({
                padding: 'x'.repeat(4000),
                puuid: PUUID,
                queue: 'solo',
                region: 'EUW',
                style: 'classic',
            })
        )

        expect(decodeWidgetRoutePayload(padded)).toBeNull()
    })

    it('refuses a segment over the wire cap before decompressing it', () => {
        const segment = buildOverlongValidSegment(PUUID)

        expect(segment.length).toBeGreaterThan(512)
        expect(decompressFromEncodedURIComponent(segment).length).toBeLessThan(
            1024
        )
        expect(decodeWidgetRoutePayload(segment)).toBeNull()
        expect(parseWidgetTarget(segment, new URLSearchParams())).toBeNull()
    })

    it('refuses a short segment that decompresses into a large document', () => {
        const bomb = compressToEncodedURIComponent(
            JSON.stringify({
                padding: 'ab'.repeat(10_000),
                puuid: PUUID,
                queue: 'solo',
                region: 'EUW',
                style: 'classic',
            })
        )

        expect(bomb.length).toBeLessThan(512)
        expect(decodeWidgetRoutePayload(bomb)).toBeNull()
    })

    it.each(['', 'not-lz', '%%%'])('returns null for garbage %j', value => {
        expect(decodeWidgetRoutePayload(value)).toBeNull()
    })
})

// The widget page and /api/summoner/[payload] read the same URLs through this
// one parser, so a link either works on both or fails on both.
describe('parseWidgetTarget', () => {
    function parse(segment: string, query = '') {
        const target = parseWidgetTarget(segment, new URLSearchParams(query))
        if (!target) return null
        const { getSession, ...rest } = target

        return { ...rest, session: getSession() }
    }

    it('reads every setting from a widget payload', () => {
        const { widgetUrl } = buildWidgetUrls({
            puuid: PUUID,
            queue: 'flex',
            region: 'KR',
            sessionMode: 'from-time',
            sessionTime: '2026-11-19T09:30',
            style: 'topbar',
        })

        expect(parse(payloadOf(widgetUrl))).toEqual({
            puuid: PUUID,
            queue: 'flex',
            region: 'KR',
            session: new Date(2026, 10, 19, 9, 30).getTime(),
            style: 'topbar',
        })
    })

    it('rolls an all-day session over at midnight', () => {
        const { widgetUrl } = buildWidgetUrls({
            puuid: PUUID,
            queue: 'solo',
            region: 'EUW',
            sessionMode: 'all-day',
            sessionTime: null,
            style: 'classic',
        })
        const target = parseWidgetTarget(
            payloadOf(widgetUrl),
            new URLSearchParams()
        )

        expect(target?.getSession()).toBe(new Date(2026, 10, 19).getTime())
        vi.setSystemTime(new Date(2026, 10, 20, 0, 5))
        expect(target?.getSession()).toBe(new Date(2026, 10, 20).getTime())
    })

    it('reads a legacy link with the PUUID bare and the rest in the query', () => {
        expect(
            parse(PUUID, '?region=EUW&queue=flex&session=1700000000000')
        ).toEqual({
            puuid: PUUID,
            queue: 'flex',
            region: 'EUW',
            session: 1_700_000_000_000,
            style: 'classic',
        })
    })

    it('defaults a legacy link to the solo queue and no session', () => {
        expect(parse(PUUID, '?region=EUW')).toMatchObject({
            queue: 'solo',
            session: null,
        })
    })

    it.each([
        ['a legacy segment that is not a PUUID', 'x/../../riot', '?region=EUW'],
        ['a legacy link without a region', PUUID, ''],
        ['an unknown region', PUUID, '?region=MARS'],
        ['an unknown queue', PUUID, '?region=EUW&queue=aram'],
        ['an oversized segment', 'A'.repeat(600), '?region=EUW'],
    ])('has no target for %s', (_, segment, query) => {
        expect(parse(segment, query)).toBeNull()
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
