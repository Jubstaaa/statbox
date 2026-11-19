'use client'

import { useMemo } from 'react'

import { skipToken, useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'

import { fetchSummonerByPuuid } from '@/features/widget-generator/widget-generator.api'
import {
    decodeWidgetRoutePayload,
    resolveSessionTimestamp,
} from '@/features/widget-generator/widget-generator.payload'
import Widget from '@/features/widget/widget'
import { POLL_INTERVAL } from '@/features/widget/widget.constants'
import { cn } from '@/lib/cn'
import { rankedQueueSchema, regionSchema } from '@/lib/riot/riot.schemas'

export default function WidgetPage() {
    const params = useParams<{ payload: string }>()
    const searchParams = useSearchParams()
    const payload = decodeURIComponent(params.payload)
    const decoded = decodeWidgetRoutePayload(payload)
    const session = useMemo(() => {
        if (decoded) {
            return resolveSessionTimestamp({
                sessionMode: decoded.sessionMode ?? 'all-day',
                sessionTime: decoded.sessionTime,
            })
        }

        const sessionRaw = searchParams.get('session')
        return sessionRaw ? parseInt(sessionRaw, 10) || null : null
    }, [decoded, searchParams])

    // Links from before the payload format carry the PUUID bare, with region
    // and queue in the query string.
    const legacyRegion = regionSchema.safeParse(searchParams.get('region'))
    const target =
        decoded ??
        (legacyRegion.success
            ? {
                  puuid: payload,
                  queue: rankedQueueSchema
                      .catch('solo')
                      .parse(searchParams.get('queue')),
                  region: legacyRegion.data,
              }
            : null)

    const summonerQuery = useQuery({
        enabled: target !== null,
        placeholderData: previousData => previousData,
        queryFn: target ? () => fetchSummonerByPuuid(target) : skipToken,
        queryKey: ['summoner', target?.puuid, target?.region, target?.queue],
        refetchInterval: POLL_INTERVAL,
        refetchIntervalInBackground: true,
    })
    const isLoading = target !== null && !summonerQuery.isFetched
    const isError =
        target === null || (summonerQuery.isError && !summonerQuery.data)
    const style = decoded?.style ?? 'classic'

    return (
        <div
            className={cn('flex min-h-screen bg-transparent', {
                'items-center justify-end': style === 'compact',
                'items-center justify-start': style === 'classic',
                'items-end justify-center': style === 'minimal',
                'items-start justify-center': style === 'topbar',
            })}>
            <Widget
                data={summonerQuery.data ?? null}
                isError={isError}
                isLoading={isLoading}
                session={session}
                style={style}
            />
        </div>
    )
}
