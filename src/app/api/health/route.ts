import { checkCacheHealth } from '@/lib/cache'

const NO_STORE = { 'Cache-Control': 'no-store' }

// Answers 503 when the SQLite cache cannot be opened or read, so a release
// that would serve every Riot request uncached can be told apart. The smoke
// test checks it; the container healthcheck moves to it once every image a
// deploy can roll back to serves it (see docker-compose.yml).
export async function GET() {
    try {
        await checkCacheHealth()

        return Response.json({ status: 'ok' }, { headers: NO_STORE })
    } catch (error) {
        console.error('[api/health] cache database check failed:', error)

        return Response.json(
            { status: 'unavailable' },
            { headers: NO_STORE, status: 503 }
        )
    }
}
