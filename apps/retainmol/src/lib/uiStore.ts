/** 轻量 UI 状态：全局忙碌指示（3D 生成/优化时显示，避免看起来像卡死） */
import { create } from 'zustand'

interface UiState {
  busy: string | null
  setBusy: (label: string | null) => void
}

export const useUiStore = create<UiState>(set => ({
  busy: null,
  setBusy: (busy) => set({ busy }),
}))
