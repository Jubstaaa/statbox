'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import Widget from '@/components/widget/widget'
import { POLL_INTERVAL } from '@/components/widget/widget.constants'
import {
    decodeLegacyWidgetRoutePayload,
    decodeWidgetRoutePayload,
    resolveSessionTimestamp,
} from '@/components/widget-generator/widget-generator.utils'
import { initDdragon } from '@/lib/ddragon-client'
import type { RiotData } from '@/lib/riot/riot.types'

export default function WidgetPage() {
    const params = useParams<{ payload: string }>()
    const searchParams = useSearchParams()
    const [assetsReady, setAssetsReady] = useState(false)
    const [data, setData] = useState<RiotData | null>(null)
    const [error, setError] = useState(false)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const decoded = decodeWidgetRoutePayload(params.payload)
    const legacyDecoded = decodeLegacyWidgetRoutePayload(params.payload)
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

    const fetchData = useCallback(async () => {
        try {
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
                if (!data) {
                    setError(true)
                }

                return
            }

            const nextData = (await response.json()) as RiotData
            setData(nextData)
            setError(false)
        } catch {
            if (!data) {
                setError(true)
            }
        }
    }, [data, decoded, legacyDecoded, params.payload, session])

    useEffect(() => {
        void initDdragon().then(() => setAssetsReady(true))
    }, [])

    useEffect(() => {
        if (!decoded && !legacyDecoded) return

        const initialLoad = window.setTimeout(() => {
            void fetchData()
        }, 0)
        intervalRef.current = setInterval(() => {
            void fetchData()
        }, POLL_INTERVAL)

        return () => {
            window.clearTimeout(initialLoad)
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [decoded, fetchData, legacyDecoded])

    return (
        <div className="bg-transparent">
            <Widget
                data={data}
                isError={!decoded && !legacyDecoded ? true : error && !data}
                isLoading={(!data || !assetsReady) && !(error && !data)}
                session={session}
                style={decoded?.style ?? legacyDecoded?.style ?? 'classic'}
            />
        </div>
    )
}
