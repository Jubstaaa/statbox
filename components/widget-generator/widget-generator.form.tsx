'use client'

import { useCallback, useEffect, useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

import Button from '@/components/button/button'
import Card from '@/components/card/card'
import Chip from '@/components/chip/chip'
import Input from '@/components/input/input'
import PlayerSummary from '@/components/widget/player-summary'
import { TIER_COLORS } from '@/components/widget/widget.constants'
import type { Region } from '@/lib/riot/riot.types'

import { REGIONS } from './widget-generator.constants'
import {
    clearStoredBuilderPuuid,
    fetchSummonerByPuuid,
    getStoredBuilderPuuid,
    getStoredBuilderSettings,
    resolveSummoner,
    setStoredBuilderPuuid,
    setStoredBuilderSettings,
    validateSummonerForm,
} from './widget-generator.utils'

export default function WidgetGeneratorForm() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [storedPuuid, setStoredPuuid] = useState<string | null>(null)
    const [storageReady, setStorageReady] = useState(false)
    const [name, setName] = useState('')
    const [tag, setTag] = useState('')
    const [region, setRegion] = useState<Region>('TR')
    const [formErrors, setFormErrors] = useState<{
        name?: string
        tag?: string
    }>({})
    const [submitError, setSubmitError] = useState('')
    const [loading, setLoading] = useState(false)

    const connectedAccountQuery = useQuery({
        enabled: storageReady && !!storedPuuid,
        queryFn: () =>
            fetchSummonerByPuuid({
                puuid: storedPuuid!,
                queue: getStoredBuilderSettings()?.queue ?? 'solo',
                region: getStoredBuilderSettings()?.region ?? 'TR',
            }),
        queryKey: [
            'summoner',
            storedPuuid,
            getStoredBuilderSettings()?.region,
            getStoredBuilderSettings()?.queue,
        ],
    })

    useEffect(() => {
        setStoredPuuid(getStoredBuilderPuuid())
        setStorageReady(true)
    }, [])

    useEffect(() => {
        if (!connectedAccountQuery.isError) return

        clearStoredBuilderPuuid()
        setStoredPuuid(null)
    }, [connectedAccountQuery.isError])

    const handleNameChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value)
        },
        []
    )

    const handleTagChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setTag(event.target.value)
        },
        []
    )

    const createRegionSelectHandler = useCallback(
        (value: Region) => () => {
            setRegion(value)
        },
        []
    )

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()

            const { cleanName, cleanTag, errors } = validateSummonerForm(
                name,
                tag
            )
            setFormErrors(errors)
            setSubmitError('')
            if (Object.keys(errors).length > 0) return

            setLoading(true)

            try {
                const { puuid, region: resolvedRegion } = await resolveSummoner(
                    {
                        name: cleanName,
                        region,
                        tag: cleanTag,
                    }
                )

                setStoredBuilderPuuid(puuid)
                setStoredPuuid(puuid)

                await queryClient.fetchQuery({
                    queryFn: () =>
                        fetchSummonerByPuuid({
                            puuid,
                            queue: 'solo',
                            region: resolvedRegion,
                        }),
                    queryKey: ['summoner', puuid, resolvedRegion],
                })

                setStoredBuilderSettings({
                    queue: 'solo',
                    region: resolvedRegion,
                    sessionMode: 'all-day',
                    sessionTime: null,
                    style: 'classic',
                })

                router.push('/create')
            } catch {
                setSubmitError(
                    'Summoner not found. Check the name, tag, and region.'
                )
            } finally {
                setLoading(false)
            }
        },
        [name, queryClient, region, router, tag]
    )

    const handleOpenBuilder = useCallback(() => {
        router.push('/create')
    }, [router])

    const handleChangeAccount = useCallback(() => {
        clearStoredBuilderPuuid()
        setStoredPuuid(null)
        setSubmitError('')
    }, [])

    if (storageReady && storedPuuid) {
        if (connectedAccountQuery.isLoading || !connectedAccountQuery.data) {
            return (
                <Card className="border-border-secondary bg-bg-elevated space-y-4 rounded-4xl p-5">
                    <div>
                        <p className="text-accent-2 text-[11px] font-semibold tracking-[0.22em] uppercase">
                            Connected account
                        </p>
                        <p className="text-text-muted mt-1 text-sm">
                            Restoring your last builder session.
                        </p>
                    </div>
                    <Button disabled fullWidth size="lg">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading account...
                    </Button>
                </Card>
            )
        }

        return (
            <Card className="border-border-secondary bg-bg-elevated space-y-4 rounded-4xl p-5">
                <div>
                    <p className="text-accent-2 text-[11px] font-semibold tracking-[0.22em] uppercase">
                        Connected account
                    </p>
                    <p className="text-text-muted mt-1 text-sm">
                        Your builder is ready with the saved Riot account.
                    </p>
                </div>

                <PlayerSummary
                    data={connectedAccountQuery.data}
                    tierColor={
                        TIER_COLORS[connectedAccountQuery.data.tier] ??
                        TIER_COLORS.UNRANKED
                    }
                />

                <div className="flex flex-wrap gap-3">
                    <Button onClick={handleOpenBuilder}>Open builder</Button>
                    <Button variant="secondary" onClick={handleChangeAccount}>
                        Change account
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <form className="w-full max-w-sm space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-[1fr_112px]">
                <Input
                    description="Riot ID name without the hashtag."
                    error={formErrors.name}
                    label="Game Name"
                    placeholder="Hide on bush"
                    value={name}
                    onChange={handleNameChange}
                />
                <Input
                    description="Region tag, for example TR1."
                    error={formErrors.tag}
                    label="Tag"
                    placeholder="TR1"
                    value={tag}
                    onChange={handleTagChange}
                />
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-text-strong text-[11px] font-semibold tracking-[0.18em] uppercase">
                    Region
                </span>
                <div className="flex flex-wrap gap-2">
                    {REGIONS.map(value => (
                        <Chip
                            key={value}
                            active={region === value}
                            onClick={createRegionSelectHandler(value)}>
                            {value}
                        </Chip>
                    ))}
                </div>
            </div>

            {submitError ? (
                <p className="border-loss/25 bg-loss/10 text-loss rounded-xl border px-3 py-2.5 text-xs">
                    {submitError}
                </p>
            ) : null}

            <Button fullWidth disabled={loading} size="lg" type="submit">
                {loading ? (
                    <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Checking account...
                    </>
                ) : (
                    'Continue'
                )}
            </Button>
        </form>
    )
}
