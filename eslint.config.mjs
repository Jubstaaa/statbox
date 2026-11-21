import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import prettierPlugin from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'
import tseslint from 'typescript-eslint'

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ['**/*.{js,mjs,cjs}'],
        extends: [tseslint.configs.disableTypeChecked],
    },
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            perfectionist: perfectionistPlugin,
            prettier: prettierPlugin,
            react: reactPlugin,
        },
        rules: {
            ...eslintConfigPrettier.rules,
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports' },
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            // twisted declares its query and rate-limit DTOs as classes with
            // no behaviour, and its own examples pass object literals.
            '@typescript-eslint/no-unsafe-class-instance-assignment': 'off',
            // Numbers render predictably in strings; the rule still catches
            // objects, nullish values and unions that would print badly.
            '@typescript-eslint/restrict-template-expressions': [
                'error',
                { allowNumber: true },
            ],
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            // Replaces import/order: eslint-plugin-import 2.x crashes under
            // ESLint 10 whenever that rule reports.
            'perfectionist/sort-imports': [
                'error',
                {
                    customGroups: [
                        {
                            elementNamePattern: [
                                '^react$',
                                '^react-dom(/.*)?$',
                            ],
                            groupName: 'react',
                        },
                    ],
                    groups: [
                        'react',
                        'builtin',
                        'external',
                        'internal',
                        ['parent', 'sibling', 'index'],
                        'side-effect',
                        'unknown',
                    ],
                    ignoreCase: true,
                    internalPattern: ['^@/.+'],
                    newlinesBetween: 1,
                    order: 'asc',
                    type: 'alphabetical',
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
            // Options live in prettier.config.mjs so editors and `prettier --check`
            // format exactly as lint expects.
            'prettier/prettier': 'error',
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
        // Test doubles implement async interfaces without awaiting anything,
        // and no-op callbacks are the point of a stub.
        files: ['**/*.test.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/require-await': 'off',
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
