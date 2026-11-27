import { z } from 'zod'

const DDRAGON_CDN = 'https://ddragon.leagueoflegends.com/cdn'
const VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json'
const VERSION_REVALIDATE_SECONDS = 86400
const FALLBACK_DDRAGON_VERSION = '16.14.1'

const versionsSchema = z.tuple(
    [z.string().regex(/^\d+\.\d+\.\d+$/)],
    z.string()
)

let lastResolvedVersion = FALLBACK_DDRAGON_VERSION

export function buildChampionIconUrl(version: string, championName: string) {
    return `${DDRAGON_CDN}/${version}/img/champion/${championName}.png`
}

export function buildProfileIconUrl(version: string, iconId: number) {
    return `${DDRAGON_CDN}/${version}/img/profileicon/${iconId}.png`
}

export async function getDdragonVersion(): Promise<string> {
    try {
        const response = await fetch(VERSIONS_URL, {
            next: { revalidate: VERSION_REVALIDATE_SECONDS },
        })

        if (!response.ok) {
            throw new Error(`versions.json responded ${response.status}`)
        }

        const [latest] = versionsSchema.parse(await response.json())

        lastResolvedVersion = latest

        return latest
    } catch (error) {
        console.error('[ddragon] version lookup failed:', error)

        return lastResolvedVersion
    }
}
