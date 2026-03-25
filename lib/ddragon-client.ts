'use client'

const FALLBACK_DDRAGON_VERSION = '14.24.1'
let ddragonReady: Promise<void> | null = null
let ddragonVersion = FALLBACK_DDRAGON_VERSION

export function initDdragon() {
    if (!ddragonReady) {
        ddragonReady = (async () => {
            try {
                const res = await fetch(
                    'https://ddragon.leagueoflegends.com/api/versions.json'
                )
                const versions = (await res.json()) as string[]
                ddragonVersion = versions[0] ?? FALLBACK_DDRAGON_VERSION
            } catch {
                ddragonVersion = FALLBACK_DDRAGON_VERSION
            }
        })()
    }

    return ddragonReady
}

export function getProfileIconUrl(iconId: number) {
    return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${iconId}.png`
}

export function getChampionIconUrl(championName: string) {
    return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${championName}.png`
}
