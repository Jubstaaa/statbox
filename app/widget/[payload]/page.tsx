'use client'

import { useMemo } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import Widget from '@/components/widget/widget'
import WidgetError from '@/components/widget/widget.error'
import {
    decodeLegacyWidgetRoutePayload,
    decodeWidgetRoutePayload,
    resolveSessionTimestamp,
} from '@/components/widget-generator/widget-generator.utils'

export default function WidgetPage() {
    const params = useParams<{ payload: string }>()
    const searchParams = useSearchParams()
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

    if (!decoded && !legacyDecoded) return <WidgetError style="classic" />

    return (
        <div className="bg-transparent">
            <Widget
                payload={params.payload}
                puuid={decoded?.puuid}
                queue={decoded?.queue ?? 'solo'}
                region={decoded?.region ?? legacyDecoded?.region}
                session={session}
                style={decoded?.style ?? legacyDecoded!.style}
            />
        </div>
    )
}
