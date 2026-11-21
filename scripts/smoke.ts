import { createHash } from 'node:crypto'

import { compressToEncodedURIComponent } from 'lz-string'

// Runs against a started production container (CI's image job) and fails the
// job when a page, the health gate, a security header or the payload cap is
// missing. No Riot call is made while the cap holds: the container has a
// placeholder key.
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

// A wedged candidate must fail the job, not hold it until its timeout.
const REQUEST_TIMEOUT_MS = 10_000

const get = (path: string) =>
    fetch(base + path, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })

// A valid widget payload padded with incompressible text: about 890
// characters on the wire, under 700 once decompressed. Only the length cap on
// the segment refuses it; without that cap it decodes to a real target and the
// route calls Riot (and answers 502 with the placeholder key) instead of 400.
const oversizedPayload = compressToEncodedURIComponent(
    JSON.stringify({
        padding: Array.from({ length: 12 }, (_, index) =>
            createHash('sha256').update(String(index)).digest('base64url')
        ).join(''),
        puuid: 'a'.repeat(78),
        queue: 'solo',
        region: 'EUW',
        style: 'classic',
    })
)
const oversized = `/api/summoner/${oversizedPayload}`

async function run() {
    const failures: string[] = []

    for (const check of checks) {
        const response = await get(check.path)
        const body = await response.text()
        const problem =
            response.status === 200
                ? check.expect(response, body)
                : `status ${response.status}`

        if (problem) failures.push(`${check.path}: ${problem}`)
    }

    const refused = await get(oversized)
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
