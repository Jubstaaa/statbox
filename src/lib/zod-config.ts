import { z } from 'zod'

// Zod probes `new Function('')` to decide whether it can compile parsers; the
// CSP has no 'unsafe-eval', so in the browser that probe only produces a CSP
// violation. Imported by the root client provider so it applies before any
// client-side parse.
z.config({ jitless: true })
