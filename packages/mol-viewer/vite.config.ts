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
            'public/core': path.resolve(__dirname, './src/public/core.ts'),
            'public/io': path.resolve(__dirname, './src/public/io.ts'),
            'public/viewer': path.resolve(__dirname, './src/public/viewer.ts'),
            'public/styles': path.resolve(__dirname, './src/public/styles.ts'),
            'public/fragments': path.resolve(__dirname, './src/public/fragments.ts'),
            'public/samples': path.resolve(__dirname, './src/public/samples.ts'),
            'public/templates': path.resolve(__dirname, './src/public/templates.ts'),
            'public/pubchem': path.resolve(__dirname, './src/public/pubchem.ts'),
            // 无 DOM 的优化入口，供 Worker 导入（@retainmol/mol-viewer/optimize）
            optimize: path.resolve(__dirname, './src/optimize.ts'),
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
