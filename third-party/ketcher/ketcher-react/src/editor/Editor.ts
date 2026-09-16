/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  type Editor as KetcherEditor,
  type EditorDocumentChangeReason,
  type MoleculeCanvasCommitResult,
  type FloatingToolsParams,
  type MonomerCreationInitialValues,
  type MonomerCreationState,
  type RenderOptions,
  type SGroupAttachmentPoint,
  type RnaPresetComponentKey,
  type BaseMonomer,
  type Action,
  AtomLabel,
  type AttachmentPointName,
  ketcherProvider,
  KetcherLogger,
  provideEditorSettings,
  Render,
  type Struct,
  type Vec2,
  type KetMonomerClass,
  type IKetMonomerTemplate,
} from 'ketcher-core';
import { PipelineSubscription, Subscription } from 'subscription';

import type { SelectedItems, SkipItem } from './shared/closest.types';
import type { ChangeEventData } from './utils';
import {
  type ISelectionManager,
  type Selection,
  SelectionManager,
} from './core/SelectionManager';
import { Highlighter } from './highlighter';
import { HistoryManager, type IHistoryManager } from './core/HistoryManager';
import type { ContextMenuInfo } from '../ui/components/ContextMenu/contextMenu.types';
import { HoverIcon } from './HoverIcon';
import RotateController from './tool/rotate-controller';
import type { HoverTarget, Tool, ToolEventHandlerName } from './tool/Tool';
import { toolsMap } from './tool';
import { RenderAdapter } from './view/RenderAdapter';
import { ViewManager, type IView } from './view/ViewManager';
import { EditorEventBus, type IEditorEventBus } from './bus/EditorEventBus';
import { StructManager, type IStructManager } from './core/StructManager';
import {
  MonomerWizardManager,
  type IMonomerWizardManager,
} from './core/MonomerWizardManager';
import { SGroupManager, type ISGroupManager } from './core/SGroupManager';
import {
  RnaPresetManager,
  type IRnaPresetManager,
} from './core/RnaPresetManager';
import {
  MonomerFinishManager,
  type IMonomerFinishManager,
} from './core/MonomerFinishManager';
import {
  MonomerSubscriptionManager,
  type IMonomerSubscriptionManager,
} from './core/MonomerSubscriptionManager';
import {
  MonomerOpsManager,
  type IMonomerOpsManager,
  type SaveNewMonomerData,
} from './core/MonomerOpsManager';
import { ToolManager, type IToolManager } from './core/ToolManager';
import { HoverManager, type IHoverManager } from './core/HoverManager';
import {
  SubscriptionManager,
  type ISubscriptionManager,
} from './core/SubscriptionManager';
import { MoleculeCommitManager } from './core/MoleculeCommitManager';
import {
  dispatchMoleculeListeners,
  runMoleculeListener,
} from './core/moleculeListeners';

const SCALE = provideEditorSettings().microModeScale;

export type { Selection } from './core/SelectionManager';

export type FinishNewMonomersCreationOptions = {
  rnaPresetName?: string;
  phosphatePosition?: '3' | '5';
};

export type { SaveNewMonomerData } from './core/MonomerOpsManager';

export type FinishNewMonomersCreationData = {
  monomer: BaseMonomer;
  monomerTemplate: IKetMonomerTemplate;
  monomerRef: string;
  monomerStructureInWizard: Selection;
  atomIdMap: Map<number, number>;
};

class Editor implements KetcherEditor {
  private readonly documentChangeListeners = new Set<
    (reason: EditorDocumentChangeReason) => void
  >();

  private documentObserversDisposed = false;
  private monomerCreationDocumentTransitioning = false;
  private readonly moleculeCommitManager: MoleculeCommitManager;
  ketcherId: string;
  render: Render;
  selectionManager: ISelectionManager;
  viewManager: IView;
  eventBus: IEditorEventBus;
  _tool: Tool | null;
  historyManager: IHistoryManager;
  structManager: IStructManager;
  public monomerWizardManager: IMonomerWizardManager;
  public sGroupManager: ISGroupManager;
  public rnaPresetManager: IRnaPresetManager;
  public monomerFinishManager: IMonomerFinishManager;
  public monomerSubscriptionManager: IMonomerSubscriptionManager;
  public monomerOpsManager: IMonomerOpsManager;
  public toolManager: IToolManager;
  public hoverManager: IHoverManager;
  public subscriptionManager: ISubscriptionManager;

  // backward compat: direct _selection access proxies to manager
  get _selection(): Selection | null {
    return this.selectionManager.selection();
  }

  set _selection(value: Selection | null) {
    this.selectionManager.selection(value);
  }

  get historyStack(): Action[] {
    return this.historyManager.historyStack;
  }

