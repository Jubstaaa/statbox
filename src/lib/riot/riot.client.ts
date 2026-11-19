import { LolApi, RiotApi } from 'twisted'
import { z } from 'zod'

const { RIOT_API_KEY } = z
    .object({ RIOT_API_KEY: z.string().min(1) })
    .parse(process.env)

const options = {
    // A cold widget fans out into about two dozen calls; capping the in-flight
    // ones keeps a burst of new widgets from tripping Riot's per-second limit.
    concurrency: 8,
    key: RIOT_API_KEY,
    // 429s are handled by callRiot (riot.gate.ts), which honours Retry-After
    // for every caller instead of parking each request for the whole window.
    rateLimitRetry: false,
}

export const riotApi = new RiotApi(options)
export const lolApi = new LolApi(options)
