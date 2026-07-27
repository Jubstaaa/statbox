// Data Dragon has no "latest" alias: every asset URL carries an explicit version,
// and each version's asset set is frozen — a profile icon added after 14.24.1
// shipped answers 403 on 14.24.1 forever. So the version is resolved on the server
// once a day and handed down to the client, instead of being pinned in source.
const DDRAGON_CDN = 'https://ddragon.leagueoflegends.com/cdn'
const VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json'
const VERSION_REVALIDATE_SECONDS = 86400
const FALLBACK_DDRAGON_VERSION = '16.14.1'

// Keeps the newest version this process has actually seen, so a failed lookup
// degrades to that rather than dropping back to a constant that ages into 403s.
let lastResolvedVersion = FALLBACK_DDRAGON_VERSION

export async function getDdragonVersion(): Promise<string> {
    try {
        const response = await fetch(VERSIONS_URL, {
            next: { revalidate: VERSION_REVALIDATE_SECONDS },
        })

        if (!response.ok) {
            throw new Error(`versions.json responded ${response.status}`)
        }

        const [latest] = (await response.json()) as string[]

        if (!latest) throw new Error('versions.json returned no versions')

        lastResolvedVersion = latest

        return latest
    } catch (error) {
        console.error('[ddragon] version lookup failed:', error)

        return lastResolvedVersion
    }
}

export function buildProfileIconUrl(version: string, iconId: number) {
    return `${DDRAGON_CDN}/${version}/img/profileicon/${iconId}.png`
}

export function buildChampionIconUrl(version: string, championName: string) {
    return `${DDRAGON_CDN}/${version}/img/champion/${championName}.png`
}
