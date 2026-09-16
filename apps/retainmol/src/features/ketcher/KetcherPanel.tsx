import { Component, type ReactNode, useEffect, useRef, useState } from 'react'
import { Editor } from 'ketcher-react'
import 'ketcher-react/dist/index.css'
import type { Ketcher, StructServiceProvider } from 'ketcher-core'
import { exportMol } from '@retainmol/mol-viewer/io'
import { parseMoleculeFile, placeMoleculeInViewer } from '@/features/molecule-placement'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'

class KetcherErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' }
  static getDerivedStateFromError(e: unknown) {
    return { hasError: true, message: e instanceof Error ? e.message : String(e) }
  }
  componentDidCatch(error: unknown) {
    console.error('[KetcherErrorBoundary]', error)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="grid h-full place-items-center gap-2 p-4 text-center">
          <p className="text-xs text-destructive">Ketcher 加载失败，已隔离（3D 仍可用）</p>
          <p className="max-w-[32ch] break-all text-[10px] text-muted-foreground">{this.state.message}</p>
          <button
            type="button"
            className="rounded border px-2 py-1 text-xs"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function KetcherEditorInner({ provider }: { provider: StructServiceProvider }) {
  const ketcherRef = useRef<Ketcher | null>(null)
  const syncTimeoutRef = useRef<number | null>(null)
  const lastMolfileRef = useRef<string>('')
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'error'>('idle')
  const [lastError, setLastError] = useState<string | null>(null)

  const doSync = async (ketcher: Ketcher) => {
    try {
      setSyncState('syncing')
      const molfile = await ketcher.getMolfile()
      // 空画布时 molfile 只有 header，无原子，parseMol 会抛或得空分子，跳过
      if (!molfile || molfile === lastMolfileRef.current) {
        setSyncState('idle')
        return
      }
      // 简单判空：M  END 段前后无原子行（V2000 原子数 0）
      if (molfile.includes('  0  0') && molfile.split('\n').length < 10) {
        setSyncState('idle')
        return
      }
      lastMolfileRef.current = molfile
      console.debug('[Ketcher 2D→3D] molfile changed, parsing…', molfile.slice(0, 120))
      const parsed = await parseMoleculeFile(new File([molfile], 'ketcher.mol', { type: 'chemical/x-mdl-molfile' }))
      await placeMoleculeInViewer(parsed.molecule, { mode: 'replace', animate2DTo3D: true })
      setSyncState('idle')
      setLastError(null)
    } catch (e) {
      console.warn('[Ketcher 2D→3D] sync failed', e)
      setSyncState('error')
      setLastError(e instanceof Error ? e.message : String(e))
      setTimeout(() => setSyncState('idle'), 2000)
    }
  }

  const debouncedSync = (ketcher: Ketcher) => {
    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current)
    syncTimeoutRef.current = window.setTimeout(() => doSync(ketcher), 450)
  }
  // 3D→2D 手动推送：把当前 3D 分子导出 molfile 写入 Ketcher，写后回读更新 lastMolfileRef 以吞掉轮询回声
  const pushTo2D = async (ketcher: Ketcher) => {
    try {
      setSyncState('syncing')
      const active = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
      if (active.atoms.length === 0) {
        setSyncState('idle')
        return
      }
      const molfile = exportMol(active)
      await ketcher.setMolecule(molfile)
      // 回读 Ketcher 规范化后的 molfile 作为回声基线；失败则退回导出的原文
      try {
        const echoed = await ketcher.getMolfile()
        lastMolfileRef.current = echoed || molfile
      } catch {
        lastMolfileRef.current = molfile
      }
      setSyncState('idle')
      setLastError(null)
    } catch (e) {
      console.warn('[Ketcher 3D→2D] push failed', e)
      setSyncState('error')
      setLastError(e instanceof Error ? e.message : String(e))
      setTimeout(() => setSyncState('idle'), 2000)
    }
  }

  const handleInit = (ketcher: Ketcher) => {
    ketcherRef.current = ketcher
    ;(window as unknown as Record<string, unknown>).ketcher2d = ketcher
    ;(window as unknown as Record<string, unknown>).__getMolecule = () =>
      selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
    ;(window as unknown as Record<string, unknown>).__getMolfile = () => lastMolfileRef.current
    const active = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
    if (active.atoms.length === 0) {
      ketcher.setMolecule('c1ccccc1').catch((e) => console.warn('[Ketcher setMolecule]', e))
      setTimeout(() => doSync(ketcher), 900)
    } else {
      // 避免覆盖，反向探测：若 3D 已有分子，后续由轮询纠正即可
      setTimeout(() => doSync(ketcher), 900)
    }

    // —— 正确订阅：Ketcher.changeEvent 是 Subscription{add/remove}，不是 subscribe('change')
    const onChange = () => debouncedSync(ketcher)
    try {
      // 主链路：结构历史变更
      ;(ketcher as unknown as { changeEvent?: { add?: (f: () => void) => void } }).changeEvent?.add?.(onChange)
      // 兼容：部分版本暴露 eventBus
      ;(ketcher as unknown as { eventBus?: { on?: (e: string, f: () => void) => void } }).eventBus?.on?.('change', onChange)
      // 旧版 ketcher.subscribe 兼容
      ;(ketcher as unknown as { subscribe?: (e: string, f: () => void) => void }).subscribe?.('change', onChange)
      console.debug('[Ketcher] subscribed changeEvent/add + eventBus')
    } catch (e) {
      console.warn('[Ketcher subscribe]', e)
    }

    // 兜底轮询：订阅可能漏事件时，800ms 巡检 molfile
    const pollId = window.setInterval(() => {
      if (!ketcherRef.current) return
      ketcherRef.current
        .getMolfile()
        .then((mf) => {
          if (mf && mf !== lastMolfileRef.current) debouncedSync(ketcherRef.current as Ketcher)
        })
        .catch(() => {})
    }, 800)
    // 清理挂到 ketcher 上
    ;(ketcher as unknown as Record<string, unknown>).__retainmolPollId = pollId
    ;(ketcher as unknown as Record<string, unknown>).__retainmolOnChange = onChange
  }

  // 组件卸载时清理轮询与订阅
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current)
      const k = ketcherRef.current as unknown as Record<string, unknown> | null
      if (k?.__retainmolPollId) window.clearInterval(k.__retainmolPollId as number)
      try {
        const kc = ketcherRef.current as unknown as { changeEvent?: { remove?: (f: () => void) => void } }
        const onChange = k?.__retainmolOnChange as (() => void) | undefined
        if (onChange) kc.changeEvent?.remove?.(onChange)
      } catch { /* unsubscribe best-effort */ }
    }
  }, [])

  return (
    <div className="h-full w-full overflow-hidden bg-white flex flex-col">
      <div className="flex h-7 shrink-0 items-center justify-between border-b bg-card px-2 text-[11px]">
        <span className="text-muted-foreground">
          {syncState === 'syncing' ? '同步到 3D…' : syncState === 'error' ? `同步失败: ${lastError ?? ''}` : '2D ↔ 3D 自动同步'}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded border bg-background px-2 py-0.5 text-[11px] hover:bg-accent"
            onClick={() => ketcherRef.current && pushTo2D(ketcherRef.current)}
          >
            推送到 2D
          </button>
          <button
            type="button"
            className="rounded border bg-background px-2 py-0.5 text-[11px] hover:bg-accent"
            onClick={() => ketcherRef.current && doSync(ketcherRef.current)}
          >
            同步到 3D
          </button>
        </div>
        <Editor
          staticResourcesUrl="/ketcher-dist"
          structServiceProvider={provider}
          errorHandler={(msg) => console.error('[Ketcher]', msg)}
          disableMacromoleculesEditor
          onInit={handleInit}
        />
      </div>
    </div>
  )
}

export function KetcherPanel() {
  const [provider, setProvider] = useState<StructServiceProvider | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    import('ketcher-standalone')
      .then(({ StandaloneStructServiceProvider }) => {
        if (cancelled) return
        const p = new StandaloneStructServiceProvider() as unknown as StructServiceProvider
        setProvider(p)
      })
      .catch((e) => {
        console.error('[Ketcher provider]', e)
        if (!cancelled) setLoadError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loadError) {
    return (
      <div className="grid h-full place-items-center gap-2 p-4 text-center">
        <p className="text-xs text-destructive">Ketcher 服务初始化失败</p>
        <p className="max-w-[32ch] break-all text-[10px] text-muted-foreground">{loadError}</p>
      </div>
    )
  }

  if (!provider) {
    return <div className="grid h-full place-items-center text-xs text-muted-foreground">Loading Ketcher…</div>
  }

  return (
    <KetcherErrorBoundary>
      <KetcherEditorInner provider={provider} />
    </KetcherErrorBoundary>
  )
}
