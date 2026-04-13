import { LolApi, RiotApi } from 'twisted'

const RIOT_API_KEY = process.env.RIOT_API_KEY!

export const riotApi = new RiotApi({ key: RIOT_API_KEY, rateLimitRetry: true })
export const lolApi = new LolApi({ key: RIOT_API_KEY, rateLimitRetry: true })
