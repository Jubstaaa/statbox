'use client'

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
} from 'react'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { TIER_COLORS } from '@/components/widget/widget.constants'
import { fetchSummonerByPuuid } from '@/components/widget-generator/widget-generator.api'
import {
    buildSessionTimestampFromTime,
    buildWidgetUrls,
    getCurrentDateTimeInputValue,
    resolveSessionTimestamp,
} from '@/components/widget-generator/widget-generator.payload'
import {
    clearStoredBuilderPuuid,
    clearStoredBuilderSettings,
    getStoredBuilderPuuid,
    getStoredBuilderSettings,
    setStoredBuilderSettings,
} from '@/components/widget-generator/widget-generator.storage'
import type { RankedQueue, WidgetStyle } from '@/lib/riot/riot.types'

export function useCreatePage() {
    const router = useRouter()

    const [maxSessionTime] = useState(() => getCurrentDateTimeInputValue())
    const [puuid] = useState<string | null>(() => getStoredBuilderPuuid())
    const [style, setStyle] = useState<WidgetStyle>(
        () => getStoredBuilderSettings()?.style ?? 'classic'
    )
    const [queue, setQueue] = useState<RankedQueue>(
        () => getStoredBuilderSettings()?.queue ?? 'solo'
    )
    const [region] = useState(() => getStoredBuilderSettings()?.region ?? 'EUW')
    const [sessionMode, setSessionMode] = useState<'all-day' | 'from-time'>(
        () => getStoredBuilderSettings()?.sessionMode ?? 'all-day'
    )
    const [sessionTime, setSessionTime] = useState<string>(
        () =>
            getStoredBuilderSettings()?.sessionTime ??
            getCurrentDateTimeInputValue()
    )
    const storageReady = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    )

    useEffect(() => {
        if (!storageReady) return

        setStoredBuilderSettings({
            queue,
            region,
            sessionMode,
            sessionTime,
            style,
        })
    }, [queue, region, sessionMode, sessionTime, storageReady, style])

    useEffect(() => {
        if (storageReady && !puuid) router.replace('/')
    }, [puuid, router, storageReady])

    const summonerQuery = useQuery({
        enabled: !!puuid,
        placeholderData: previousData => previousData,
        queryFn: () => fetchSummonerByPuuid({ puuid: puuid!, queue, region }),
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
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (buildSessionTimestampFromTime(event.target.value) === null)
                return

            setSessionTime(event.target.value)
        },
        []
    )

    const handleChangeAccount = useCallback(() => {
        clearStoredBuilderPuuid()
        clearStoredBuilderSettings()
        router.push('/')
    }, [router])

    const createStyleSelectHandler = useCallback(
        (value: WidgetStyle) => () => {
            setStyle(value)
        },
        []
    )

    const handleSoloQueue = useCallback(() => setQueue('solo'), [])
    const handleFlexQueue = useCallback(() => setQueue('flex'), [])

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
