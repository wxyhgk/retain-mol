import { createContext, useContext, type PropsWithChildren } from 'react'
import {
  createViewportCaptureRegistry,
  defaultCaptureRegistry,
  type ViewportCaptureRegistry,
} from '../capture'
import { Ticker, ticker as defaultTicker } from '../lib/animation/Ticker'
import {
  createEditorStore,
  useEditorStore,
  type EditorStoreApi,
} from '../store/editorStore'
import {
  createMoleculeStore,
  useMoleculeStore,
  type MoleculeStoreApi,
} from '../store/moleculeStore'
import {
  createViewportRegistry,
  defaultViewportRegistry,
  type ViewportRegistry,
} from '../viewport'

export interface ViewerRuntime {
  /** Release resources owned by this isolated viewer session. */
  dispose(): void
}

/** Internal services. Public entry points expose only the opaque ViewerRuntime handle. */
export interface ViewerRuntimeServices {
  readonly moleculeStore: MoleculeStoreApi
  readonly editorStore: EditorStoreApi
  readonly ticker: Ticker
  readonly capture: ViewportCaptureRegistry
  readonly viewport: ViewportRegistry
  /** Internal cleanup registration for instance-bound public adapters. */
  readonly onDispose: (cleanup: () => void) => () => void
}

interface ViewerRuntimeOptions {
  moleculeStore?: MoleculeStoreApi
  editorStore?: EditorStoreApi
  ticker?: Ticker
  capture?: ViewportCaptureRegistry
  viewport?: ViewportRegistry
}

const runtimeServices = new WeakMap<ViewerRuntime, ViewerRuntimeServices>()

function assembleViewerRuntime(options: ViewerRuntimeOptions = {}): ViewerRuntime {
  const moleculeStore = options.moleculeStore ?? createMoleculeStore()
  const editorStore = options.editorStore ?? createEditorStore(moleculeStore)
  const ticker = options.ticker ?? new Ticker()
  const capture = options.capture ?? createViewportCaptureRegistry()
  const viewport = options.viewport ?? createViewportRegistry()
  const cleanups = new Set<() => void>()

  const services: ViewerRuntimeServices = {
    moleculeStore,
    editorStore,
    ticker,
    capture,
    viewport,
    onDispose(cleanup) {
      cleanups.add(cleanup)
      return () => { cleanups.delete(cleanup) }
    },
  }
  let disposed = false
  const runtime: ViewerRuntime = {
    dispose() {
      if (disposed) return
      disposed = true
      runtimeServices.delete(runtime)
      for (const cleanup of cleanups) cleanup()
      cleanups.clear()
      ticker.dispose()
    },
  }
  runtimeServices.set(runtime, services)
  return runtime
}

export function getViewerRuntimeServices(runtime: ViewerRuntime): ViewerRuntimeServices {
  const services = runtimeServices.get(runtime)
  if (!services) throw new Error('ViewerRuntime is disposed or was not created by this package')
  return services
}

/** Create an isolated molecule editing and rendering session. */
export function createViewerRuntime(): ViewerRuntime {
  return assembleViewerRuntime()
}

/** Compatibility runtime used by the existing singleton store exports. */
export const defaultViewerRuntime = assembleViewerRuntime({
  moleculeStore: useMoleculeStore,
  editorStore: useEditorStore,
  ticker: defaultTicker,
  capture: defaultCaptureRegistry,
  viewport: defaultViewportRegistry,
})

const ViewerRuntimeContext = createContext<ViewerRuntime>(defaultViewerRuntime)

export function ViewerRuntimeProvider({
  runtime,
  children,
}: PropsWithChildren<{ runtime: ViewerRuntime }>) {
  return (
    <ViewerRuntimeContext.Provider value={runtime}>
      {children}
    </ViewerRuntimeContext.Provider>
  )
}

export function useViewerRuntime(): ViewerRuntime {
  return useContext(ViewerRuntimeContext)
}

/** Internal hook used by package components; intentionally absent from public subpaths. */
export function useViewerRuntimeServices(runtimeOverride?: ViewerRuntime): ViewerRuntimeServices {
  const contextRuntime = useViewerRuntime()
  return getViewerRuntimeServices(runtimeOverride ?? contextRuntime)
}
