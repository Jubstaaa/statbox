'use client'

import { useCallback, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

import Button from '@/components/button/button'
import Input from '@/components/input/input'
import { useHydrationReady } from '@/hooks/use-hydration-ready'
import type { Region } from '@/lib/riot/riot.types'

import ConnectedAccountCard from './connected-account-card'
import RegionPicker from './region-picker'
import { fetchSummonerByPuuid, resolveSummoner } from './widget-generator.api'
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
    const storageReady = useHydrationReady()
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
        return (
            <ConnectedAccountCard
                query={connectedAccountQuery}
                onChangeAccount={handleChangeAccount}
                onOpenBuilder={handleOpenBuilder}
            />
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

            <RegionPicker value={region} onSelect={createRegionSelectHandler} />

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
