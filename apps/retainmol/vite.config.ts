import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { sitesMetadata } from './build/sites-vite-plugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), sitesMetadata()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
    // app 与 mol-viewer 各带一份 three（peerDep + external），不去重会产生双实例、跨边界 instanceof 失效
    dedupe: ['three'],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'worker/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
