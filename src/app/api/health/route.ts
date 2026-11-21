import { checkCacheHealth } from '@/lib/cache'

const NO_STORE = { 'Cache-Control': 'no-store' }

// The container healthcheck calls this, so deploys (`compose up --wait`) wait
// on it: a release that cannot open or read the SQLite cache, and would serve
// every Riot request uncached, is rolled back.
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
