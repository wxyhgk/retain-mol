import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AppShell } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { useAppClipboardShortcuts } from '@/hooks/useAppClipboardShortcuts'
import { useAppKeyboardShortcuts } from '@/hooks/useAppKeyboardShortcuts'
import { editorHostPort } from '@/domain/viewer/editorHostPort'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { canonicalizeMolecule } from '@/features/molecule-assets'
import {
  isDirtyVsSave,
  readCrashSnapshot,
  readLocalSave,
  removeCrashSnapshot,
  useLocalSaveStore,
  writeCrashSnapshot,
  type LocalMoleculeRecord,
} from '@/domain/localMoleculeSave'
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
          <span>{crashRecovery.offer.kind === 'save' ? `上次保存在浏览器的工作（${snapshotTime}），是否恢复？` : `检测到未保存的编辑草稿（${snapshotTime}），是否恢复？`}</span>
          <span className="flex items-center gap-2">
            <Button size="sm" onClick={crashRecovery.restore}>{crashRecovery.offer.kind === 'save' ? '恢复' : '恢复草稿'}</Button>
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

/** 恢复提议：崩溃草稿优先（未保存的新工作），其次是显式本地保存。 */
type RecoveryOffer = LocalMoleculeRecord & { kind: 'crash' | 'save' }

/** 脏检查：画布非空且与浏览器显式保存不一致（无后端）。 */
function useDirtyBeforeUnload() {
  const molecule = useMoleculeStore(state => (
    state.activeObjectId ? state.objectsById[state.activeObjectId]?.molecule ?? null : null
  ))
  const savedCanonical = useLocalSaveStore(state => state.savedCanonical)
  const dirty = isDirtyVsSave(molecule, savedCanonical)
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
 * 自动保存/崩溃恢复：防抖记录当前活动分子的快照作为兜底（纯浏览器）。
 * 启动时先看崩溃草稿（与当前不同才提示），再看显式本地保存。
 */
const CRASH_SNAPSHOT_DEBOUNCE_MS = 2000

function useCrashRecovery() {
  const [offer, setOffer] = useState<RecoveryOffer | null>(() => {
    const current = useMoleculeStore.getState()
    const active = current.activeObjectId
      ? current.objectsById[current.activeObjectId]?.molecule ?? null
      : null
    const differs = (canonical: string): boolean => {
      if (!active || active.atoms.length === 0) return true
      try {
        return canonicalizeMolecule(active) !== canonical
      } catch {
        return true
      }
    }
    const snapshot = readCrashSnapshot()
    if (snapshot && snapshot.molecule.atoms.length > 0) {
      if (!differs(snapshot.canonical)) {
        removeCrashSnapshot()
      } else {
        return { ...snapshot, kind: 'crash' } as RecoveryOffer
      }
    }
    const save = readLocalSave()
    if (save && save.molecule.atoms.length > 0 && differs(save.canonical)) {
      return { ...save, kind: 'save' } as RecoveryOffer
    }
    return null
  })
  const activeObjectId = useMoleculeStore(state => state.activeObjectId)
  const molecule = useMoleculeStore(state => (
    state.activeObjectId ? state.objectsById[state.activeObjectId]?.molecule ?? null : null
  ))
  const savedCanonical = useLocalSaveStore(state => state.savedCanonical)
  useEffect(() => {
    if (offer) return
    if (!activeObjectId || !molecule) return
    if (!isDirtyVsSave(molecule, savedCanonical)) {
      removeCrashSnapshot()
      return
    }
    const timer = window.setTimeout(() => {
      writeCrashSnapshot(molecule)
    }, CRASH_SNAPSHOT_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [offer, activeObjectId, molecule, savedCanonical])
  const restore = useCallback(() => {
    if (!offer) return
    editorHostPort.replaceActiveMolecule(offer.molecule)
    editorHostPort.notify(offer.kind === 'save' ? '已恢复浏览器保存的工作' : '已恢复未保存的编辑草稿')
    setOffer(null)
  }, [offer])
  const discard = useCallback(() => {
    // 丢弃崩溃草稿清槽；显式保存只关闭本次提示（下次打开仍可恢复）
    if (offer?.kind === 'crash') removeCrashSnapshot()
    setOffer(null)
  }, [offer])
  return { offer, restore, discard }
}
