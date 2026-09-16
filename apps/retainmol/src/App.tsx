import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AppShell } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { useAppClipboardShortcuts } from '@/hooks/useAppClipboardShortcuts'
import { useAppKeyboardShortcuts } from '@/hooks/useAppKeyboardShortcuts'
import { editorHostPort } from '@/domain/viewer/editorHostPort'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import type { Molecule } from '@retainmol/mol-viewer/core'
import {
  canonicalizeMolecule,
  computeContentHash,
  useMoleculeDocumentStore,
} from '@/features/molecule-assets'
import {
  TemplateStudioPage,
} from '@/features/template-studio'
import { useUiThemeStore } from '@/domain/uiThemeStore'
import { useUiPaletteStore } from '@/domain/uiPaletteStore'
import {
  resolveJobEditorRoute,
  resolveWorkflowEditRoute,
} from '@/app/appRoute'

export default function App() {
  const uiTheme = useUiThemeStore(state => state.theme)
  const palette = useUiPaletteStore(state => state.palette)
  const [showInspector, setShowInspector] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }))
  const [templateStudioOpen, setTemplateStudioOpen] = useState(false)
  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const toggleInspector = useCallback(() => setShowInspector(value => !value), [])
  const navigate = useCallback((nextPath: string) => {
    window.history.pushState({}, '', nextPath)
    setLocation({ pathname: window.location.pathname, search: window.location.search })
  }, [])

  // 单页：一切非 / 访问归一化到 /，编辑会话 query 原样保留
  useEffect(() => {
    const syncLocation = () => {
      if (window.location.pathname !== '/') {
        window.history.replaceState({}, '', `/${window.location.search}`)
      }
      setLocation({ pathname: window.location.pathname, search: window.location.search })
    }
    syncLocation()
    window.addEventListener('popstate', syncLocation)
    return () => window.removeEventListener('popstate', syncLocation)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', uiTheme === 'night')
    document.documentElement.style.colorScheme = uiTheme === 'night' ? 'dark' : 'light'
  }, [uiTheme])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('heritage', palette === 'heritage')
  }, [palette])

  useAppClipboardShortcuts()
  useAppKeyboardShortcuts(openSearch)
  useDirtyBeforeUnload()
  const crashRecovery = useCrashRecovery()
  const offerTime = new Date(crashRecovery.offer?.savedAt ?? '').getTime()
  const snapshotTime = Number.isNaN(offerTime) ? '未知时间' : new Date(offerTime).toLocaleString()
  const workflowEditSession = resolveWorkflowEditRoute(location.search)
  const jobEditSession = resolveJobEditorRoute(location.search)
  return (
    <>
      {crashRecovery.offer && (
        <div className="fixed inset-x-0 top-0 z-[200] flex flex-wrap items-center justify-center gap-3 border-b border-border bg-card px-4 py-2 text-xs text-card-foreground shadow-sm">
          <span>检测到未保存的编辑草稿（{snapshotTime}），是否恢复？</span>
          <span className="flex items-center gap-2">
            <Button size="sm" onClick={crashRecovery.restore}>恢复草稿</Button>
            <Button size="sm" variant="outline" onClick={crashRecovery.discard}>丢弃</Button>
          </span>
        </div>
      )}
      <AppShell
        showInspector={showInspector}
        searchOpen={searchOpen}
        onToggleInspector={toggleInspector}
        onOpenTemplateStudio={() => setTemplateStudioOpen(true)}
        onOpenSearch={openSearch}
        onCloseSearch={closeSearch}
        workflowEditSession={workflowEditSession}
        jobEditSession={jobEditSession}
        onCloseWorkflowEdit={() => navigate('/')}
        onCloseJobEdit={() => navigate('/')}
      />
      {templateStudioOpen && (
        <div className="fixed inset-0 z-[100]">
          <TemplateStudioPage onClose={() => setTemplateStudioOpen(false)} />
        </div>
      )}
    </>
  )
}

const CRASH_SNAPSHOT_KEY = 'retainmol/crash-snapshot/active-molecule-v1'
const CRASH_SNAPSHOT_DEBOUNCE_MS = 2000

interface CrashSnapshot {
  readonly version: 1
  readonly savedAt: string
  readonly canonical: string
  readonly molecule: Molecule
}

