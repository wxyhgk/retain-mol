import { randomBytes } from 'node:crypto'
import { constants } from 'node:fs'
import { mkdir, open, rename, stat, unlink } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const MAX_INPUT_BYTES = 16 * 1024 * 1024
const MAX_OUTPUT_BYTES = 16 * 1024 * 1024

export class RelationTraceInputFileError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'RelationTraceInputFileError'
    this.code = code
  }
}

export async function readBoundedRegularBytes(filePath, label) {
  let handle
  try {
    handle = await open(filePath, constants.O_RDONLY | constants.O_NONBLOCK)
    const metadata = await handle.stat()
    if (!metadata.isFile()) {
      throw new RelationTraceInputFileError('invalid-input-file', label + ' 必须是普通文件')
    }
    if (metadata.size > MAX_INPUT_BYTES) {
      throw new RelationTraceInputFileError(
        'input-too-large',
        label + ' 超过 ' + MAX_INPUT_BYTES + ' 字节',
      )
    }
    const chunks = []
    let total = 0
    while (total <= MAX_INPUT_BYTES) {
      const chunk = Buffer.allocUnsafe(Math.min(64 * 1024, MAX_INPUT_BYTES + 1 - total))
      const { bytesRead } = await handle.read(chunk, 0, chunk.length, null)
      if (bytesRead === 0) break
      chunks.push(chunk.subarray(0, bytesRead))
      total += bytesRead
    }
    if (total > MAX_INPUT_BYTES) {
      throw new RelationTraceInputFileError(
        'input-too-large',
        label + ' 超过 ' + MAX_INPUT_BYTES + ' 字节',
      )
    }
    return Buffer.concat(chunks, total)
  } catch (error) {
    if (error instanceof RelationTraceInputFileError) throw error
    throw new RelationTraceInputFileError(
      'invalid-input-file',
      label + ' 无法安全读取：' + (error instanceof Error ? error.message : error),
    )
  } finally {
    await handle?.close()
  }
}

export function decodeUtf8(bytes, label) {
  if (
    bytes.byteLength >= 3
    && bytes[0] === 0xef
    && bytes[1] === 0xbb
    && bytes[2] === 0xbf
  ) {
    throw new RelationTraceInputFileError(
      'invalid-utf8',
      label + ' 不得以 UTF-8 BOM 开头',
    )
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch (error) {
    throw new RelationTraceInputFileError(
      'invalid-utf8',
      label + ' 不是有效 UTF-8：' + (error instanceof Error ? error.message : error),
    )
  }
}

export async function assertOutputIsNotInput(outputPath, inputPaths) {
  let outputIdentity
  try {
    outputIdentity = await stat(outputPath)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
    return
  }
  for (const inputPath of inputPaths) {
    const inputIdentity = await stat(inputPath)
    if (outputIdentity.dev === inputIdentity.dev && outputIdentity.ino === inputIdentity.ino) {
      throw new Error('--output 不得覆盖或别名引用任何输入文件')
    }
  }
}

export async function writeBoundedAtomic(outputPath, value) {
  const encoded = Buffer.from(JSON.stringify(value, null, 2) + '\n')
  if (encoded.byteLength > MAX_OUTPUT_BYTES) {
    throw new Error('relation trace 输出超过 ' + MAX_OUTPUT_BYTES + ' 字节')
  }
  await mkdir(path.dirname(outputPath), { recursive: true })
  const temporaryPath = path.join(
    path.dirname(outputPath),
    '.' + path.basename(outputPath) + '.' + process.pid + '.'
      + randomBytes(8).toString('hex') + '.tmp',
  )
  let handle
  try {
    handle = await open(temporaryPath, 'wx', 0o600)
    await handle.writeFile(encoded)
    await handle.sync()
    await handle.close()
    handle = undefined
    await rename(temporaryPath, outputPath)
  } finally {
    await handle?.close()
    await unlink(temporaryPath).catch(error => {
      if (error?.code !== 'ENOENT') throw error
    })
  }
}

export function parseArgs(argv) {
  const allowed = new Set(['initial', 'enforced-plan', 'execution-receipt', 'output'])
  const values = new Map()
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index]
    const value = argv[index + 1]
    if (!name?.startsWith('--') || !value || value.startsWith('--')) {
      throw new Error(`无效参数：${name ?? ''}`)
    }
    const key = name.slice(2)
    if (!allowed.has(key)) throw new Error('未知参数：--' + key)
    if (values.has(key)) throw new Error('重复参数：--' + key)
    values.set(key, value)
    index += 1
  }
  for (const required of ['initial', 'enforced-plan', 'execution-receipt', 'output']) {
    if (!values.has(required)) throw new Error(`缺少参数：--${required}`)
  }
  return Object.fromEntries(values)
}
