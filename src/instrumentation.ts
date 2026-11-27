export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return

    const { initCacheSchema } = await import('@/lib/cache')
    try {
        await initCacheSchema()
    } catch (error) {
        console.error('[cache] could not create the schema at startup:', error)
    }
}