  set historyStack(value: Action[]) {
    this.historyManager.historyStack = value;
  }

  get historyPtr(): number {
    return this.historyManager.historyPtr;
  }

  set historyPtr(value: number) {
    this.historyManager.historyPtr = value;
  }

  errorHandler: ((message: string) => void) | null;
  highlights: Highlighter;
  hoverIcon: HoverIcon;
  lastCursorPosition: { x: number; y: number };
  contextMenu: ContextMenuInfo;
  rotateController: RotateController;
  event: {
    message: Subscription;
    tooltip: Subscription;
    elementEdit: PipelineSubscription;
    zoomIn: PipelineSubscription;
    zoomOut: PipelineSubscription;
    zoomChanged: PipelineSubscription;
    bondEdit: PipelineSubscription;
    rgroupEdit: PipelineSubscription;
    sgroupEdit: PipelineSubscription;
    sdataEdit: PipelineSubscription;
    quickEdit: PipelineSubscription;
    attachEdit: PipelineSubscription;
    removeFG: PipelineSubscription;
    editMonomer: PipelineSubscription;
    change: Subscription;
    selectionChange: PipelineSubscription;
    aromatizeStruct: PipelineSubscription;
    dearomatizeStruct: PipelineSubscription;
    enhancedStereoEdit: PipelineSubscription;
    confirm: PipelineSubscription;
    showInfo: PipelineSubscription;
    apiSettings: PipelineSubscription;
    cursor: Subscription;
    updateFloatingTools: Subscription<FloatingToolsParams>;
  };

  public serverSettings: Record<string, unknown> = {};

  lastEvent: Event | null;
  macromoleculeConvertionError: string | null | undefined;

