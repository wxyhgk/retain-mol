import { defineConfig } from 'vitest/config'
import path from 'path'

// three 与 mol-viewer 必须外置:渲染实例与编辑状态 store 需要与 app 保持单实例
const externals = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'three',
  '@retainmol/mol-viewer',
  '@retainmol/molecule-assets',
  '@retainmol/ui-kit',
  '@tanstack/react-query',
  'zustand',
  'zod',
  'react-hook-form',
  'react-resizable-panels',
  '@hookform/resolvers',
  'lucide-react',
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
      include: ['src/**/*.test.ts'],
    },
  }
})
