'use client'

import { useCallback, useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { notFound, useParams } from 'next/navigation'

import Badge from '@/components/badge/badge'
import Button from '@/components/button/button'
import Card from '@/components/card/card'
import PlayerSummary from '@/components/widget/player-summary'
import { TIER_COLORS } from '@/components/widget/widget.constants'
import WidgetPreviewPanel from '@/components/widget-generator/widget-generator-preview-panel'
import UrlBlock from '@/components/widget-generator/widget-generator-url-block'
import { STYLES } from '@/components/widget-generator/widget-generator.constants'
import {
    buildWidgetUrls,
    decodeCreateRoutePayload,
    fetchSummoner,
} from '@/components/widget-generator/widget-generator.utils'
import { cn } from '@/lib/cn'
import type { WidgetStyle } from '@/lib/riot/riot.types'

import CreateError from './error'
import CreateLoader from './loader'

export default function CreatePage() {
    const params = useParams<{ payload: string }>()
    const decoded = decodeCreateRoutePayload(params.payload)
    const payload = params.payload
    const [style, setStyle] = useState<WidgetStyle>('classic')
    const [sessionStartedAt, setSessionStartedAt] = useState<number>(() =>
        Date.now()
    )

    if (!decoded) {
        notFound()
    }

    const summonerQuery = useQuery({
        queryFn: () => fetchSummoner({ payload }),
        queryKey: ['summoner', payload],
    })
    const { data, isError, isLoading } = summonerQuery

    const urls = useMemo(() => {
        if (!data) return null
        return buildWidgetUrls({
            region: decoded.region,
            sessionStartedAt,
            style,
            summoner: data,
        })
    }, [data, decoded.region, sessionStartedAt, style])

    const handleNewSession = useCallback(() => {
        setSessionStartedAt(Date.now())
    }, [])

    const createStyleSelectHandler = useCallback(
        (value: WidgetStyle) => () => {
            setStyle(value)
        },
        []
    )

    const tierColor =
        data && urls ? (TIER_COLORS[data.tier] ?? TIER_COLORS.UNRANKED) : ''

    if (isLoading) {
        return <CreateLoader />
    }

    if (isError || !data || !urls) {
        return <CreateError />
    }

    return (
        <div className="space-y-5">
            <Card className="border-border-secondary bg-bg-elevated flex flex-wrap items-center gap-3 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                <div className="min-w-0 flex-1">
                    <PlayerSummary data={data} tierColor={tierColor} />
                </div>
            </Card>

            <div className="flex flex-wrap gap-2">
                <Badge>Browser source</Badge>
                <Badge>Auto refresh</Badge>
                <Badge tone="success">Stream ready</Badge>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <WidgetPreviewPanel
                    initialData={data}
                    name={data.gameName}
                    region={decoded.region}
                    style={style}
                    tag={data.tagLine}
                />

                <Card className="border-border-secondary bg-bg-elevated space-y-3 rounded-4xl p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                    <div>
                        <p className="text-text text-sm font-semibold">
                            Choose layout
                        </p>
                        <p className="text-text-muted mt-1 text-xs">
                            See the final widget first, then lock the style and
                            copy the right URL.
                        </p>
                    </div>

                    <div className="space-y-2">
                        {STYLES.map(item => (
                            <button
                                key={item.id}
                                className="block w-full text-left"
                                type="button"
                                onClick={createStyleSelectHandler(item.id)}>
                                <Card
                                    className={cn(
                                        'flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition',
                                        style === item.id
                                            ? 'border-accent bg-accent text-bg-base'
                                            : 'border-border-secondary bg-bg-elevated text-text hover:border-border-hover'
                                    )}>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-semibold">
                                            {item.label}
                                        </div>
                                        <div
                                            className={cn(
                                                'mt-0.5 text-xs',
                                                style === item.id
                                                    ? 'text-bg-base/75'
                                                    : 'text-text-subtle'
                                            )}>
                                            {item.desc}
                                        </div>
                                    </div>
                                </Card>
                            </button>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="space-y-3">
                <UrlBlock
                    description="Persistent. No session tracking."
                    label="Widget URL"
                    url={urls.widgetUrl}
                />
                <UrlBlock
                    description="Tracks W/L from the moment you start your stream."
                    label="Session URL"
                    url={urls.sessionUrl}
                    action={
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleNewSession}>
                            <RefreshCw className="h-3 w-3" />
                            New session
                        </Button>
                    }
                />
            </div>

            <p className="text-text-muted text-center text-xs">
                Add either URL as a Browser Source in OBS.
            </p>
        </div>
    )
}
