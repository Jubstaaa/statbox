'use client'

import { useCallback, useState } from 'react'

import {
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import Button from '@/components/button'
import Input from '@/features/widget-generator/input'
import type { Region } from '@/lib/riot/riot.types'

import ConnectedAccountCard from './connected-account-card'
import RegionPicker from './region-picker'
import {
    describeLookupError,
    fetchSummonerByPuuid,
    resolveSummoner,
} from './widget-generator.api'
import {
    type WidgetGeneratorFormErrors,
    widgetGeneratorFormSchema,
} from './widget-generator.form.schema'
import type { BuilderSettings } from './widget-generator.payload'
import {
    clearBuilderAccount,
    saveBuilderAccount,
    useBuilderAccount,
} from './widget-generator.storage'

const DEFAULT_SETTINGS: Omit<BuilderSettings, 'region'> = {
    queue: 'solo',
    sessionMode: 'all-day',
    sessionTime: null,
    style: 'classic',
}

export default function WidgetGeneratorForm() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [name, setName] = useState('')
    const [tag, setTag] = useState('')
    const [region, setRegion] = useState<Region>('EUW')
    const [formErrors, setFormErrors] = useState<WidgetGeneratorFormErrors>({})
    const [submitError, setSubmitError] = useState('')
    const account = useBuilderAccount()

    const connectedAccountQuery = useQuery({
        queryFn: account
            ? () =>
                  fetchSummonerByPuuid({
                      puuid: account.puuid,
                      queue: account.settings.queue,
                      region: account.settings.region,
                  })
            : skipToken,
        queryKey: [
            'summoner',
            account?.puuid,
            account?.settings.region,
            account?.settings.queue,
        ],
    })

    const resolveSummonerMutation = useMutation({
        // The account is saved only once its data is in the query cache under
        // the key the builder reads, so the connected card and /create never
        // fetch it again, and a failed lookup leaves nothing behind.
        mutationFn: async (params: Parameters<typeof resolveSummoner>[0]) => {
            const { puuid, region: resolvedRegion } =
                await resolveSummoner(params)
            const settings = { ...DEFAULT_SETTINGS, region: resolvedRegion }

            await queryClient.fetchQuery({
                queryFn: () =>
                    fetchSummonerByPuuid({
                        puuid,
                        queue: settings.queue,
                        region: settings.region,
                    }),
                queryKey: ['summoner', puuid, settings.region, settings.queue],
            })

            return { puuid, settings }
        },
        onError: error => {
            setSubmitError(describeLookupError(error))
        },
        onSuccess: savedAccount => {
            saveBuilderAccount(savedAccount)
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
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()

            setSubmitError('')
            const parsed = widgetGeneratorFormSchema.safeParse({ name, tag })

            if (!parsed.success) {
                const { fieldErrors } = z.flattenError(parsed.error)

                setFormErrors({
                    name: fieldErrors.name?.[0],
                    tag: fieldErrors.tag?.[0],
                })
                return
            }

            setFormErrors({})

            resolveSummonerMutation.mutate({
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
        clearBuilderAccount()
        setSubmitError('')
    }, [])

    if (account) {
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
                <p
                    className="border-loss/25 bg-loss/10 text-loss rounded-xl border px-3 py-2.5 text-xs"
                    role="alert">
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
