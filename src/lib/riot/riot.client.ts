import { LolApi, RiotApi } from 'twisted'
import { z } from 'zod'
import 'server-only'

const { RIOT_API_KEY } = z
    .object({ RIOT_API_KEY: z.string().min(1) })
    .parse(process.env)

const options = {
    concurrency: 8,
    key: RIOT_API_KEY,

    rateLimitRetry: false,
}

export const riotApi = new RiotApi(options)
export const lolApi = new LolApi(options)