  constructor(
    ketcherId: string,
    clientArea: HTMLElement,
    options?: Record<string, unknown>,
    serverSettings?: Record<string, unknown>,
    prevEditor?: KetcherEditor,
  ) {
    this.render = new Render(
      clientArea,
      {
        microModeScale: SCALE,
        ...(options ?? {}),
      } as RenderOptions,
      prevEditor?.render,
      options?.reuseRestructIfExist !== false,
    );

    this.ketcherId = ketcherId;
    this._tool = null; // eslint-disable-line
    this.historyManager = new HistoryManager(this, {
      dispatchExternalChange: (action) =>
        ketcherProvider.getKetcher(this.ketcherId).changeEvent.dispatch(action),
      shouldOmitActionOnHistoryReplay: (tool) => tool instanceof toolsMap.paste,
      notifyDocumentChange: (reason) => this.notifyDocumentChange(reason),
      publishMoleculeReplay: () => this.publishMoleculeLegacyChanges(),
    });
    this.errorHandler = null;
    this.highlights = new Highlighter(this);
    this.renderAndRecoordinateStruct =
      this.renderAndRecoordinateStruct.bind(this);
    this.setOptions = this.setOptions.bind(this);
    this.setServerSettings(serverSettings);
    this.lastCursorPosition = {
      x: 0,
      y: 0,
    };
    this.hoverIcon = new HoverIcon(this);
    this.hoverIcon.updatePosition();
    this.contextMenu = {};
    this.rotateController = new RotateController(this);
    this.lastEvent = null;

    this.event = {
      message: new Subscription(),
      tooltip: new Subscription(),
      elementEdit: new PipelineSubscription(),
      bondEdit: new PipelineSubscription(),
      zoomIn: new PipelineSubscription(),
      zoomOut: new PipelineSubscription(),
      zoomChanged: new PipelineSubscription(),
      rgroupEdit: new PipelineSubscription(),
      sgroupEdit: new PipelineSubscription(),
      sdataEdit: new PipelineSubscription(),
      quickEdit: new PipelineSubscription(),
      attachEdit: new PipelineSubscription(),
      removeFG: new PipelineSubscription(),
      editMonomer: new PipelineSubscription(),
      change: new Subscription(),
      selectionChange: new PipelineSubscription(),
      aromatizeStruct: new PipelineSubscription(),
      dearomatizeStruct: new PipelineSubscription(),
      // TODO: correct
      enhancedStereoEdit: new PipelineSubscription(),
      confirm: new PipelineSubscription(),
      cursor: new PipelineSubscription(),
      showInfo: new PipelineSubscription(),
      apiSettings: new PipelineSubscription(),
      updateFloatingTools: new Subscription(),
    };

    this.selectionManager = new SelectionManager({
      getCtab: () => this.render.ctab,
      getRender: () => this.render,
      getOptions: () => this.render.options,
      dispatchSelectionChange: (sel) =>
        this.event.selectionChange.dispatch(sel),
      onSelectAll: () => this.rotateController.rerender(),
      onSelectionCleared: () => this.rotateController.clean(),
      requestUpdate: (force, viewSz) =>
        this.render.update(force ?? false, viewSz ?? null),
      update: (action, ignoreHistory) =>
        this.update(action as Action | true, ignoreHistory),
    });
    this.viewManager = new ViewManager(new RenderAdapter(this.render), {
      getCtab: () => this.render.ctab,
      getStruct: () => this.render.ctab.molecule,
      update: (action, ignoreHistory) =>
        this.update(action as Action | true, ignoreHistory),
      rerenderRotateController: () => this.rotateController.rerender(),
      dispatchZoomChanged: () => this.event.zoomChanged.dispatch(),
      notifyDocumentChange: (reason) => this.notifyDocumentChange(reason),
    });
    this.structManager = new StructManager({
      getRender: () => this.render,
      getViewManager: () => this.viewManager,
      getSelectionManager: () => this.selectionManager,
      getHoverIcon: () => this.hoverIcon,
      update: (action, isMonomerCreation) =>
        this.update(action as Action, isMonomerCreation),
      notifyDocumentChange: (reason) => this.notifyDocumentChange(reason),
      isMonomerCreationWizardActive: () => this.isMonomerCreationWizardActive,
      shouldPreserveStructPosition: (opts, struct) =>
        this.shouldPreserveStructPosition(opts, struct),
      updateToolAfterOptionsChange: (wasViewOnly) =>
        this.updateToolAfterOptionsChange(wasViewOnly),
    });
    this.monomerWizardManager = new MonomerWizardManager({
      getRender: () => this.render,
      update: (action) => this.update(action as Action),
      getStruct: () => this.render.ctab.molecule,
      setStruct: (struct, needToCenter) =>
        this.struct(struct, needToCenter ?? true),
      getSelection: () => this.selection(),
      structSelected: (selection) => this.structSelected(selection),
      getHistoryStack: () => this.historyStack,
      setHistoryStack: (stack) => {
        this.historyStack = stack;
      },
      getHistoryPtr: () => this.historyPtr,
      setHistoryPtr: (ptr) => {
        this.historyPtr = ptr;
      },
      subscribeToChangeEventInMonomerCreationWizard: () =>
        this.subscribeToChangeEventInMonomerCreationWizard(),
      unsubscribeFromChangeEventInMonomerCreationWizard: () =>
        this.unsubscribeFromChangeEventInMonomerCreationWizard(),
      setMonomerCreationStateNull: () => {
        this.monomerCreationState = null;
      },
      toolSelect: () => this.tool('select'),
      notifyDocumentChange: (reason) => this.notifyDocumentChange(reason),
      setDocumentTransitioning: (active) => {
        this.monomerCreationDocumentTransitioning = active;
      },
    });
    this.sGroupManager = new SGroupManager({
      getOriginalStruct: () => this.monomerWizardManager.originalStruct,
    });
    this.rnaPresetManager = new RnaPresetManager({
      getMonomerCreationState: () => this.monomerCreationState,
      getStruct: () => this.struct(),
      getOriginalStruct: () => this.monomerWizardManager.originalStruct,
      getSelectedToOriginalAtomsIdMap: () =>
        this.monomerWizardManager.selectedToOriginalAtomsIdMap,
    });
    this.monomerFinishManager = new MonomerFinishManager({
      getRender: () => this.render,
      getStruct: () => this.struct(),
      setStruct: (s) => this.struct(s),
      update: (a, ignore) => this.update(a as Action, ignore),
      closeMonomerCreationWizard: () => this.closeMonomerCreationWizard(),
      getMonomerCreationState: () => this.monomerCreationState,
      getOriginalStruct: () => this.monomerWizardManager.originalStruct,
      getOriginalSelection: () => this.monomerWizardManager.originalSelection,
      getSelectedToOriginalAtomsIdMap: () =>
        this.monomerWizardManager.selectedToOriginalAtomsIdMap,
      updateMonomersLibrary: (library, options) =>
        ketcherProvider
          .getKetcher(this.ketcherId)
          .updateMonomersLibrary(library, options),
      selection: (sel) => this.selection(sel as Selection),
      dispatchChange: () => this.event.change.dispatch(),
      getSGroupManager: () => this.sGroupManager,
      setDocumentTransitioning: (active) => {
        this.monomerCreationDocumentTransitioning = active;
      },
      notifyDocumentChange: (reason) => this.notifyDocumentChange(reason),
    });
    this.monomerSubscriptionManager = new MonomerSubscriptionManager({
      isWizardActive: () => this.isMonomerCreationWizardActive,
      getMonomerCreationState: () => this.monomerCreationState,
      refreshMonomerCreationState: () => {
        if (this.monomerCreationState)
          this.monomerCreationState = {
            ...(this.monomerCreationState as object),
          } as MonomerCreationState;
      },
      getStruct: () => this.struct(),
      findPotentialLeavingAtoms: (atomId) =>
        this.findPotentialLeavingAtoms(atomId),
      removeAtomsAndBondsFromRnaComponents: (atomIds, bondIds) =>
        this.rnaPresetManager.removeAtomsAndBondsFromRnaComponents(
          atomIds,
          bondIds,
        ),
      canAssignRnaComponent: (bond) =>
        this.rnaPresetManager.canAssignRnaComponent(bond),
      autoAssignAtomToRnaComponent: (bondId) =>
        this.rnaPresetManager.autoAssignAtomToRnaComponent(bondId),
      subscribe: (eventName, handler) =>
        this.subscribe(eventName, handler as never) as never,
      unsubscribe: (eventName, subscriber) =>
        this.unsubscribe(eventName, subscriber as never),
    });
    this.monomerOpsManager = new MonomerOpsManager({
      getMonomerCreationState: () => this.monomerCreationState,
    });
    this.toolManager = new ToolManager(this);
    this.hoverManager = new HoverManager(this);
    this.subscriptionManager = new SubscriptionManager(this, {
      addChangeHandler: (handler) =>
        ketcherProvider.getKetcher(this.ketcherId).changeEvent.add(handler),
      removeChangeHandler: (handler) =>
        ketcherProvider.getKetcher(this.ketcherId).changeEvent.remove(handler),
      addLibraryUpdateHandler: (handler) =>
        ketcherProvider
          .getKetcher(this.ketcherId)
          .libraryUpdateEvent.add(handler),
      removeLibraryUpdateHandler: (handler) =>
        ketcherProvider
          .getKetcher(this.ketcherId)
          .libraryUpdateEvent.remove(handler),
    });
    this.eventBus = new EditorEventBus(clientArea);
    this.moleculeCommitManager = new MoleculeCommitManager({
      getRender: () => this.render,
      getSelection: () => this.selectionManager,
      getHistory: () => this.historyManager,
      getBusyReason: () => this.getMoleculeEditBusyReason(),
      publish: () => {
        this.notifyDocumentChange('edit');
        this.publishMoleculeLegacyChanges();
      },
    });
    domEventSetup(this, clientArea, this.eventBus);
    this.render.paper.canvas.setAttribute('data-testid', 'canvas');
  }

