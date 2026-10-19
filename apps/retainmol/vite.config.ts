import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { stericDemoPlugin } from './build/steric-demo-plugin'
import { sitesMetadata } from './build/sites-vite-plugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), sitesMetadata(), stericDemoPlugin()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      // dev only：CJS 进浏览器 raw 直出会丢命名导出，改吃 third-party 里确定性
      // 生成的 ESM 壳（见 third-party/react-vendor/README.md + build.mjs）。
      // react 系的预构建重导出分析会掉命名，产物只剩 default，整树被卸载还静默。
      // 生产构建（plugin-commonjs）不受影响故不加；vitest 也不加
      // （node CJS 互操作正常，且 react-dom/server 会绕过别名造成双 React）。
      ...(!(process.env.NODE_ENV === 'production') && !process.env.VITEST ? [
        { find: /^react$/, replacement: path.resolve(__dirname, '../../third-party/react-vendor/react.mjs') },
        { find: /^react-dom$/, replacement: path.resolve(__dirname, '../../third-party/react-vendor/react-dom.mjs') },
        { find: /^react-dom\/client$/, replacement: path.resolve(__dirname, '../../third-party/react-vendor/react-dom-client.mjs') },
        { find: /^react\/jsx-runtime$/, replacement: path.resolve(__dirname, '../../third-party/react-vendor/react-jsx-runtime.mjs') },
        { find: /^react\/jsx-dev-runtime$/, replacement: path.resolve(__dirname, '../../third-party/react-vendor/react-jsx-dev-runtime.mjs') },
      ] : []),
    ],
    // app、viewer 与 2D 编辑器（chem-structura）须共用一份 three/react，多实例会导致 hooks/instanceof 失效
    dedupe: ['three', 'react', 'react-dom', 'react/jsx-runtime'],
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5300,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, './'), path.resolve(__dirname, '../../')],
    },
    watch: {
      ignored: ['**/node_modules/**'],
    },
  },
  optimizeDeps: {
    needsInterop: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'scheduler'],
    // rolldown 优化器对 react CJS 包的重导出分析会掉命名导出
    // （产物只剩 default，StrictMode 变 undefined，整树被卸载还静默），
    // needsInterop 强制走带命名导出的互操作包装。
    exclude: ['react', 'react-dom', 'react-dom/client', 'react-dom/server', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
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
