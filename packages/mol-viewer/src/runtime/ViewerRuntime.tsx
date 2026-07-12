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
  readonly moleculeStore: MoleculeStoreApi
  readonly editorStore: EditorStoreApi
  readonly ticker: Ticker
  readonly capture: ViewportCaptureRegistry
  readonly viewport: ViewportRegistry
  dispose(): void
}

interface ViewerRuntimeOptions {
  moleculeStore?: MoleculeStoreApi
  editorStore?: EditorStoreApi
  ticker?: Ticker
  capture?: ViewportCaptureRegistry
  viewport?: ViewportRegistry
}

function assembleViewerRuntime(options: ViewerRuntimeOptions = {}): ViewerRuntime {
  const moleculeStore = options.moleculeStore ?? createMoleculeStore()
  const editorStore = options.editorStore ?? createEditorStore(moleculeStore)
  const ticker = options.ticker ?? new Ticker()
  const capture = options.capture ?? createViewportCaptureRegistry()
  const viewport = options.viewport ?? createViewportRegistry()

  return {
    moleculeStore,
    editorStore,
    ticker,
    capture,
    viewport,
    dispose() {
      ticker.dispose()
    },
  }
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
