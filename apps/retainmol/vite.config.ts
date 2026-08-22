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
      { find: 'ketcher-macromolecules', replacement: path.resolve(__dirname, '../../../ketcher-retainmol/packages/ketcher-macromolecules/src') },
    ],
    // app 与 mol-viewer 各带一份 three（peerDep + external），不去重会产生双实例、跨边界 instanceof 失效
    dedupe: ['three'],
  },
  assetsInclude: ['**/*.ket'],
  server: {
    fs: {
      allow: [path.resolve(__dirname, './'), path.resolve(__dirname, '../../'), path.resolve(__dirname, '../../../ketcher-retainmol')],
    },
  },
  optimizeDeps: {
    exclude: ['ketcher-react', 'ketcher-core', 'ketcher-standalone', 'ketcher-macromolecules'],
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
