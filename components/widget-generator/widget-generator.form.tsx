'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

import Button from '@/components/button/button'
import Card from '@/components/card/card'
import Chip from '@/components/chip/chip'
import Input from '@/components/input/input'
import PlayerSummary from '@/components/widget/shared/player-summary'
import { TIER_COLORS } from '@/components/widget/widget.constants'
import type { Region } from '@/lib/riot/riot.types'

import { fetchSummonerByPuuid, resolveSummoner } from './widget-generator.api'
import { BUILDER_REGIONS } from './widget-generator.constants'
import {
    type WidgetGeneratorFormErrors,
    widgetGeneratorFormSchema,
} from './widget-generator.form.schema'
import {
    clearStoredBuilderPuuid,
    getStoredBuilderPuuid,
    getStoredBuilderSettings,
    setStoredBuilderPuuid,
    setStoredBuilderSettings,
} from './widget-generator.storage'

export default function WidgetGeneratorForm() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [, setStorageVersion] = useState(0)
    const [name, setName] = useState('')
    const [tag, setTag] = useState('')
    const [region, setRegion] = useState<Region>('EUW')
    const [formErrors, setFormErrors] = useState<WidgetGeneratorFormErrors>({})
    const [submitError, setSubmitError] = useState('')
    const storageReady = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    )
    const storedPuuid = storageReady ? getStoredBuilderPuuid() : null

    const connectedAccountQuery = useQuery({
        enabled: storageReady && !!storedPuuid,
        queryFn: () =>
            fetchSummonerByPuuid({
                puuid: storedPuuid!,
                queue: getStoredBuilderSettings()?.queue ?? 'solo',
                region: getStoredBuilderSettings()?.region ?? 'EUW',
            }),
        queryKey: [
            'summoner',
            storedPuuid,
            getStoredBuilderSettings()?.region,
            getStoredBuilderSettings()?.queue,
        ],
    })

    const resolveSummonerMutation = useMutation({
        mutationFn: resolveSummoner,
        onError: () => {
            setSubmitError(
                'Summoner not found. Check the name, tag, and region.'
            )
        },
        onSuccess: async ({ puuid, region: resolvedRegion }) => {
            setStoredBuilderPuuid(puuid)
            setStorageVersion(currentValue => currentValue + 1)

            await queryClient.fetchQuery({
                queryFn: () =>
                    fetchSummonerByPuuid({
                        puuid,
                        queue: 'solo',
                        region: resolvedRegion,
                    }),
                queryKey: ['summoner', puuid, resolvedRegion, 'solo'],
            })

            setStoredBuilderSettings({
                queue: 'solo',
                region: resolvedRegion,
                sessionMode: 'all-day',
                sessionTime: null,
                style: 'classic',
            })

            router.push('/create')
        },
    })

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

            setSubmitError('')
            const parsed = widgetGeneratorFormSchema.safeParse({ name, tag })

            if (!parsed.success) {
                const fieldErrors = parsed.error.flatten().fieldErrors

                setFormErrors({
                    name: fieldErrors.name?.[0],
                    tag: fieldErrors.tag?.[0],
                })
                return
            }

            setFormErrors({})

            await resolveSummonerMutation.mutateAsync({
                name: parsed.data.name,
                region,
                tag: parsed.data.tag,
            })
        },
        [name, region, resolveSummonerMutation, tag]
    )

    const handleOpenBuilder = useCallback(() => {
        router.push('/create')
    }, [router])

    const handleChangeAccount = useCallback(() => {
        clearStoredBuilderPuuid()
        setStorageVersion(currentValue => currentValue + 1)
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
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-[1fr_112px]">
                <Input
                    error={formErrors.name}
                    label="Game Name"
                    placeholder="Hide on bush"
                    value={name}
                    onChange={handleNameChange}
                />
                <Input
                    error={formErrors.tag}
                    label="Tag"
                    placeholder="EUW1"
                    value={tag}
                    onChange={handleTagChange}
                />
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-text-strong text-[11px] font-semibold tracking-[0.18em] uppercase">
                    Region
                </span>
                <div className="flex flex-wrap gap-2">
                    {BUILDER_REGIONS.map(value => (
                        <Chip
                            key={value}
                            active={region === value}
                            className="flex-1 basis-[calc(25%-0.375rem)]"
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

            <Button
                fullWidth
                disabled={resolveSummonerMutation.isPending}
                size="lg"
                type="submit">
                {resolveSummonerMutation.isPending ? (
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
