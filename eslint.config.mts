import { next } from '@jubstaa/config/eslint/next'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    ...next({ tsconfigRootDir: import.meta.dirname }),
    {
        files: ['src/lib/riot/**'],
        rules: {
            '@typescript-eslint/no-unsafe-class-instance-assignment': 'off',
        },
    },
])
