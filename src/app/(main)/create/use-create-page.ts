import type { ChangeEvent } from 'react'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { RankedQueue, RiotData, WidgetStyle } from '@/lib/riot/riot.types'

import { summonerQueryOptions } from '@/features/widget-generator/widget-generator.api'
import {
    type BuilderSettings,
    buildSessionTimestampFromTime,
    buildWidgetUrls,
    getCurrentDateTimeInputValue,
    resolveSessionTimestamp,
    type SessionMode,
} from '@/features/widget-generator/widget-generator.payload'
import {
    clearBuilderAccount,
    updateBuilderSettings,
    useBuilderAccount,
} from '@/features/widget-generator/widget-generator.storage'
import { TIER_COLORS } from '@/features/widget/widget.constants'
import { useHydrationReady } from '@/hooks/use-hydration-ready'

interface CreatePageState {
    createStyleSelectHandler: (value: WidgetStyle) => () => void

    error: unknown
    handleAllDaySession: () => void
    handleChangeAccount: () => void
    handleFlexQueue: () => void
    handleFromTimeSession: () => void
    handleSessionTimeChange: (event: ChangeEvent<HTMLInputElement>) => void
    handleSoloQueue: () => void
    isError: boolean
    isLoading: boolean
    maxSessionTime: string
    previewSession: null | number
    puuid: null | string
    queue: RankedQueue
    sessionMode: SessionMode
    sessionTime: string

    settingsNotSaved: boolean
    storageReady: boolean
    style: WidgetStyle
    summonerData: null | RiotData
    tierColor: string
    urls: null | ReturnType<typeof buildWidgetUrls>
}

export function useCreatePage(): CreatePageState {
    const router = useRouter()
    const storageReady = useHydrationReady()
    const account = useBuilderAccount()
    const [maxSessionTime] = useState(getCurrentDateTimeInputValue)
    const [settingsNotSaved, setSettingsNotSaved] = useState(false)

    const puuid = account?.puuid ?? null
    const settings = account?.settings ?? null

    const sessionTime = settings?.sessionTime ?? maxSessionTime

    useEffect(() => {
        if (storageReady && !account) router.replace('/')
    }, [account, router, storageReady])

    const update = useCallback(
        (change: Partial<BuilderSettings>) => {
            if (!account) return

            const saved = updateBuilderSettings(account.puuid, {
                ...account.settings,
                ...change,
            })
            setSettingsNotSaved(!saved)
        },
        [account]
    )

    const summonerQuery = useQuery({
        ...summonerQueryOptions(
            account && { puuid: account.puuid, ...account.settings }
        ),
        placeholderData: previousData => previousData,
    })

    const urls = useMemo(
        () =>
            account
                ? buildWidgetUrls({ puuid: account.puuid, ...account.settings })
                : null,
        [account]
    )

    const previewSession = settings ? resolveSessionTimestamp(settings) : null

    const tierColor = summonerQuery.data
        ? (TIER_COLORS[summonerQuery.data.tier] ?? TIER_COLORS.UNRANKED)
        : TIER_COLORS.UNRANKED

    const handleAllDaySession = useCallback(() => {
        update({ sessionMode: 'all-day' })
    }, [update])

    const handleFromTimeSession = useCallback(() => {
        update({
            sessionMode: 'from-time',
            sessionTime:
                buildSessionTimestampFromTime(sessionTime) === null
                    ? getCurrentDateTimeInputValue()
                    : sessionTime,
        })
    }, [sessionTime, update])

    const handleSessionTimeChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (buildSessionTimestampFromTime(event.target.value) === null)
                return

            update({ sessionTime: event.target.value })
        },
        [update]
    )

    const handleChangeAccount = useCallback(() => {
        clearBuilderAccount()
    }, [])

    const createStyleSelectHandler = useCallback(
        (value: WidgetStyle) => () => {
            update({ style: value })
        },
        [update]
    )

    const handleSoloQueue = useCallback(() => {
        update({ queue: 'solo' })
    }, [update])
    const handleFlexQueue = useCallback(() => {
        update({ queue: 'flex' })
    }, [update])

    return {
        createStyleSelectHandler,
        error: summonerQuery.error,
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
        queue: settings?.queue ?? 'solo',
        sessionMode: settings?.sessionMode ?? 'all-day',
        sessionTime,
        settingsNotSaved,
        storageReady,
        style: settings?.style ?? 'classic',
        summonerData: summonerQuery.data ?? null,
        tierColor,
        urls,
    }
}
