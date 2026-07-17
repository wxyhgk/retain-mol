import { defineConfig } from 'vitest/config'
import path from 'path'

// 与 app/mol-viewer 保持一致:所有运行时依赖外置,由消费方提供单实例
const externals = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'zustand',
  'clsx',
  'tailwind-merge',
  'class-variance-authority',
  'lucide-react',
  '@tanstack/react-table',
  'react-virtuoso',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-separator',
  '@radix-ui/react-slot',
  '@radix-ui/react-tabs',
  '@radix-ui/react-tooltip',
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
