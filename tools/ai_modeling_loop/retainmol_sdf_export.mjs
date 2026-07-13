#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'

import { exportSdf, parseSdf } from '@retainmol/mol-viewer/io'

const [input, output] = process.argv.slice(2)
if (!input || !output) {
  process.stderr.write('用法：retainmol_sdf_export.mjs <input.sdf> <output.sdf>\n')
  process.exit(1)
}

const molecules = parseSdf(await readFile(input, 'utf8'))
if (molecules.length !== 1 || !molecules[0]) {
  throw new Error(`期望一个可解析分子，实际为 ${molecules.length}`)
}
await writeFile(output, exportSdf(molecules[0]))
