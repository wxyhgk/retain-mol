/** 轻量 UI 状态：全局忙碌指示（3D 生成/优化时显示） */
import { create } from 'zustand'

interface UiState {
  busy: string | null
  setBusy: (label: string | null) => void
}

export const useUiStore = create<UiState>(set => ({
  busy: null,
  setBusy: (busy) => set({ busy }),
}))
