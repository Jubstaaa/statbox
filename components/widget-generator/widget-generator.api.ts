import type { RankedQueue, Region, RiotData } from '@/lib/riot/riot.types'

import type { ResolveSummonerParams } from './widget-generator.types'

export async function resolveSummoner({ name, region, tag }: ResolveSummonerParams) {
    const params = new URLSearchParams({ name, region, tag })
    const res = await fetch(`/api/summoner/resolve?${params.toString()}`)

    if (!res.ok) throw new Error('Summoner not found')

    return (await res.json()) as { puuid: string; region: Region }
}

export async function fetchSummonerByPuuid({
    puuid,
    queue,
    region,
    session,
}: {
    puuid: string
    queue: RankedQueue
    region: Region
    session?: number | null
}) {
    const params = new URLSearchParams()
    params.set('queue', queue)
    params.set('region', region)

    if (typeof session === 'number') params.set('session', String(session))

    const query = params.toString()
    const res = await fetch(`/api/summoner/${puuid}${query ? `?${query}` : ''}`)

    if (!res.ok) throw new Error('Summoner not found')

    return (await res.json()) as RiotData
}
