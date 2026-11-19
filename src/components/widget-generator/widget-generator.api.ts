import type { RankedQueue, Region, RiotData } from '@/lib/riot/riot.types'

import type { ResolveSummonerParams } from './widget-generator.types'

export async function resolveSummoner({
    name,
    region,
    tag,
}: ResolveSummonerParams) {
    const params = new URLSearchParams({ name, region, tag })
    const res = await fetch(`/api/summoner/resolve?${params.toString()}`)

    if (!res.ok) throw new Error('Summoner not found')

    return (await res.json()) as { puuid: string; region: Region }
}

export async function fetchSummonerByPuuid({
    puuid,
    queue,
    region,
}: {
    puuid: string
    queue: RankedQueue
    region: Region
}) {
    const params = new URLSearchParams({ queue, region })
    // Revalidate on every poll: the edge answers from its own short cache, but a
    // browser-cached copy could otherwise keep an overlay frozen for hours.
    const res = await fetch(`/api/summoner/${puuid}?${params.toString()}`, {
        cache: 'no-cache',
    })

    if (!res.ok) throw new Error('Summoner not found')

    return (await res.json()) as RiotData
}
