// 把 OpenChemLib 的 MMFF94 参数表拷到 public/，供浏览器 registerFromUrl 拉取。
// resources.json 未在 openchemlib 的 package.json exports 里，故通过主入口定位其同目录。
import { copyFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const src = join(dirname(require.resolve('openchemlib')), 'resources.json')
mkdirSync('public/ocl', { recursive: true })
copyFileSync(src, 'public/ocl/resources.json')
console.log('[copy-ocl-resources] →', 'public/ocl/resources.json')
