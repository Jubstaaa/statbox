import { z } from 'zod'

import { RANKED_QUEUES, REGIONS, WIDGET_STYLES } from './riot.constants'

export const regionSchema = z.enum(REGIONS)
export const rankedQueueSchema = z.enum(RANKED_QUEUES)
export const widgetStyleSchema = z.enum(WIDGET_STYLES)

// Riot PUUIDs are 78 URL-safe characters. Checking the shape also keeps a crafted
// value from adding path segments to the Riot URL twisted builds from it.
export const puuidSchema = z.string().regex(/^[\w-]{78}$/)

export const matchEntrySchema = z.object({
    assists: z.number(),
    champion: z.string(),
    championId: z.number(),
    deaths: z.number(),
    isRemake: z.boolean(),
    kills: z.number(),
    matchId: z.string(),
    timestamp: z.string(),
    win: z.boolean(),
})

export const riotDataSchema = z.object({
    gameName: z.string(),
    hotStreak: z.boolean(),
    leaguePoints: z.number(),
    losses: z.number(),
    matchHistory: z.array(matchEntrySchema),
    profileIconId: z.number(),
    puuid: z.string(),
    rank: z.string(),
    summonerLevel: z.number(),
    tagLine: z.string(),
    tier: z.string(),
    wins: z.number(),
})
