const DEFAULT_MAX_BYTES = 16 * 1024 * 1024
const DEFAULT_MAX_DEPTH = 256

export class StrictJsonError extends Error {
  constructor(message) {
    super(message)
    this.name = 'StrictJsonError'
  }
}

function hasUnpairedSurrogate(value) {
  for (let index = 0; index < value.length; index += 1) {
    const unit = value.charCodeAt(index)
    if (unit >= 0xd800 && unit <= 0xdbff) {
      if (index + 1 >= value.length) return true
      const next = value.charCodeAt(index + 1)
      if (next < 0xdc00 || next > 0xdfff) return true
      index += 1
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      return true
    }
  }
  return false
}

/** Parse JSON without silently accepting duplicate object fields. */
export function parseStrictJson(text, label = 'JSON', options = {}) {
  if (typeof text !== 'string') throw new StrictJsonError(`${label} 必须是字符串`)
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
  if (Buffer.byteLength(text) > maxBytes) throw new StrictJsonError(`${label} 超过 ${maxBytes} 字节`)
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH
  let index = 0

  const fail = message => {
    throw new StrictJsonError(`${label} 在字符 ${index} 处无效：${message}`)
  }
  const whitespace = () => {
    while (index < text.length && /[\t\n\r ]/.test(text[index])) index += 1
  }
  const string = () => {
    const start = index
    if (text[index] !== '"') fail('预期字符串')
    index += 1
    while (index < text.length) {
      const character = text[index]
      if (character === '"') {
        index += 1
        let parsed
        try {
          parsed = JSON.parse(text.slice(start, index))
        } catch {
          fail('字符串转义无效')
        }
        if (hasUnpairedSurrogate(parsed)) fail('字符串包含孤立 Unicode surrogate')
        return parsed
      }
      if (character === '\\') {
        index += 1
        if (index >= text.length) fail('字符串转义不完整')
        if (text[index] === 'u') {
          const hex = text.slice(index + 1, index + 5)
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail('Unicode 转义无效')
          index += 5
          continue
        }
        if (!'"\\/bfnrt'.includes(text[index])) fail('字符串转义无效')
        index += 1
        continue
      }
      if (character.charCodeAt(0) < 0x20) fail('字符串包含控制字符')
      index += 1
    }
    fail('字符串没有结束引号')
  }
  const number = () => {
    const remaining = text.slice(index)
    const match = remaining.match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/)
    if (!match) fail('数字格式无效')
    index += match[0].length
    const value = Number(match[0])
    if (!Number.isFinite(value)) fail('禁止非有限数字')
    if (Object.is(value, -0)) fail('禁止负零')
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) fail('整数超出 JavaScript 安全范围')
    return value
  }
  const literal = (source, value) => {
    if (!text.startsWith(source, index)) fail(`预期 ${source}`)
    index += source.length
    return value
  }
  const value = depth => {
    if (depth > maxDepth) fail(`嵌套超过 ${maxDepth} 层`)
    whitespace()
    const character = text[index]
    if (character === '{') return object(depth + 1)
    if (character === '[') return array(depth + 1)
    if (character === '"') return string()
    if (character === 't') return literal('true', true)
    if (character === 'f') return literal('false', false)
    if (character === 'n') return literal('null', null)
    return number()
  }
  const object = depth => {
    index += 1
    whitespace()
    const result = Object.create(null)
    const keys = new Set()
    if (text[index] === '}') {
      index += 1
      return result
    }
    while (index < text.length) {
      whitespace()
      const key = string()
      if (keys.has(key)) fail(`重复字段 ${JSON.stringify(key)}`)
      keys.add(key)
      whitespace()
      if (text[index] !== ':') fail('对象字段后缺少冒号')
      index += 1
      result[key] = value(depth)
      whitespace()
      if (text[index] === '}') {
        index += 1
        return result
      }
      if (text[index] !== ',') fail('对象字段之间缺少逗号')
      index += 1
    }
    fail('对象没有结束括号')
  }
  const array = depth => {
    index += 1
    whitespace()
    const result = []
    if (text[index] === ']') {
      index += 1
      return result
    }
    while (index < text.length) {
      result.push(value(depth))
      whitespace()
      if (text[index] === ']') {
        index += 1
        return result
      }
      if (text[index] !== ',') fail('数组元素之间缺少逗号')
      index += 1
    }
    fail('数组没有结束括号')
  }

  whitespace()
  const result = value(0)
  whitespace()
  if (index !== text.length) fail('根值之后还有多余内容')
  return result
}
