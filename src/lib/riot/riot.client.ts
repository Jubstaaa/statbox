import { LolApi, RiotApi } from 'twisted'
import { z } from 'zod'

import 'server-only'

const { RIOT_API_KEY } = z
    .object({ RIOT_API_KEY: z.string().min(1) })
    .parse(process.env)

const options = {
    // Bounds the open sockets a cold widget's two dozen calls can hold at once.
    // It does not bound calls per second: the per-routing budget is in
    // riot.gate.ts.
    concurrency: 8,
    key: RIOT_API_KEY,
    // 429s are handled by callRiot (riot.gate.ts), which honours Retry-After
    // for every caller instead of parking each request for the whole window.
    rateLimitRetry: false,
}

export const riotApi = new RiotApi(options)
export const lolApi = new LolApi(options)
