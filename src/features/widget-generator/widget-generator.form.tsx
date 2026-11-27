'use client'

import type { ChangeEvent, SubmitEvent } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { z } from 'zod'

import type { Region } from '@/lib/riot/riot.types'

import Button from '@/components/button'
import Input from '@/features/widget-generator/input'

import ConnectedAccountCard from './connected-account-card'
import RegionPicker from './region-picker'
import {
    resolveSummoner,
    summonerQueryOptions,
    SummonerRequestError,
} from './widget-generator.api'
import {
    type WidgetGeneratorFormErrors,
    widgetGeneratorFormSchema,
} from './widget-generator.form.schema'
import { describeLookupError } from './widget-generator.messages'
import { DEFAULT_BUILDER_SETTINGS } from './widget-generator.payload'
import {
    clearBuilderAccount,
    saveBuilderAccount,
    useBuilderAccount,
} from './widget-generator.storage'

export default function WidgetGeneratorForm() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [name, setName] = useState('')
    const [tag, setTag] = useState('')
    const [region, setRegion] = useState<Region>('EUW')
    const [formErrors, setFormErrors] = useState<WidgetGeneratorFormErrors>({})
    const account = useBuilderAccount()

    const connectedAccountQuery = useQuery(
        summonerQueryOptions(
            account && { puuid: account.puuid, ...account.settings }
        )
    )

    const resolveSummonerMutation = useMutation({
        mutationFn: async (params: Parameters<typeof resolveSummoner>[0]) => {
            const { puuid, region: resolvedRegion } =
                await resolveSummoner(params)
            const settings = {
                ...DEFAULT_BUILDER_SETTINGS,
                region: resolvedRegion,
            }

            await queryClient.query(
                summonerQueryOptions({ puuid, ...settings })
            )
            saveBuilderAccount({ puuid, settings })
        },
        onError: error => {
            if (!(error instanceof SummonerRequestError)) {
                console.error(
                    '[widget-generator] account lookup failed:',
                    error
                )
            }
        },
        onSuccess: () => {
            router.push('/create')
        },
    })
    const { mutate: lookUpAccount, reset: resetLookup } =
        resolveSummonerMutation
    const submitError = resolveSummonerMutation.error
        ? describeLookupError(resolveSummonerMutation.error)
        : ''

    const handleNameChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value)
        },
        []
    )

    const handleTagChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
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
        (event: SubmitEvent<HTMLFormElement>) => {
            event.preventDefault()

            resetLookup()
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

            lookUpAccount({
                name: parsed.data.name,
                region,
                tag: parsed.data.tag,
            })
        },
        [lookUpAccount, name, region, resetLookup, tag]
    )

    const handleOpenBuilder = useCallback(() => {
        router.push('/create')
    }, [router])

    const { refetch: refetchConnectedAccount } = connectedAccountQuery

    const handleRetryAccount = useCallback(() => {
        void refetchConnectedAccount()
    }, [refetchConnectedAccount])

    const handleChangeAccount = useCallback(() => {
        clearBuilderAccount()
        resetLookup()
    }, [resetLookup])

    if (account) {
        return (
            <ConnectedAccountCard
                onChangeAccount={handleChangeAccount}
                onOpenBuilder={handleOpenBuilder}
                onRetry={handleRetryAccount}
                query={connectedAccountQuery}
            />
        )
    }

    return (
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-[1fr_112px]">
                <Input
                    error={formErrors.name}
                    label="Game Name"
                    onChange={handleNameChange}
                    placeholder="Hide on bush"
                    value={name}
                />
                <Input
                    error={formErrors.tag}
                    label="Tag"
                    onChange={handleTagChange}
                    placeholder="EUW1"
                    value={tag}
                />
            </div>

            <RegionPicker onSelect={createRegionSelectHandler} value={region} />

            {submitError ? (
                <p
                    className="border-loss/25 bg-loss/10 text-loss rounded-xl border px-3 py-2.5 text-xs"
                    role="alert">
                    {submitError}
                </p>
            ) : null}

            <Button
                disabled={resolveSummonerMutation.isPending}
                fullWidth
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