  subscribeDocumentChanges(
    listener: (reason: EditorDocumentChangeReason) => void,
  ): () => void {
    if (this.documentObserversDisposed) return () => undefined;
    this.documentChangeListeners.add(listener);
    return () => this.documentChangeListeners.delete(listener);
  }

  getMoleculeEditUnavailableReason(): string | null {
    if (this.documentObserversDisposed)
      return 'The molecule editor is disposed.';
    return this.moleculeCommitManager?.unavailableReason ?? null;
  }

  getMoleculeEditBusyReason(): string | null {
    if (this.getMoleculeEditUnavailableReason())
      return this.getMoleculeEditUnavailableReason();
    if (this.moleculeCommitManager?.isCommitting)
      return 'A molecule edit is in progress.';
    if (this.eventBus?.isMoleculeEditBusy)
      return 'An editor pointer gesture or event is in progress.';
    if (
      this.isMonomerCreationWizardActive ||
      this.isMonomerCreationDocumentTransitioning
    )
      return 'The monomer wizard is active.';
    if (this.render.options.viewOnlyMode)
      return 'The molecule editor is read-only.';
    if (this.render.options.downScale)
      return 'Molecule edits do not support automatic downscaling.';
    if (!isContextMenuClosed(this.contextMenu))
      return 'An editor context menu is open.';
    if (
      this.render.clientArea.ownerDocument.querySelector(
        'dialog[open], [aria-modal="true"], [data-testid$="-dialog"]',
      )
    )
      return 'An editor dialog is open.';
    if (this._tool && !this._tool.isMoleculeEditIdle?.())
      return 'Select the default selection tool and finish the current gesture.';
    return null;
  }

  commitMoleculeStruct(
    candidate: Struct,
    expected: Struct,
    onCommitted: () => void,
  ): MoleculeCanvasCommitResult {
    return this.moleculeCommitManager.commit(candidate, expected, onCommitted);
  }

  private publishMoleculeLegacyChanges(): void {
    dispatchMoleculeListeners(this.event.change);
    runMoleculeListener(() =>
      dispatchMoleculeListeners(
        ketcherProvider.getKetcher(this.ketcherId).changeEvent,
      ),
    );
    dispatchMoleculeListeners(
      this.event.selectionChange,
      this.selection(),
      true,
    );
    runMoleculeListener(() => this.rotateController.rerender());
  }

