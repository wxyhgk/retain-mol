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
      { find: 'ketcher-macromolecules', replacement: path.resolve(__dirname, './src/empty.ts') },
    ],
    // app 与 mol-viewer 各带一份 three/react，多实例会导致 hooks/ instanceof 失效（ketcher 独立 react 导致 useRef 读空）
    dedupe: ['three', 'react', 'react-dom', 'react/jsx-runtime'],
  },
  assetsInclude: ['**/*.ket'],
  define: {
    global: 'globalThis',
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, './'), path.resolve(__dirname, '../../'), path.resolve(__dirname, '../../../ketcher-retainmol')],
    },
    watch: {
      ignored: ['**/public/ketcher-dist/**', '**/node_modules/**'],
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
