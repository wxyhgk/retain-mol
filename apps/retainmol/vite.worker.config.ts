import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist/server',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'worker/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
  },
})
