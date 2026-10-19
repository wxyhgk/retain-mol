import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'

const packageDir = resolve(import.meta.dirname, '..')
const packageJsonPath = resolve(packageDir, 'package.json')
const configPath = resolve(packageDir, 'api-extractor.json')
const manifest = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
const baseConfig = ExtractorConfig.loadFile(configPath)
const localBuild = process.argv.includes('--local')
const reportPrefix = manifest.name.split('/').pop()
let failed = false
const expectedReports = new Set()

for (const [subpath, entry] of Object.entries(manifest.exports)) {
  // 通配子路径（如 core 的 ./internal/*）不承诺稳定，不进 API 报告。
  if (!entry.types || subpath.includes('*')) continue
  const name = subpath === '.' ? 'root' : subpath.slice(2).replaceAll('/', '-')
  const reportFileName = `${reportPrefix}-${name}.api.md`
  expectedReports.add(reportFileName)
  const configObject = {
    ...baseConfig,
    mainEntryPointFilePath: resolve(packageDir, entry.types),
    apiReport: {
      ...baseConfig.apiReport,
      reportFileName,
    },
  }
  const config = ExtractorConfig.prepare({
    configObject,
    configObjectFullPath: configPath,
    packageJsonFullPath: packageJsonPath,
  })
  const result = Extractor.invoke(config, {
    localBuild,
    showVerboseMessages: false,
    showDiagnostics: false,
    messageCallback(message) {
      message.handled = true
      if (message.logLevel !== 'none') {
        console.log(`[${name}] ${message.formatMessageWithLocation(packageDir)}`)
      }
    },
  })
  if (!result.succeeded) {
    failed = true
    console.error(
      `[${name}] failed: errors=${result.errorCount}, warnings=${result.warningCount}, apiReportChanged=${result.apiReportChanged}`,
    )
  }

  const reportCandidates = [
    resolve(packageDir, 'temp/api', reportFileName),
    resolve(packageDir, 'etc', reportFileName),
  ]
  for (const reportPath of reportCandidates) {
    if (!existsSync(reportPath)) continue
    const report = readFileSync(reportPath, 'utf8')
    const normalizedReport = report.replaceAll('\r\n', '\n')
    if (report !== normalizedReport) writeFileSync(reportPath, normalizedReport)
  }
  // internal/* 不承诺稳定：公共 API 签名只能引用 @retainmol/core 的公共入口。
  const internalReport = reportCandidates.find(
    reportPath => existsSync(reportPath) && readFileSync(reportPath, 'utf8').includes('@retainmol/core/internal/'),
  )
  if (internalReport) {
    failed = true
    console.error(`[${name}] failed: public API references @retainmol/core/internal (${internalReport})`)
  }
  const forgottenExportReport = reportCandidates.find(
    reportPath => existsSync(reportPath) && readFileSync(reportPath, 'utf8').includes('ae-forgotten-export'),
  )
  if (forgottenExportReport) {
    failed = true
    console.error(`[${name}] failed: public API contains forgotten exports (${forgottenExportReport})`)
  }
}

const reportDir = resolve(packageDir, 'etc')
const committedReports = new Set(
  readdirSync(reportDir).filter(file => file.startsWith(`${reportPrefix}-`) && file.endsWith('.api.md')),
)
for (const report of expectedReports) {
  if (!committedReports.has(report)) {
    failed = true
    console.error(`Missing API report for current package entry: ${report}`)
  }
}
for (const report of committedReports) {
  if (!expectedReports.has(report)) {
    failed = true
    console.error(`Orphaned API report indicates a removed package entry: ${report}`)
  }
}

if (failed) process.exit(1)
console.log(`API reports passed for ${expectedReports.size} package entry points.`)