function readCrashSnapshot(): CrashSnapshot | null {
  try {
    const raw = window.localStorage.getItem(CRASH_SNAPSHOT_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (!('version' in parsed) || parsed.version !== 1) return null
    if (!('canonical' in parsed) || typeof parsed.canonical !== 'string') return null
    if (!('molecule' in parsed) || !parsed.molecule || typeof parsed.molecule !== 'object') return null
    if (!('atoms' in parsed.molecule) || !Array.isArray(parsed.molecule.atoms)) return null
    const snapshot: CrashSnapshot = parsed as CrashSnapshot
    return snapshot
  } catch {
    return null
  }
}

function removeCrashSnapshot() {
  try {
    window.localStorage.removeItem(CRASH_SNAPSHOT_KEY)
  } catch {
    // 快照清理失败不影响编辑
  }
}

/** 脏检查：与 MoleculeDocumentControls 相同的判定逻辑，刷新/关闭前提示。 */
function useDirtyBeforeUnload() {
  const activeObjectId = useMoleculeStore(state => state.activeObjectId)
  const molecule = useMoleculeStore(state => (
    state.activeObjectId ? state.objectsById[state.activeObjectId]?.molecule ?? null : null
  ))
  const binding = useMoleculeDocumentStore(state => (
    activeObjectId ? state.bindingsByObjectId[activeObjectId] : undefined
  ))
  const pendingRevisionMetadata = useMoleculeDocumentStore(state => (
    activeObjectId ? state.pendingRevisionMetadataByObjectId[activeObjectId] : undefined
  ))
  const [contentHash, setContentHash] = useState<string | null>(null)
  useEffect(() => {
    let current = true
    void (async () => {
      const hash = molecule ? await computeContentHash(molecule) : null
      if (current) setContentHash(hash)
    })()
    return () => { current = false }
  }, [molecule])
  const dirty = Boolean(
    activeObjectId
    && molecule
    && contentHash
    && (
      !binding
      || binding.savedContentHash !== contentHash
      || Boolean(pendingRevisionMetadata && Object.keys(pendingRevisionMetadata).length > 0)
    ),
  )
  const dirtyRef = useRef(dirty)
  useEffect(() => {
    dirtyRef.current = dirty
  }, [dirty])
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])
}

/**
 * 自动保存/崩溃恢复：防抖记录当前活动分子的快照作为兜底。
 * 快照从不与文档存储争用：显式保存后（不再 dirty）自动清除，保存优先。
 */
function useCrashRecovery() {
  const [offer, setOffer] = useState<CrashSnapshot | null>(() => {
    const snapshot = readCrashSnapshot()
    if (!snapshot || snapshot.molecule.atoms.length === 0) {
      if (snapshot) removeCrashSnapshot()
      return null
    }
    try {
      const current = useMoleculeStore.getState()
      const active = current.activeObjectId
        ? current.objectsById[current.activeObjectId]?.molecule ?? null
        : null
      if (active && canonicalizeMolecule(active) === snapshot.canonical) {
        removeCrashSnapshot()
        return null
      }
    } catch {
      // 比对失败则保留恢复提示，由用户决定
    }
    return snapshot
  })
  const activeObjectId = useMoleculeStore(state => state.activeObjectId)
  const molecule = useMoleculeStore(state => (
    state.activeObjectId ? state.objectsById[state.activeObjectId]?.molecule ?? null : null
  ))
  useEffect(() => {
    if (offer) return
    if (!activeObjectId || !molecule) return
    if (molecule.atoms.length === 0) {
      removeCrashSnapshot()
      return
    }
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const canonical = canonicalizeMolecule(molecule)
          const hash = await computeContentHash(molecule)
          const documents = useMoleculeDocumentStore.getState()
          const binding = documents.bindingsByObjectId[activeObjectId]
          const pending = documents.pendingRevisionMetadataByObjectId[activeObjectId]
          const dirty = !binding
            || binding.savedContentHash !== hash
            || Boolean(pending && Object.keys(pending).length > 0)
          if (!dirty) {
            removeCrashSnapshot()
            return
          }
          const snapshot: CrashSnapshot = {
            version: 1,
            savedAt: new Date().toISOString(),
            canonical,
            molecule,
          }
          window.localStorage.setItem(CRASH_SNAPSHOT_KEY, JSON.stringify(snapshot))
        } catch {
          // 快照失败不影响编辑
        }
      })()
    }, CRASH_SNAPSHOT_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [offer, activeObjectId, molecule])
  const restore = useCallback(() => {
    if (!offer) return
    editorHostPort.replaceActiveMolecule(offer.molecule)
    editorHostPort.notify('已恢复未保存的编辑草稿')
    setOffer(null)
  }, [offer])
  const discard = useCallback(() => {
    removeCrashSnapshot()
    setOffer(null)
  }, [])
  return { offer, restore, discard }
}
