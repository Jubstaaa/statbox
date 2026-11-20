import { checkCacheHealth } from '@/lib/cache'

const NO_STORE = { 'Cache-Control': 'no-store' }

// The container healthcheck and the deploy's health gate call this. It reads
// the SQLite cache, so a release that cannot open its data is rolled back
// instead of serving every Riot request uncached.
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
