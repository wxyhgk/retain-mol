import { access, copyFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

async function exists(file: string): Promise<boolean> {
  try {
    await access(file)
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}

/** Copies real Sites metadata into the build without inventing a project id. */
export function sitesMetadata(): Plugin {
  let config: ResolvedConfig

  return {
    name: 'retainmol-sites-metadata',
    apply: 'build',
    configResolved(resolved) {
      config = resolved
    },
    async closeBundle() {
      const outputDir = path.resolve(config.root, config.build.outDir, '.openai')
      const hostingFile = path.resolve(config.root, '.openai', 'hosting.json')

      await rm(outputDir, { recursive: true, force: true })
      if (!(await exists(hostingFile))) return

      await mkdir(outputDir, { recursive: true })
      await copyFile(hostingFile, path.join(outputDir, 'hosting.json'))
    },
  }
}
