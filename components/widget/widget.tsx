'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { initDdragon } from '@/lib/ddragon-client'
import type { RiotData } from '@/lib/riot/riot.types'

import ClassicWidget from './classic-widget'
import CompactWidget from './compact-widget'
import MinimalWidget from './minimal-widget'
import { POLL_INTERVAL, TIER_COLORS } from './widget.constants'
import WidgetError from './widget.error'
import WidgetLoader from './widget.loader'
import type { ComputedData, WidgetProps } from './widget.types'

export default function Widget({
    initialData,
    payload,
    puuid,
    queue = 'solo',
    region,
    session,
    style,
}: WidgetProps) {
    const [fetchedData, setFetchedData] = useState<RiotData | null>(null)
    const [assetsReady, setAssetsReady] = useState(false)
    const [error, setError] = useState(false)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const resourceId = payload ?? puuid

            if (!resourceId) {
                setError(true)
                return
            }

            await initDdragon()
            const url = new URL(
                `/api/summoner/${resourceId}`,
                window.location.origin
            )
            url.searchParams.set('queue', queue)
            if (region) {
                url.searchParams.set('region', region)
            }
            if (session) url.searchParams.set('session', String(session))

            const res = await fetch(url.toString())
            if (!res.ok) {
                if (!fetchedData && !initialData) {
                    setError(true)
                }
                return
            }

            const json = (await res.json()) as RiotData
            setFetchedData(json)
            setError(false)
        } catch {
            if (!fetchedData && !initialData) {
                setError(true)
            }
        }
    }, [fetchedData, initialData, payload, puuid, queue, region, session])

    useEffect(() => {
        void initDdragon().then(() => setAssetsReady(true))
    }, [])

    useEffect(() => {
        if (initialData) return

        const initialLoad = window.setTimeout(() => {
            void fetchData()
        }, 0)
        intervalRef.current = setInterval(fetchData, POLL_INTERVAL)

        return () => {
            window.clearTimeout(initialLoad)
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [fetchData, initialData])

    const data = initialData ?? fetchedData

    if (error) return <WidgetError style={style} />
    if (!data || !assetsReady) return <WidgetLoader style={style} />

    const filteredMatchHistory = session
        ? data.matchHistory.filter(
              match => new Date(match.timestamp).getTime() >= session
          )
        : data.matchHistory

    const sessionWins = filteredMatchHistory.filter(match => match.win).length
    const sessionLosses = filteredMatchHistory.filter(
        match => !match.win
    ).length
    const sessionGames = sessionWins + sessionLosses
    const winRate =
        sessionGames > 0 ? Math.round((sessionWins / sessionGames) * 100) : null

    const totalKills = filteredMatchHistory.reduce(
        (sum, match) => sum + match.kills,
        0
    )
    const totalDeaths = filteredMatchHistory.reduce(
        (sum, match) => sum + match.deaths,
        0
    )
    const totalAssists = filteredMatchHistory.reduce(
        (sum, match) => sum + match.assists,
        0
    )
    const avgKills = sessionGames > 0 ? totalKills / sessionGames : 0
    const avgDeaths = sessionGames > 0 ? totalDeaths / sessionGames : 0
    const avgAssists = sessionGames > 0 ? totalAssists / sessionGames : 0
    const kdaRatio =
        totalDeaths === 0
            ? null
            : ((totalKills + totalAssists) / totalDeaths).toFixed(2)

    const computed: ComputedData = {
        avgAssists,
        avgDeaths,
        avgKills,
        data,
        kdaRatio,
        recent: filteredMatchHistory.slice(0, 5),
        session,
        sessionGames,
        sessionLosses,
        sessionWins,
        tierColor: TIER_COLORS[data.tier] ?? TIER_COLORS.UNRANKED,
        winRate,
    }

    if (style === 'minimal') return <MinimalWidget {...computed} />
    if (style === 'compact') return <CompactWidget {...computed} />
    return <ClassicWidget {...computed} />
}