  notifyDocumentChange(reason: EditorDocumentChangeReason): void {
    if (!this.documentObserversDisposed) this.dispatchDocumentChange(reason);
  }

  disposeDocumentObservers(): void {
    if (this.documentObserversDisposed) return;
    this.documentObserversDisposed = true;
    this.dispatchDocumentChange('dispose');
    this.documentChangeListeners.clear();
  }

  private dispatchDocumentChange(reason: EditorDocumentChangeReason): void {
    for (const listener of [...this.documentChangeListeners]) {
      if (reason !== 'dispose' && this.documentObserversDisposed) break;
      if (!this.documentChangeListeners.has(listener)) continue;
      try {
        listener(reason);
      } catch (error) {
        KetcherLogger.error('Document change observer failed', error);
      }
    }
  }

  isDitrty(): boolean {
    return this.historyManager.isDitrty();
  }

  isDirty(): boolean {
    return this.historyManager.isDirty();
  }

  setOrigin(): void {
    this.historyManager.setOrigin();
  }

  tool(name?: string, opts?: unknown): Tool | null {
    if (arguments.length === 0) return this.toolManager.getTool();
    return this.toolManager.tool(name, opts);
  }

  clear() {
    return this.structManager.clear();
  }

  renderAndRecoordinateStruct(
    struct: Struct,
    needToCenterStruct = true,
    x?: number,
    y?: number,
  ): Struct {
    return this.structManager.renderAndRecoordinateStruct(
      struct,
      needToCenterStruct,
      x,
      y,
    );
  }

  /** Apply {@link value}: {@link Struct} if provided to {@link render} and  */
  struct(
    value?: Struct,
    needToCenterStruct = true,
    x?: number,
    y?: number,
  ): Struct {
    if (arguments.length === 0) {
      return this.structManager.struct();
    }
    return this.structManager.struct(value, needToCenterStruct, x, y);
  }

  // this is used by API addFragment method
  structToAddFragment(struct: Struct, x?: number, y?: number): Struct {
    return this.structManager.structToAddFragment(struct, x, y);
  }

  setOptions(opts: string) {
    const options = JSON.parse(opts);
    this.event.apiSettings.dispatch({ ...options });
    const wasViewOnlyEnabled = !!this.render.options.viewOnlyMode;
    const result = this.render.updateOptions(opts);
    this.updateToolAfterOptionsChange(wasViewOnlyEnabled);
    return result;
  }

  /** Apply options from {@link value} */
  options(value?: Record<string, unknown>) {
    if (arguments.length === 0) {
      return this.render.options;
    }

    const struct = this.render.ctab.molecule;
    const zoom = this.render.options.zoom;
    this.render.clientArea.innerHTML = '';
    const wasViewOnlyEnabled = !!this.render.options.viewOnlyMode;

    this.render = new Render(this.render.clientArea, {
      microModeScale: SCALE,
      ...(value ?? {}),
    } as RenderOptions);
    this.viewManager.setRender(this.render);
    this.updateToolAfterOptionsChange(wasViewOnlyEnabled);
    this.render.setMolecule(struct);

    const shouldPreservePosition = this.shouldPreserveStructPosition(
      value,
      struct,
    );

    this.struct(struct.clone(), !shouldPreservePosition);
    this.render.setZoom(zoom);
    this.render.update();
    return this.render.options;
  }

  public setServerSettings(serverSettings?: Record<string, unknown>) {
    this.serverSettings = serverSettings ?? {};
  }

  /**
   * Determines whether structure position should be preserved when applying options.
   * Preserves atom coordinates only when viewOnlyMode is being set/changed on existing structure.
   * This prevents structures from shifting when enabling/disabling viewOnlyMode.
   * In all other cases (opening files, changing settings), structures are centered as before.
   */
  private shouldPreserveStructPosition(
    options: Record<string, unknown> | undefined,
    struct: Struct,
  ): boolean {
    const hasAtoms = struct.atoms.size > 0;
    const isSettingViewOnlyMode = !!options && 'viewOnlyMode' in options;
    return hasAtoms && isSettingViewOnlyMode;
  }

  private updateToolAfterOptionsChange(wasViewOnlyEnabled: boolean) {
    const isViewOnlyEnabled = this.render.options.viewOnlyMode;
    if (
      (!wasViewOnlyEnabled && isViewOnlyEnabled === true) ||
      (wasViewOnlyEnabled && isViewOnlyEnabled === false)
    ) {
      // We need to reset the tool to make sure it was recreated
      this.tool('select');
      this.event.change.dispatch('force');
      ketcherProvider.getKetcher(this.ketcherId).changeEvent.dispatch('force');
    }
  }

