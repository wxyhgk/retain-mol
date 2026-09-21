import { parseDecisionResponse, type DecisionRequest } from '../model/decisionContract'
const endpoint = '/api/demo/steric/choose'
export async function getDecisionAvailability(): Promise<boolean> {
  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(5000) })
    const data = await response.json() as { available?: unknown }
    return response.ok && data.available === true
  } catch { return false }
}
export async function requestDecision(request: DecisionRequest, signal: AbortSignal) {
  const response = await fetch(endpoint, { method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) })
  let value: unknown
  try { value = await response.json() } catch { throw new Error('Jev 服务不可用；静态部署需要另行配置服务端') }
  if (!response.ok) {
    const message = value && typeof value === 'object' && 'error' in value ? String(value.error) : `请求失败：${response.status}`
    throw new Error(message)
  }
  return parseDecisionResponse(value, request)
}
