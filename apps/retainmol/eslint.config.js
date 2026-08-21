import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['warn', {
        patterns: [
          {
            group: ['@/components/ui', '@/components/ui/*'],
            message: 'Use @retainmol/ui-kit instead of @/components/ui. The app stub is deprecated.',
          },
          {
            group: ['@/components/data', '@/components/data/*'],
            message: 'Use @retainmol/ui-kit instead of @/components/data. The app stub is deprecated.',
          },
        ],
      }],
    },
  },
])