  zoom(value?: number, event?: WheelEvent) {
    return this.viewManager.zoom(value, event);
  }

  centerStruct() {
    return this.viewManager.centerStruct();
  }

  public centerViewportAccordingToStruct(struct: Struct = this.struct()) {
    return this.viewManager.centerViewportAccordingToStruct(struct);
  }

  positionStruct(x: number, y: number) {
    return this.viewManager.positionStruct(x, y);
  }

  zoomAccordingContent(struct: Struct) {
    return this.viewManager.zoomAccordingContent(struct);
  }

  public get monomerCreationState() {
    return this.monomerWizardManager.monomerCreationState;
  }

  private set monomerCreationState(state: MonomerCreationState) {
    this.monomerWizardManager.monomerCreationState = state;
  }

  public setMonomerCreationSelectedType(
    type: KetMonomerClass | 'rnaPreset' | undefined,
  ) {
    return this.monomerWizardManager.setMonomerCreationSelectedType(type);
  }

  public markAsRnaComponent(
    componentKey: RnaPresetComponentKey,
    atomIds: number[],
    bondIds: number[],
  ) {
    return this.monomerWizardManager.markAsRnaComponent(
      componentKey,
      atomIds,
      bondIds,
    );
  }

  public setConnectionAttachmentPoints(
    points: Map<AttachmentPointName, [number, number]>,
  ) {
    return this.monomerWizardManager.setConnectionAttachmentPoints(points);
  }

  /**
   * Restricts which assigned attachment points are rendered on the canvas.
   * Pass undefined to show all assigned attachment points (e.g. on Preset tab).
   */
  public setVisibleAssignedAttachmentPoints(
    points: Map<AttachmentPointName, [number, number]> | undefined,
  ) {
    return this.monomerWizardManager.setVisibleAssignedAttachmentPoints(points);
  }

  public highlightConnectionAttachmentPoint(name: AttachmentPointName | null) {
    return this.monomerWizardManager.highlightConnectionAttachmentPoint(name);
  }

  /**
   * Highlights a specific atom by its ID on the canvas (for use when the
   * AP name alone is ambiguous, e.g. two components sharing the same AP name).
   * Pass null to clear the highlight.
   */
  public highlightAtomById(atomId: number | null) {
    return this.monomerWizardManager.highlightAtomById(atomId);
  }

  public get isMonomerCreationWizardActive() {
    return this.monomerWizardManager.isMonomerCreationWizardActive;
  }

  public get isMonomerCreationDocumentTransitioning() {
    return this.monomerCreationDocumentTransitioning;
  }

  public get isMonomerCreationWizardEnabled() {
    return this.monomerWizardManager.isMonomerCreationWizardEnabled;
  }

  public static isMinimalViableStructure(
    structure: Struct,
    monomerCreationState: MonomerCreationState | null,
  ): boolean {
    return MonomerOpsManager.isMinimalViableStructure(
      structure,
      monomerCreationState,
    );
  }

  static isStructureImpure(struct: Struct): boolean {
    return MonomerOpsManager.isStructureImpure(struct);
  }

  openMonomerCreationWizard(
    selectionOverride?: Selection,
    editInstanceInitialValues?: MonomerCreationInitialValues,
    editInstanceAttachmentPoints?: ReadonlyArray<SGroupAttachmentPoint>,
  ) {
    return this.monomerWizardManager.openMonomerCreationWizard(
      selectionOverride,
      editInstanceInitialValues,
      editInstanceAttachmentPoints,
    );
  }

  assignLeavingGroupAtom(atomId: number) {
    return this.monomerWizardManager.assignLeavingGroupAtom(atomId);
  }

  assignConnectionPointAtom(
    atomId: number,
    attachmentPointName?: AttachmentPointName,
    assignedAttachmentPointsByMonomer?: Map<
      AttachmentPointName,
      [number, number]
    >,
    monomerStructure?: Selection,
    forceAddNewLeavingGroupAtom = false,
    leavingAtomLabel: AtomLabel = AtomLabel.H,
    leavingAtomPosition?: Vec2,
  ) {
    return this.monomerWizardManager.assignConnectionPointAtom(
      atomId,
      attachmentPointName,
      assignedAttachmentPointsByMonomer,
      monomerStructure,
      forceAddNewLeavingGroupAtom,
      leavingAtomLabel,
      leavingAtomPosition,
    );
  }

  closeMonomerCreationWizard(restoreOriginalStruct = false) {
    return this.monomerWizardManager.closeMonomerCreationWizard(
      restoreOriginalStruct,
    );
  }

