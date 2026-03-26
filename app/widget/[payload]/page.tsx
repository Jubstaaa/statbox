'use client'

import { useEffect, useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'

import Widget from '@/components/widget/widget'
import { POLL_INTERVAL } from '@/components/widget/widget.constants'
import {
    decodeLegacyWidgetRoutePayload,
    decodeWidgetRoutePayload,
    resolveSessionTimestamp,
} from '@/components/widget-generator/widget-generator.payload'
import { initDdragon } from '@/lib/ddragon-client'
import type { RiotData } from '@/lib/riot/riot.types'

export default function WidgetPage() {
    const params = useParams<{ payload: string }>()
    const searchParams = useSearchParams()
    const [assetsReady, setAssetsReady] = useState(false)
    const payload = decodeURIComponent(params.payload)
    const decoded = decodeWidgetRoutePayload(payload)
    const legacyDecoded = decodeLegacyWidgetRoutePayload(payload)
    const session = useMemo(() => {
        if (decoded) {
            return resolveSessionTimestamp({
                sessionMode: decoded.sessionMode ?? 'all-day',
                sessionStartedAt: decoded.sessionStartedAt,
                sessionTime: decoded.sessionTime,
            })
        }

        const sessionRaw = searchParams.get('session')
        return sessionRaw ? parseInt(sessionRaw, 10) || null : null
    }, [decoded, searchParams])

    useEffect(() => {
        void initDdragon().then(() => setAssetsReady(true))
    }, [])

    const summonerQuery = useQuery({
        enabled: !!params.payload,
        placeholderData: previousData => previousData,
        queryFn: async () => {
            const url = new URL(
                `/api/summoner/${params.payload}`,
                window.location.origin
            )

            url.searchParams.set('queue', decoded?.queue ?? 'solo')

            if (decoded?.region ?? legacyDecoded?.region) {
                url.searchParams.set(
                    'region',
                    decoded?.region ?? legacyDecoded!.region
                )
            }

            if (!decoded && session) {
                url.searchParams.set('session', String(session))
            }

            const response = await fetch(url.toString())

            if (!response.ok) {
                throw new Error('Failed to load widget data')
            }

            return (await response.json()) as RiotData
        },
        queryKey: [
            'widget',
            payload,
            decoded?.queue ?? 'solo',
            decoded?.region ?? legacyDecoded?.region ?? '',
            session,
        ],
        refetchInterval: POLL_INTERVAL,
        refetchIntervalInBackground: true,
    })
    const isLoading = !assetsReady || !summonerQuery.isFetched
    const isError = !isLoading && summonerQuery.isError && !summonerQuery.data

    return (
        <div className="bg-transparent">
            <Widget
                data={summonerQuery.data ?? null}
                isError={isError}
                isLoading={isLoading}
                session={session}
                style={decoded?.style ?? legacyDecoded?.style ?? 'classic'}
            />
        </div>
    )
}
