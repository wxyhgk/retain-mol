import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { sitesMetadata } from './build/sites-vite-plugin'

/** ketcher-core ships mixed ESM + require('raphael'); Vite ESM has no require. */
function rewriteKetcherRaphaelRequire(): Plugin {
  const requireRe = /\brequire\(\s*['"]raphael['"]\s*\)/g
  return {
    name: 'rewrite-ketcher-raphael-require',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0]
      if (!file.includes('raphael-ext')) return
      if (!requireRe.test(code)) return
      requireRe.lastIndex = 0
      return {
        code: `import * as __raphaelNs from 'raphael';\n${code.replace(
          requireRe,
          '(__raphaelNs.default ?? __raphaelNs)',
        )}`,
        map: null,
      }
    },
  }
}

export default defineConfig({
  plugins: [rewriteKetcherRaphaelRequire(), react(), tailwindcss(), sitesMetadata()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: 'ketcher-macromolecules', replacement: path.resolve(__dirname, './src/empty.ts') },
      { find: 'raphael', replacement: path.resolve(__dirname, '../../../ketcher-retainmol/node_modules/raphael/raphael.min.js') },
    ],
    // app 与 mol-viewer 各带一份 three/react，多实例会导致 hooks/ instanceof 失效（ketcher 独立 react 导致 useRef 读空）
    dedupe: ['three', 'react', 'react-dom', 'react/jsx-runtime'],
  },
  assetsInclude: ['**/*.ket'],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5300,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, './'), path.resolve(__dirname, '../../'), path.resolve(__dirname, '../../../ketcher-retainmol')],
    },
    watch: {
      ignored: ['**/public/ketcher-dist/**', '**/node_modules/**'],
    },
  },
  optimizeDeps: {
    include: ['raphael'],
    exclude: ['ketcher-react', 'ketcher-core', 'ketcher-standalone', 'ketcher-macromolecules'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
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
