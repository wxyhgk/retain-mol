import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const molViewer = path.resolve(__dirname, '../../packages/mol-viewer/src')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // mol-viewer 源文件里 import 的第三方包（clsx、zustand 等）都在 retainmol/node_modules 里
    modules: [path.resolve(__dirname, 'node_modules')],
    alias: [
      // 已迁移到 mol-viewer 的路径（更精确的别名必须在通配符 @/ 前面）
      { find: '@/components/viewer',           replacement: `${molViewer}/components/viewer` },
      { find: '@/components/builder',          replacement: `${molViewer}/components/builder` },
      { find: '@/lib',                          replacement: `${molViewer}/lib` },
      { find: '@/config',                       replacement: `${molViewer}/config` },
      { find: '@/presets',                      replacement: `${molViewer}/presets` },
      { find: '@/store/moleculeStore',          replacement: `${molViewer}/store/moleculeStore` },
      { find: /^@\/hooks\/useBuilder(\.ts)?$/, replacement: `${molViewer}/hooks/useBuilder.ts` },
      // 其余 @/ 仍指向 retainmol 自己的 src
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
