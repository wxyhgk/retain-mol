import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'

const packageDir = resolve(import.meta.dirname, '..')
const packageJsonPath = resolve(packageDir, 'package.json')
const configPath = resolve(packageDir, 'api-extractor.json')
const manifest = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
const baseConfig = ExtractorConfig.loadFile(configPath)
const localBuild = process.argv.includes('--local')
let failed = false
const expectedReports = new Set()

for (const [subpath, entry] of Object.entries(manifest.exports)) {
  if (!entry.types) continue
  const name = subpath === '.' ? 'root' : subpath.slice(2).replaceAll('/', '-')
  const reportFileName = `mol-viewer-${name}.api.md`
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
  readdirSync(reportDir).filter(file => /^mol-viewer-.+\.api\.md$/.test(file)),
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
console.log(`API reports passed for ${Object.keys(manifest.exports).length} package entry points.`)
