// Runs once before the server takes requests. Creating the cache schema here
// lets a new or emptied data directory pass /api/health on its first deploy,
// before any Riot traffic. A database that cannot be opened is only logged:
// the server still answers (uncached), and /api/health keeps failing, which is
// what the container healthcheck and the deploy act on.
export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return

    const { initCacheSchema } = await import('@/lib/cache')
    try {
        await initCacheSchema()
    } catch (error) {
        console.error('[cache] could not create the schema at startup:', error)
    }
}
