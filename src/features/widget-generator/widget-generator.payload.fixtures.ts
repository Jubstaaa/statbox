import { compressToEncodedURIComponent } from 'lz-string'
import { createHash } from 'node:crypto'

export function buildOverlongValidSegment(puuid: string) {
    return compressToEncodedURIComponent(
        JSON.stringify({
            padding: Array.from({ length: 12 }, (_, index) =>
                createHash('sha256').update(String(index)).digest('base64url')
            ).join(''),
            puuid,
            queue: 'solo',
            region: 'EUW',
            style: 'classic',
        })
    )
}
