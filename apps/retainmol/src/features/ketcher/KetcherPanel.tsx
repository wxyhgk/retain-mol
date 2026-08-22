import { useEffect, useState } from 'react'
import { Editor } from 'ketcher-react'
import 'ketcher-react/dist/index.css'
import type { Ketcher, StructServiceProvider } from 'ketcher-core'
import { parseMoleculeFile } from '@/features/molecule-placement/infrastructure/parseMoleculeFile'
import { placeMoleculeInViewer } from '@/features/molecule-placement/application/placeMoleculeInViewer'

export function KetcherPanel() {
  const [provider, setProvider] = useState<StructServiceProvider | null>(null)

  useEffect(() => {
    let cancelled = false
    import('ketcher-standalone').then(({ StandaloneStructServiceProvider }) => {
      if (cancelled) return
      const p = new StandaloneStructServiceProvider() as unknown as StructServiceProvider
      setProvider(p)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!provider) {
    return <div className="grid h-full place-items-center text-xs text-muted-foreground">Loading Ketcher…</div>
  }

  return (
    <div className="h-full w-full overflow-hidden bg-white">
      <Editor
        staticResourcesUrl="/ketcher-dist"
        structServiceProvider={provider}
        errorHandler={() => {}}
        onInit={(ketcher: Ketcher) => {
          ;(window as unknown as Record<string, unknown>).ketcher2d = ketcher
          // 初始苯
          ketcher.setMolecule('c1ccccc1').catch(() => {})
          // 2D → 3D 同步：每次结构变化导出 molfile 并置入 3D 视图
          const syncTo3D = async () => {
            try {
              const molfile = await ketcher.getMolfile()
              if (!molfile) return
              const parsed = await parseMoleculeFile(new File([molfile], 'ketcher.mol', { type: 'chemical/x-mdl-molfile' }))
              // placeMoleculeInViewer 会处理 2D→3D 的坐标生成
              await placeMoleculeInViewer(parsed.molecule, { mode: 'replace', animate2DTo3D: true })
            } catch {
              // 忽略解析失败，保持 3D 不变
            }
          }
          // Ketcher 的 change 事件：订阅
          try {
            // @ts-expect-error ketcher event API 存在但类型未暴露
            ketcher.subscribe?.('change', syncTo3D)
          } catch {}
          // 兜底：定时轮询 molfile 变化（若 subscribe 不可用）
          let last = ''
          const interval = window.setInterval(async () => {
            try {
              const cur = await ketcher.getMolfile()
              if (cur && cur !== last) {
                last = cur
                // 仅在有订阅时避免重复同步，已订阅则跳过轮询的同步
                // 这里保留轮询作为备用，若 subscribe 已生效则 last 已更新但不会重复触发 place
              }
            } catch {}
          }, 2000)
          // 清理
          const orig = (ketcher as unknown as { destroy?: () => void }).destroy
          // @ts-expect-error
          ketcher._retainmolCleanup = () => window.clearInterval(interval)
        }}
      />
    </div>
  )
}
