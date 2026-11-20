// Runs against a started production container (CI's image job) and fails the
// job when a page, the health gate, a security header or the payload cap is
// missing. No Riot call is made: the container has a placeholder key.
const base = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3003'

interface Check {
    expect: (response: Response, body: string) => string | null
    path: string
}

const canonical = (path: string) => (_: Response, body: string) =>
    body.includes(`<link rel="canonical" href="https://statbox.live${path}"/>`)
        ? null
        : `canonical is not https://statbox.live${path}`

const checks: Check[] = [
    {
        expect: (response, body) =>
            !body.includes('StatBox')
                ? 'home page has no StatBox text'
                : !response.headers
                        .get('content-security-policy')
                        ?.includes("frame-ancestors 'none'")
                  ? 'home page has no framing CSP'
                  : null,
        path: '/',
    },
    { expect: canonical('/privacy'), path: '/privacy' },
    { expect: canonical('/terms'), path: '/terms' },
    {
        expect: (_, body) =>
            body === '{"status":"ok"}' ? null : `health answered ${body}`,
        path: '/api/health',
    },
    { expect: () => null, path: '/robots.txt' },
    { expect: () => null, path: '/widget/not-a-payload' },
]

// Oversized widget payloads are refused before any decompression.
const oversized = `/api/summoner/${'A'.repeat(600)}?region=EUW`

async function run() {
    const failures: string[] = []

    for (const check of checks) {
        const response = await fetch(base + check.path)
        const body = await response.text()
        const problem =
            response.status === 200
                ? check.expect(response, body)
                : `status ${response.status}`

        if (problem) failures.push(`${check.path}: ${problem}`)
    }

    const refused = await fetch(base + oversized)
    if (refused.status !== 400) {
        failures.push(`oversized payload: status ${refused.status}, want 400`)
    }

    if (failures.length > 0) {
        console.error(
            `Smoke test failed against ${base}:\n${failures.join('\n')}`
        )
        process.exit(1)
    }

    console.info(
        `Smoke test passed against ${base} (${checks.length + 1} checks)`
    )
}

run().catch((error: unknown) => {
    console.error(`Smoke test could not reach ${base}:`, error)
    process.exit(1)
})
