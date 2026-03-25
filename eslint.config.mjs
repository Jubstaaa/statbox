import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import prettierPlugin from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            import: importPlugin,
            perfectionist: perfectionistPlugin,
            prettier: prettierPlugin,
            react: reactPlugin,
        },
        settings: {
            'import/resolver': {
                typescript: true,
            },
        },
        rules: {
            ...eslintConfigPrettier.rules,
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            'import/order': [
                'error',
                {
                    alphabetize: {
                        caseInsensitive: true,
                        order: 'asc',
                    },
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    'newlines-between': 'always',
                    pathGroups: [
                        {
                            group: 'external',
                            pattern: 'react',
                            position: 'before',
                        },
                        {
                            group: 'external',
                            pattern: 'react-*',
                            position: 'before',
                        },
                        {
                            group: 'internal',
                            pattern: '@/**',
                            position: 'after',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['react'],
                },
            ],
            'perfectionist/sort-interfaces': [
                'error',
                {
                    customGroups: [
                        {
                            elementNamePattern: '^(id|uuid)$',
                            groupName: 'identity',
                        },
                        {
                            elementNamePattern: '^on[A-Z]',
                            groupName: 'callbacks',
                        },
                    ],
                    groups: ['identity', 'unknown', 'callbacks'],
                    order: 'asc',
                    type: 'alphabetical',
                },
            ],
            'perfectionist/sort-named-imports': [
                'warn',
                {
                    order: 'asc',
                    type: 'alphabetical',
                },
            ],
            'perfectionist/sort-object-types': [
                'error',
                {
                    customGroups: [
                        {
                            elementNamePattern: '^(id|uuid)$',
                            groupName: 'identity',
                        },
                        {
                            elementNamePattern: '^on[A-Z]',
                            groupName: 'callbacks',
                        },
                    ],
                    groups: ['identity', 'unknown', 'callbacks'],
                    order: 'asc',
                    type: 'alphabetical',
                },
            ],
            'perfectionist/sort-objects': [
                'warn',
                {
                    customGroups: [
                        {
                            elementNamePattern: '^on[A-Z]',
                            groupName: 'callbacks',
                        },
                    ],
                    groups: ['unknown', 'callbacks'],
                    order: 'asc',
                    type: 'alphabetical',
                },
            ],
            'prettier/prettier': [
                'error',
                {
                    arrowParens: 'avoid',
                    bracketSameLine: true,
                    bracketSpacing: true,
                    plugins: ['prettier-plugin-tailwindcss'],
                    quoteProps: 'consistent',
                    semi: false,
                    singleQuote: true,
                    tabWidth: 4,
                    trailingComma: 'es5',
                    useTabs: false,
                },
            ],
            'react/jsx-sort-props': [
                'warn',
                {
                    callbacksLast: true,
                    ignoreCase: true,
                    locale: 'auto',
                    multiline: 'last',
                    reservedFirst: ['key', 'ref'],
                    shorthandFirst: true,
                    shorthandLast: false,
                },
            ],
            'react/jsx-no-bind': [
                'error',
                {
                    allowArrowFunctions: false,
                    allowBind: false,
                    allowFunctions: false,
                    ignoreDOMComponents: false,
                },
            ],
            'react/no-unstable-nested-components': 'off',
        },
    },
    {
        files: ['**/*.types.ts', '**/*.types.tsx', '**/*.d.ts'],
        rules: {
            'no-unused-vars': 'off',
        },
    },
])

export default eslintConfig
