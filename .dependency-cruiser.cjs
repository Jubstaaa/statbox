module.exports = {
    forbidden: [
        {
            from: {},
            name: 'no-circular',
            severity: 'error',
            to: { circular: true },
        },
        {
            from: {
                orphan: true,
                pathNot: [
                    '\\.d\\.ts$',
                    '\\.test\\.tsx?$',

                    '^[^/]+\\.config\\.(ts|mts|mjs|cjs)$',

                    '^src/app/.*/(page|layout|not-found|error|global-error|loading|route|template|default|opengraph-image|twitter-image|icon|apple-icon|manifest|robots|sitemap)\\.(tsx?|js)$',
                    '^src/app/(page|layout|not-found|error|global-error|loading|route|template|default|opengraph-image|twitter-image|icon|apple-icon|manifest|robots|sitemap)\\.(tsx?|js)$',
                ],
            },
            name: 'no-orphans',
            severity: 'error',
            to: {},
        },
        {
            from: { path: '^src', pathNot: '\\.test\\.tsx?$' },
            name: 'not-to-dev-dep',
            severity: 'error',
            to: {
                dependencyTypes: ['npm-dev'],
                dependencyTypesNot: ['type-only'],
                pathNot: ['node_modules/@types/'],
            },
        },
        {
            from: {},
            name: 'not-to-unresolvable',
            severity: 'error',
            to: { couldNotResolve: true },
        },
        {
            from: { path: '^src/lib/' },
            name: 'lib-not-to-app-or-features',
            severity: 'error',
            to: { path: '^src/(app|features)/' },
        },
    ],
    options: {
        doNotFollow: { path: 'node_modules' },

        enhancedResolveOptions: {
            conditionNames: ['import', 'require', 'node', 'default', 'types'],
            exportsFields: ['exports'],
            extensions: ['.ts', '.tsx', '.js', '.mjs', '.json'],
        },
        exclude: { path: ['node_modules', '\\.next'] },
        tsConfig: { fileName: 'tsconfig.json' },
        tsPreCompilationDeps: true,
    },
}