  saveNewMonomer(data: SaveNewMonomerData) {
    return this.monomerOpsManager.saveNewMonomer(data);
  }

  finishNewMonomersCreation(
    monomersData: FinishNewMonomersCreationData[],
    { rnaPresetName, phosphatePosition }: FinishNewMonomersCreationOptions = {},
  ) {
    return this.monomerFinishManager.finishNewMonomersCreation(
      monomersData as unknown as never,
      { rnaPresetName, phosphatePosition } as never,
    );
  }

  reassignAttachmentPointLeavingAtom(
    name: AttachmentPointName,
    newLeavingAtomId: number,
  ) {
    return this.monomerWizardManager.reassignAttachmentPointLeavingAtom(
      name,
      newLeavingAtomId,
    );
  }

  reassignAttachmentPoint(
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
  ) {
    return this.monomerWizardManager.reassignAttachmentPoint(
      currentName,
      newName,
    );
  }

  changeLeavingAtomLabel(
    name: AttachmentPointName,
    newLeavingAtomLabel: AtomLabel,
  ) {
    return this.monomerWizardManager.changeLeavingAtomLabel(
      name,
      newLeavingAtomLabel,
    );
  }

  removeAttachmentPoint(name: AttachmentPointName) {
    return this.monomerWizardManager.removeAttachmentPoint(name);
  }

  cleanupCloseAttachmentPointEditPopup() {
    return this.monomerWizardManager.cleanupCloseAttachmentPointEditPopup();
  }

  setProblematicAttachmentPoints(problematicPoints: Set<AttachmentPointName>) {
    return this.monomerWizardManager.setProblematicAttachmentPoints(
      problematicPoints,
    );
  }

  setProblematicAtoms(problematicAtoms: Set<number>) {
    return this.monomerWizardManager.setProblematicAtoms(problematicAtoms);
  }

  highlightAttachmentPoint(name: AttachmentPointName | null) {
    return this.monomerWizardManager.highlightAttachmentPoint(name);
  }

  findPotentialLeavingAtoms(attachmentAtomId: number) {
    return this.monomerWizardManager.findPotentialLeavingAtoms(
      attachmentAtomId,
    );
  }

  private subscribeToChangeEventInMonomerCreationWizard() {
    return this.monomerSubscriptionManager.subscribeToChangeEventInMonomerCreationWizard();
  }

  private unsubscribeFromChangeEventInMonomerCreationWizard() {
    return this.monomerSubscriptionManager.unsubscribeFromChangeEventInMonomerCreationWizard();
  }

  public setRnaMonomerCreationMode(isActive: boolean) {
    return this.rnaPresetManager.setRnaMonomerCreationMode(isActive);
  }

  selection(ci?: Selection | 'all' | 'descriptors' | null): Selection | null {
    if (arguments.length === 0) {
      return this.selectionManager.selection();
    }
    return this.selectionManager.selection(ci);
  }

  hover(ci: HoverTarget | null, newTool?: Tool | null, event?: PointerEvent) {
    return this.hoverManager.hover(ci, newTool, event);
  }

  update(action: Action | true, ignoreHistory?: boolean): void {
    this.historyManager.update(action, ignoreHistory);
  }

  historySize(): { readonly undo: number; readonly redo: number } {
    return this.historyManager.historySize();
  }

  undo(): void {
    this.historyManager.undo();
  }

  redo(): void {
    this.historyManager.redo();
  }

  public clearHistory(): void {
    this.historyManager.clearHistory();
  }

  subscribe(
    eventName: string,
    handler: ((data?: unknown) => void) | ((data: ChangeEventData[]) => void),
  ) {
    return this.subscriptionManager.subscribe(eventName, handler);
  }

  unsubscribe(
    eventName: string,
    subscriber: {
      handler: ((data?: unknown) => void) | ((data: ChangeEventData[]) => void);
    },
  ): void {
    return this.subscriptionManager.unsubscribe(eventName, subscriber);
  }

  findItem(
    event: Event | MouseEvent | { clientX: number; clientY: number },
    maps: Array<string> | null,
    skip: SkipItem | null = null,
  ) {
    return this.selectionManager.findItem(event, maps, skip);
  }

  findMerge(srcItems: SelectedItems, maps?: string[]) {
    return this.selectionManager.findMerge(srcItems, maps);
  }

  explicitSelected(autoSelectBonds = true): Selection {
    return this.selectionManager.explicitSelected(autoSelectBonds);
  }

  structSelected(
    existingSelection?: Selection,
    atomIdMap?: Map<number, number>,
    bondIdMap?: Map<number, number>,
  ): Struct {
    return this.selectionManager.structSelected(
      existingSelection,
      atomIdMap,
      bondIdMap,
    );
  }

