import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { buildWidgetUrls } from '@/features/widget-generator/widget-generator.payload'

import { resolveWidgetTarget } from './widget-target'

const PUUID = 'c'.repeat(78)
const NOW = new Date(2026, 10, 20, 12, 0)

beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
})

afterEach(() => {
    vi.useRealTimers()
})

function resolve(segment: string, query = '') {
    const { getSession, ...rest } = resolveWidgetTarget(
        segment,
        new URLSearchParams(query)
    )

    return { ...rest, session: getSession() }
}

describe('resolveWidgetTarget', () => {
    it('reads every setting from a widget payload', () => {
        const { widgetUrl } = buildWidgetUrls({
            puuid: PUUID,
            queue: 'flex',
            region: 'KR',
            sessionMode: 'from-time',
            sessionTime: '2026-11-20T09:30',
            style: 'topbar',
        })

        expect(resolve(widgetUrl.split('/widget/')[1] ?? '')).toEqual({
            session: new Date(2026, 10, 20, 9, 30).getTime(),
            style: 'topbar',
            target: { puuid: PUUID, queue: 'flex', region: 'KR' },
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
        const { getSession } = resolveWidgetTarget(
            widgetUrl.split('/widget/')[1] ?? '',
            new URLSearchParams()
        )

        expect(getSession()).toBe(new Date(2026, 10, 20).getTime())
        vi.setSystemTime(new Date(2026, 10, 21, 0, 5))
        expect(getSession()).toBe(new Date(2026, 10, 21).getTime())
    })

    it('reads a legacy link with the PUUID bare and the rest in the query', () => {
        expect(resolve(PUUID, '?region=EUW&session=1700000000000')).toEqual({
            session: 1_700_000_000_000,
            style: 'classic',
            target: { puuid: PUUID, queue: 'solo', region: 'EUW' },
        })
    })

    it('decodes a percent-encoded segment', () => {
        expect(resolve(encodeURIComponent(PUUID), '?region=NA').target).toEqual(
            { puuid: PUUID, queue: 'solo', region: 'NA' }
        )
    })

    it.each([
        ['a malformed percent escape', '%E0%A4%A', '?region=EUW'],
        ['a legacy segment that is not a PUUID', 'x/../../riot', '?region=EUW'],
        ['a legacy link without a region', PUUID, ''],
    ])('has no target for %s', (_, segment, query) => {
        expect(resolve(segment, query).target).toBeNull()
    })
})
