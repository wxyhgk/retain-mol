import { defineConfig } from 'vitest/config'
import path from 'path'

const externals = [
  '@retainmol/core', // 分子模型/IO/几何单独成包，必须外置以保证单实例（力场注册、片段库）
  'react',
  'react-dom',
  'three',
  'zustand',
  'zundo',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  'lucide-react',
  'zod',
]

const external = (id: string) => externals.some(dep => id === dep || id.startsWith(`${dep}/`))

export default defineConfig(({ command }) => {
  const base = {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }

  if (command === 'build') {
    return {
      ...base,
      build: {
        lib: {
          entry: {
            index: path.resolve(__dirname, './src/index.ts'),
            'public/viewer': path.resolve(__dirname, './src/public/viewer.ts'),
            'public/runtime': path.resolve(__dirname, './src/public/runtime.ts'),
            'public/state': path.resolve(__dirname, './src/public/state.ts'),
            'public/editing': path.resolve(__dirname, './src/public/editing.ts'),
            'public/modeling': path.resolve(__dirname, './src/public/modeling.ts'),
            'public/styles': path.resolve(__dirname, './src/public/styles.ts'),
            'public/three': path.resolve(__dirname, './src/public/three.ts'),
            'public/picking': path.resolve(__dirname, './src/public/picking.ts'),
          },
          formats: ['es'],
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
    ...base,
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  }
})