  alignDescriptors(): void {
    return this.selectionManager.alignDescriptors();
  }

  setMacromoleculeConvertionError(errorMessage: string) {
    this.macromoleculeConvertionError = errorMessage;
  }

  clearMacromoleculeConvertionError() {
    this.macromoleculeConvertionError = null;
  }

  focusCliparea() {
    const cliparea: HTMLElement | null = document.querySelector('.cliparea');
    cliparea?.focus();
  }
}

/**
 * Main button pressed, usually the left button or the un-initialized state
 * See: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
 */
function isMouseMainButtonPressed(event: MouseEvent) {
  return event.button === 0;
}

function resetSelectionOnCanvasClick(
  editor: Editor,
  eventName: string,
  clientArea: HTMLElement,
  event: Event,
) {
  if (
    eventName === 'mouseup' &&
    editor.selection() &&
    clientArea.contains(event.target as Node | null)
  ) {
    editor.selection(null);
  }
}

function updateLastCursorPosition(editor: Editor, event: Event) {
  const events = ['mousemove', 'click', 'mousedown', 'mouseup', 'mouseover'];
  if (events.includes(event.type) && event instanceof MouseEvent) {
    const clientAreaBoundingBox =
      editor.render.clientArea.getBoundingClientRect();

    editor.lastCursorPosition = {
      x: event.clientX - clientAreaBoundingBox.x,
      y: event.clientY - clientAreaBoundingBox.y,
    };
  }
}

function isContextMenuClosed(contextMenu: ContextMenuInfo) {
  return !Object.values(contextMenu).some(Boolean);
}

function useToolIfNeeded(
  editor: Editor,
  eventHandlerName: ToolEventHandlerName,
  clientArea: HTMLElement,
  event: Event,
) {
  const editorTool = editor.tool();
  if (!editorTool) {
    return false;
  }

  editor.lastEvent = event;
  const conditions = [
    eventHandlerName in editorTool,
    clientArea.contains(event.target as Node | null) ||
      editorTool.isSelectionRunning?.(),
    isContextMenuClosed(editor.contextMenu),
  ];

  if (conditions.every((condition) => condition)) {
    editorTool[eventHandlerName]?.(event);
    return true;
  }

  return false;
}

function domEventSetup(
  editor: Editor,
  clientArea: HTMLElement,
  bus: IEditorEventBus,
) {
  // DOM listeners now owned by EditorEventBus; here only wire tool dispatch
  const mappings: Array<{
    eventName: string;
    toolEventHandler: ToolEventHandlerName;
  }> = [
    { eventName: 'click', toolEventHandler: 'click' },
    { eventName: 'dblclick', toolEventHandler: 'dblclick' },
    { eventName: 'mousedown', toolEventHandler: 'mousedown' },
    { eventName: 'mousemove', toolEventHandler: 'mousemove' },
    { eventName: 'mouseup', toolEventHandler: 'mouseup' },
    { eventName: 'mouseleave', toolEventHandler: 'mouseleave' },
    { eventName: 'mouseleave', toolEventHandler: 'mouseLeaveClientArea' },
    { eventName: 'mouseover', toolEventHandler: 'mouseover' },
  ];

  mappings.forEach(({ eventName, toolEventHandler }) => {
    const subs = bus.getSubscription(toolEventHandler);
    if (subs) {
      (editor.event as Record<string, unknown>)[toolEventHandler] = subs;
      if (!(editor.event as Record<string, unknown>)[eventName]) {
        (editor.event as Record<string, unknown>)[eventName] = subs;
      }
    }

    bus.on(
      toolEventHandler,
      (event) => {
        updateLastCursorPosition(editor, event);

        if (
          !['mouseup', 'mousedown', 'click', 'dbclick'].includes(
            (event as Event).type,
          ) ||
          isMouseMainButtonPressed(event as MouseEvent)
        ) {
          if (eventName === 'mousemove') {
            const itemUnderCursor = editor.findItem(event, [
              'atoms',
              'bonds',
              'sgroups',
            ]);
            if (!itemUnderCursor) {
              editor.hover(null);
            }
          }

          const isScrollClick =
            eventName !== 'mouseup' &&
            eventName !== 'mouseleave' &&
            (!event.target || (event.target as HTMLElement).nodeName === 'DIV');

          if (isScrollClick) {
            editor.hover(null);
          } else {
            const isToolUsed = useToolIfNeeded(
              editor,
              toolEventHandler,
              clientArea,
              event,
            );
            if (!isToolUsed) {
              resetSelectionOnCanvasClick(editor, eventName, clientArea, event);
            }
          }
        }

        return true;
      },
      -1,
    );
  });
}

export { Editor };
export default Editor;
