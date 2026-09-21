import { create } from 'zustand'
import type { InspectorResult } from '@/domain/viewer/inspectorActions'

/** UI feedback survives tab changes; it contains only the latest operation. */
export const useInspectorResultStore = create<{ result: InspectorResult | null }>(() => ({ result: null }))
export function reportInspectorResult(result: InspectorResult) {
  useInspectorResultStore.setState({ result })
}
