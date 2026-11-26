import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    '.next/**',
    'out/**',
    '.data/**',
    '.outbox/**',
    'media/**',
    'next-env.d.ts',
    'src/payload-types.ts',
    'src/app/(payload)/admin/importMap.js',
  ]),
])
