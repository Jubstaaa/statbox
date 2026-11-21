'use client'

import { useMemo } from 'react'

import { skipToken, useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'

import { fetchSummonerByPuuid } from '@/features/widget-generator/widget-generator.api'
import Widget from '@/features/widget/widget'
import { POLL_INTERVAL } from '@/features/widget/widget.constants'
import { cn } from '@/lib/cn'

import { resolveWidgetTarget } from './widget-target'

export default function WidgetPage() {
    const params = useParams<{ payload: string }>()
    const searchParams = useSearchParams()
    const { getSession, style, target } = useMemo(
        () => resolveWidgetTarget(params.payload, searchParams),
        [params.payload, searchParams]
    )

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

    return (
        <main
            className={cn('flex min-h-screen bg-transparent', {
                'items-center justify-end': style === 'compact',
                'items-center justify-start': style === 'classic',
                'items-end justify-center': style === 'minimal',
                'items-start justify-center': style === 'topbar',
            })}>
            <h1 className="sr-only">StatBox widget</h1>
            <Widget
                data={summonerQuery.data ?? null}
                isError={isError}
                isLoading={isLoading}
                session={getSession()}
                style={style}
            />
        </main>
    )
}
