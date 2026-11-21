'use client'

import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'

import { summonerQueryOptions } from '@/features/widget-generator/widget-generator.api'
import { describeWidgetError } from '@/features/widget-generator/widget-generator.messages'
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
        ...summonerQueryOptions(target),
        placeholderData: previousData => previousData,
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
                errorMessage={describeWidgetError(
                    target === null ? null : summonerQuery.error
                )}
            />
        </main>
    )
}
