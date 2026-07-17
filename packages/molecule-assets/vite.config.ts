import { defineConfig } from 'vitest/config'
import path from 'path'

// mol-viewer 必须外置:编辑状态 store 需要与 app 保持单实例
const externals = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  '@retainmol/mol-viewer',
  '@retainmol/ui-kit',
  '@tanstack/react-query',
  'zustand',
  'lucide-react',
  // three 必须外置且全站单实例（peerDep），否则跨包 instanceof 失效
  'three',
]

const external = (id: string) => externals.some(dep => id === dep || id.startsWith(`${dep}/`))

export default defineConfig(({ command }) => {
  if (command === 'build') {
    return {
      esbuild: { jsx: 'automatic' },
      build: {
        lib: {
          entry: path.resolve(__dirname, './src/index.ts'),
          formats: ['es'],
          fileName: 'index',
        },
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
          external,
        },
      },
    }
  }

  return {
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.{ts,tsx}'],
    },
  }
})
