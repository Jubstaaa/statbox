import { createHash } from 'node:crypto'

import { compressToEncodedURIComponent } from 'lz-string'

// A widget segment that only the wire-length cap refuses: longer than 512
// characters, yet it decompresses to fewer than 1024 and holds a valid target.
// Hash output is incompressible, so the padding keeps the segment long.
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
