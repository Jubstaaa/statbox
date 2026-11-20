/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-circular',
            severity: 'error',
            from: {},
            to: { circular: true },
        },
        {
            name: 'no-orphans',
            severity: 'error',
            from: {
                orphan: true,
                pathNot: [
                    '\\.d\\.ts$',
                    '\\.test\\.tsx?$',
                    // Root config files are loaded by their tools.
                    '^[^/]+\\.config\\.(ts|mts|mjs|cjs)$',
                    // Next.js special files are entry points, not orphans.
                    '^src/app/.*/?(page|layout|not-found|error|global-error|loading|route|template|default|opengraph-image|twitter-image|icon|apple-icon|manifest|robots|sitemap)\\.(tsx?|js)$',
                ],
            },
            to: {},
        },
        {
            name: 'not-to-dev-dep',
            severity: 'error',
            from: { path: '^src', pathNot: '\\.test\\.tsx?$' },
            to: {
                dependencyTypes: ['npm-dev'],
                dependencyTypesNot: ['type-only'],
                pathNot: ['node_modules/@types/'],
            },
        },
        {
            name: 'not-to-unresolvable',
            severity: 'error',
            from: {},
            to: { couldNotResolve: true },
        },
        {
            // Shared infrastructure must not reach into routes or features.
            name: 'lib-not-to-app-or-features',
            severity: 'error',
            from: { path: '^src/lib/' },
            to: { path: '^src/(app|features)/' },
        },
    ],
    options: {
        doNotFollow: { path: 'node_modules' },
        // dependency-cruiser reads TypeScript through the `typescript` package,
        // which this repo aliases to the TypeScript 6 API (TS 7 has no such API).
        tsConfig: { fileName: 'tsconfig.json' },
        tsPreCompilationDeps: true,
        enhancedResolveOptions: {
            exportsFields: ['exports'],
            conditionNames: ['import', 'require', 'node', 'default', 'types'],
            extensions: ['.ts', '.tsx', '.js', '.mjs', '.json'],
        },
        exclude: { path: ['node_modules', '\\.next'] },
    },
}
