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
      { find: 'raphael', replacement: path.resolve(__dirname, '../../node_modules/raphael/raphael.min.js') },
      // Vendored ketcher dists hardcode relative imports into the *build-time*
      // node_modules layout, which no longer exists after vendoring.
      // Redirect each dangling specifier at its hoisted root copy.
      // Self-retiring: a clean dist rebuild drops these (specifiers normalize).
      // NOTE: subscription targets the dev vendor ESM, not the root CJS:
      // raw CJS served to the browser exposes no named exports (same reason
      // as the dev-only aliases below; production uses plugin-commonjs).
      { find: '../../node_modules/subscription/index.modern.js', replacement: path.resolve(__dirname, '../../third-party/react-vendor/subscription.mjs') },
      { find: '../../node_modules/subscription/index.js', replacement: path.resolve(__dirname, '../../third-party/react-vendor/subscription.mjs') },
      // ketcher-core modern dist bare-imports node 'events' (SettingsService,
      // ketcher): externalized in browser by default; use the same ESM polyfill
      // the relative-path entries below already rely on (default + named OK).
      { find: /^events$/, replacement: path.resolve(__dirname, '../../node_modules/rollup-plugin-node-polyfills/polyfills/events.js') },
      { find: '../node_modules/subscription/index.modern.js', replacement: path.resolve(__dirname, '../../third-party/react-vendor/subscription.mjs') },
      { find: '../node_modules/subscription/index.js', replacement: path.resolve(__dirname, '../../third-party/react-vendor/subscription.mjs') },
      { find: '../node_modules/immer/dist/immer.legacy-esm.js', replacement: path.resolve(__dirname, '../../node_modules/immer/dist/immer.legacy-esm.js') },
      { find: '../../../node_modules/rollup-plugin-node-polyfills/polyfills/events.js', replacement: path.resolve(__dirname, '../../node_modules/rollup-plugin-node-polyfills/polyfills/events.js') },
      { find: '../../../../node_modules/rollup-plugin-node-polyfills/polyfills/events.js', replacement: path.resolve(__dirname, '../../node_modules/rollup-plugin-node-polyfills/polyfills/events.js') },
      { find: '../../../../../node_modules/rollup-plugin-node-polyfills/polyfills/events.js', replacement: path.resolve(__dirname, '../../node_modules/rollup-plugin-node-polyfills/polyfills/events.js') },
      // dev only：CJS 进浏览器 raw 直出会丢命名导出，改吃 third-party 里确定性
      // 生成的 ESM 壳（见 third-party/react-vendor/README.md + build.mjs）。
      // 两类病人：① react 系（预构建重导出分析掉命名，产物只剩 default，
      // 整树被卸载还静默）；② ketcher/codemirror 链的 CJS 传递依赖
      // （importer 在 node_modules 内时优化器跳过，raw CJS 当 ESM 发）。
      // 生产构建（plugin-commonjs）不受影响故不加；vitest 也不加
      // （node CJS 互操作正常，且 react-dom/server 会绕过别名造成双 React）。
      ...(!(process.env.NODE_ENV === 'production') && !process.env.VITEST ? [
        { find: /^react$/, replacement: path.resolve(__dirname, '../../third-party/react-vendor/react.mjs') },
        { find: /^react-dom$/, replacement: path.resolve(__dirname, '../../third-party/react-vendor/react-dom.mjs') },
        { find: /^react-dom\/client$/, replacement: path.resolve(__dirname, '../../third-party/react-vendor/react-dom-client.mjs') },
        { find: /^react\/jsx-runtime$/, replacement: path.resolve(__dirname, '../../third-party/react-vendor/react-jsx-runtime.mjs') },
        { find: /^react\/jsx-dev-runtime$/, replacement: path.resolve(__dirname, '../../third-party/react-vendor/react-jsx-dev-runtime.mjs') },
        { find: /^subscription$/, replacement: path.resolve(__dirname, '../../third-party/react-vendor/subscription.mjs') },
      ] : []),
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
      allow: [path.resolve(__dirname, './'), path.resolve(__dirname, '../../'), path.resolve(__dirname, '../../third-party/ketcher')],
    },
    watch: {
      ignored: ['**/public/ketcher-dist/**', '**/node_modules/**'],
    },
  },
  optimizeDeps: {
    include: ['raphael'],
    needsInterop: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'scheduler'],
    // rolldown 优化器对 react CJS 包的重导出分析会掉命名导出
    // （产物只剩 default，StrictMode 变 undefined，整树被卸载还静默），
    // needsInterop 强制走带命名导出的互操作包装。
    exclude: ['ketcher-react', 'ketcher-core', 'ketcher-standalone', 'ketcher-macromolecules', 'react', 'react-dom', 'react-dom/client', 'react-dom/server', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
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
