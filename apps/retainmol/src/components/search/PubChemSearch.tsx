import { useState, useRef, useEffect } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { fetchCompoundSdf } from '@retainmol/mol-viewer/pubchem'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { parseSdf, is2D } from '@retainmol/mol-viewer/io'
import { placeMoleculeInViewer } from '@/features/molecule-placement'
import { cn } from '@/lib/utils'

interface Props {
  onClose: () => void
}

type Status = 'idle' | 'loading' | 'error' | 'ready'

export default function PubChemSearch({ onClose }: Props) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [is2DWarning, setIs2DWarning] = useState(false)
  const [fetchedMol, setFetchedMol] = useState<Molecule | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const handleSearch = async () => {
    if (!query.trim() || status === 'loading') return
    setStatus('loading'); setErrorMsg(''); setIs2DWarning(false); setFetchedMol(null)

    try {
      const { sdf } = await fetchCompoundSdf(query)
      const mols = parseSdf(sdf)
      if (!mols.length) throw new Error('SDF 解析失败，未找到有效分子')
      const mol = mols[0]
      if (is2D(mol)) setIs2DWarning(true)
      setFetchedMol(mol)
      setStatus('ready')
    } catch (e) {
      setStatus('error')
      setErrorMsg((e as Error).message)
    }
  }

  const handleReplace = async () => {
    if (!fetchedMol) return
    await placeMoleculeInViewer(fetchedMol, { mode: 'replace' })
    onClose()
  }

  const handleAddToScene = async () => {
    if (!fetchedMol) return
    await placeMoleculeInViewer(fetchedMol, { mode: 'add-to-scene' })
    onClose()
  }

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* 搜索框：居中偏上 */}
      <div role="dialog" aria-modal="true" aria-label="搜索 PubChem 分子" className="fixed left-1/2 top-[20%] z-[61] w-[min(480px,calc(100vw-24px))] -translate-x-1/2">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

          {/* 输入行 */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            {status === 'loading'
              ? <Loader2 size={16} className="text-gray-400 shrink-0 animate-spin" />
              : <Search size={16} className="text-gray-400 shrink-0" />
            }
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={e => { setQuery(e.target.value); setStatus('idle'); setErrorMsg('') }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="输入分子名称或 CAS 号…  例：aspirin · 50-78-2 · caffeine"
              className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setStatus('idle'); setErrorMsg(''); inputRef.current?.focus() }}
                className="text-gray-300 hover:text-gray-500 text-lg leading-none"
              >×</button>
            )}
          </div>

          {/* 错误提示 */}
          {status === 'error' && (
            <div className="flex items-center gap-2 border-t border-border bg-muted px-4 py-2.5 text-xs text-foreground">
              <AlertCircle size={13} />
              {errorMsg}
            </div>
          )}

          {/* 2D 警告 */}
          {is2DWarning && (
            <div className="border-t border-border bg-muted px-4 py-2.5 text-xs text-foreground">
              未找到 3D 构型，导入时将使用距离几何生成初始 3D 结构
            </div>
          )}

          {/* 底部提示 */}
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-gray-400 shrink-0">
              数据来源：PubChem
            </span>
            <div className="flex items-center gap-1.5">
              {status === 'ready' && fetchedMol && (
                <>
                  <button
                    onClick={handleReplace}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    替换当前
                  </button>
                  <button
                    onClick={handleAddToScene}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all bg-gray-900 text-white hover:bg-gray-700"
                  >
                    添加到场景
                  </button>
                </>
              )}
              {status !== 'ready' && (
                <button
                  onClick={handleSearch}
                  disabled={!query.trim() || status === 'loading'}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                    query.trim() && status !== 'loading'
                      ? 'bg-gray-900 text-white hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                >
                  {status === 'loading' ? '搜索中…' : '搜索 ↵'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
