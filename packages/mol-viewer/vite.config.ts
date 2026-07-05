import { defineConfig } from 'vitest/config'
import path from 'path'

const externals = [
  'react',
  'react-dom',
  'three',
  'zustand',
  'zundo',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  'lucide-react',
  'openchemlib',   // ~3MB，绝不能内联进产物
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
          entry: path.resolve(__dirname, './src/index.ts'),
          formats: ['es'],
          fileName: () => 'index.js',
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
