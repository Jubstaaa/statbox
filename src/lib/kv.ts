import { Redis } from '@upstash/redis'

export const kv = new Redis({
    token: process.env.KV_REST_API_TOKEN!,
    url: process.env.KV_REST_API_URL!,
})
