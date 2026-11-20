import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { skipToken, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { fetchSummonerByPuuid } from '@/features/widget-generator/widget-generator.api'
import {
    buildSessionTimestampFromTime,
    buildWidgetUrls,
    getCurrentDateTimeInputValue,
    resolveSessionTimestamp,
    type SessionMode,
} from '@/features/widget-generator/widget-generator.payload'
import {
    clearBuilderAccount,
    getBuilderAccount,
    saveBuilderSettings,
} from '@/features/widget-generator/widget-generator.storage'
import { TIER_COLORS } from '@/features/widget/widget.constants'
import { useHydrationReady } from '@/hooks/use-hydration-ready'
import type { RankedQueue, RiotData, WidgetStyle } from '@/lib/riot/riot.types'

interface CreatePageState {
    createStyleSelectHandler: (value: WidgetStyle) => () => void
    handleAllDaySession: () => void
    handleChangeAccount: () => void
    handleFlexQueue: () => void
    handleFromTimeSession: () => void
    handleSessionTimeChange: (event: ChangeEvent<HTMLInputElement>) => void
    handleSoloQueue: () => void
    isError: boolean
    isLoading: boolean
    maxSessionTime: string
    previewSession: number | null
    puuid: string | null
    queue: RankedQueue
    sessionMode: SessionMode
    sessionTime: string
    storageReady: boolean
    style: WidgetStyle
    summonerData: RiotData | null
    tierColor: string
    urls: ReturnType<typeof buildWidgetUrls> | null
}

export function useCreatePage(): CreatePageState {
    const router = useRouter()

    const [maxSessionTime] = useState(() => getCurrentDateTimeInputValue())
    // Read once: from here on this page owns the settings and writes them back.
    // Without a saved account there is no region to ask Riot with, so the page
    // sends the visitor home instead of guessing one.
    const [account] = useState(getBuilderAccount)
    const puuid = account?.puuid ?? null
    const region = account?.settings.region ?? 'EUW'
    const [style, setStyle] = useState<WidgetStyle>(
        account?.settings.style ?? 'classic'
    )
    const [queue, setQueue] = useState<RankedQueue>(
        account?.settings.queue ?? 'solo'
    )
    const [sessionMode, setSessionMode] = useState<SessionMode>(
        account?.settings.sessionMode ?? 'all-day'
    )
    const [sessionTime, setSessionTime] = useState<string>(
        () => account?.settings.sessionTime ?? getCurrentDateTimeInputValue()
    )
    const storageReady = useHydrationReady()

    useEffect(() => {
        if (!storageReady || !puuid) return

        saveBuilderSettings({
            queue,
            region,
            sessionMode,
            sessionTime,
            style,
        })
    }, [puuid, queue, region, sessionMode, sessionTime, storageReady, style])

    useEffect(() => {
        if (storageReady && !puuid) router.replace('/')
    }, [puuid, router, storageReady])

    const summonerQuery = useQuery({
        placeholderData: previousData => previousData,
        queryFn: puuid
            ? () => fetchSummonerByPuuid({ puuid, queue, region })
            : skipToken,
        queryKey: ['summoner', puuid, region, queue],
    })

    const urls = useMemo(() => {
        if (!puuid) return null

        return buildWidgetUrls({
            puuid,
            queue,
            region,
            sessionMode,
            sessionTime,
            style,
        })
    }, [puuid, queue, region, sessionMode, sessionTime, style])

    const previewSession = useMemo(
        () => resolveSessionTimestamp({ sessionMode, sessionTime }),
        [sessionMode, sessionTime]
    )

    const tierColor = useMemo(
        () =>
            summonerQuery.data
                ? (TIER_COLORS[summonerQuery.data.tier] ?? TIER_COLORS.UNRANKED)
                : TIER_COLORS.UNRANKED,
        [summonerQuery.data]
    )

    const handleAllDaySession = useCallback(() => {
        setSessionMode('all-day')
    }, [])

    const handleFromTimeSession = useCallback(() => {
        setSessionMode('from-time')
        setSessionTime(currentValue =>
            buildSessionTimestampFromTime(currentValue) === null
                ? getCurrentDateTimeInputValue()
                : currentValue
        )
    }, [])

    const handleSessionTimeChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (buildSessionTimestampFromTime(event.target.value) === null)
                return

            setSessionTime(event.target.value)
        },
        []
    )

    const handleChangeAccount = useCallback(() => {
        clearBuilderAccount()
        router.push('/')
    }, [router])

    const createStyleSelectHandler = useCallback(
        (value: WidgetStyle) => () => {
            setStyle(value)
        },
        []
    )

    const handleSoloQueue = useCallback(() => {
        setQueue('solo')
    }, [])
    const handleFlexQueue = useCallback(() => {
        setQueue('flex')
    }, [])

    return {
        createStyleSelectHandler,
        handleAllDaySession,
        handleChangeAccount,
        handleFlexQueue,
        handleFromTimeSession,
        handleSessionTimeChange,
        handleSoloQueue,
        isError: summonerQuery.isError,
        isLoading: summonerQuery.isLoading,
        maxSessionTime,
        previewSession,
        puuid,
        queue,
        sessionMode,
        sessionTime,
        storageReady,
        style,
        summonerData: summonerQuery.data ?? null,
        tierColor,
        urls,
    }
}
