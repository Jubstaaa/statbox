import { checkCacheHealth } from '@/lib/cache'

const NO_STORE = { 'Cache-Control': 'no-store' }

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
