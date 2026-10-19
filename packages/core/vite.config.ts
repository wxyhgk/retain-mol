import { defineConfig } from 'vitest/config'
import { readdirSync, statSync } from 'node:fs'
import path from 'path'
import { checkHeadlessAppearanceChunks } from './scripts/module-graph.mjs'

const externals = [
  'openchemlib',   // ~3MB，绝不能内联进产物
  'zod',
]

const external = (id: string) => externals.some(dep => id === dep || id.startsWith(`${dep}/`))

const srcDir = path.resolve(__dirname, './src')

/** 每个源模块一个入口：`@retainmol/core/internal/*` 依赖稳定的逐文件产物路径。 */
function moduleEntries(dir: string, entries: Record<string, string> = {}) {
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name)
    if (statSync(file).isDirectory()) moduleEntries(file, entries)
    else if (/\.ts$/.test(name) && !/\.(test|bench|d)\.ts$/.test(name)) {
      entries[path.relative(srcDir, file).replace(/\.ts$/, '').replaceAll('\\', '/')] = file
    }
  }
  return entries
}

export default defineConfig(({ command }) => {
  if (command === 'build') {
    return {
      plugins: [{
        name: 'headless-element-boundary',
        generateBundle(_options, bundle) {
          const violations = checkHeadlessAppearanceChunks(bundle, srcDir)
          if (violations.length) this.error(violations.join('\n'))
        },
      }],
      build: {
        lib: {
          entry: moduleEntries(srcDir),
          formats: ['es'],
        },
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
          external,
          output: {
            preserveModules: true,
            preserveModulesRoot: 'src',
            entryFileNames: '[name].js',
          },
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
