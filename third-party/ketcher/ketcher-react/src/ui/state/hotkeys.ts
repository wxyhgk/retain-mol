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
  fromRotate,
  Vec2,
  Scale,
  fromMultipleMove,
  isEditableInputTarget,
  SettingsManager,
  keyNorm,
  initHotKeys,
} from 'ketcher-core';
import { isEqual } from 'lodash/fp';
import { onAction, removeStructAction } from './shared';

import actions from '../action';
import { isArrowKey, moveSelectedItems } from './moveSelectedItems';
import { handleHotkeyOverItem } from './handleHotkeysOverItem';
import type { IToolContext } from '../../editor/tool/IToolContext';
import type { AtomHotspotCommand } from '../../editor/tool/atomHotspot';

export { initClipboard } from './clipboardProviderAdapter';

type KeydownEventTarget = Document | HTMLElement;
type KeydownListenerOwner = () => unknown;

const keydownListeners = new WeakMap<
  KeydownEventTarget,
  Map<KeydownListenerOwner, EventListener>
>();

type ChemDrawHotspotKeyEvent = Pick<
  KeyboardEvent,
  'key' | 'metaKey' | 'ctrlKey' | 'altKey'
>;

type ChemDrawBondOptions = {
  type: number;
  stereo?: number;
  label?: string;
};

export type ChemDrawHotspotRoute =
  | {
      target: 'atom';
      tool: 'atom-hotspot';
      command: AtomHotspotCommand;
      templateIndex?: number;
    }
  | {
      target: 'bond';
      tool: 'bond';
      opts: ChemDrawBondOptions;
    }
  | {
      target: 'bond';
      tool: 'template';
      templateIndex: number;
    };

export const CHEMDRAW_BOND_RING_TEMPLATE_INDEX: Readonly<
  Record<string, number>
> = {
  '4': 5, // Cyclobutane
  '5': 3, // Cyclopentane
  '6': 2, // Cyclohexane
  '7': 6, // Cycloheptane
  '8': 7, // Cyclooctane
  z: 1, // Cyclopentadiene
  v: 4, // Cyclopropane
  a: 0, // Benzene
};

// Atom hotspot shortcuts are context-sensitive and intentionally independent
// from the Bond table. In particular, Atom 7 means cyclopentane, while Bond 7
// still means cycloheptane.
export const CHEMDRAW_ATOM_RING_TEMPLATE_INDEX: Readonly<
  Record<string, number>
> = {
  '3': 0, // Benzene
  '6': 2, // Cyclohexane
  '7': 3, // Cyclopentane
  u: 5, // Cyclobutane
  v: 4, // Cyclopropane
  a: 0, // Benzene
};

const SELECTED_ATOM_SPROUT_KEYS = new Set(['0', '1', '2', '3', 'a']);

const BOND_STEREO_SHORTCUTS: Readonly<Record<string, ChemDrawBondOptions>> = {
  w: { type: 1, stereo: 1 }, // UP solid wedge
  W: { type: 1, stereo: 6 }, // DOWN solid wedge
  d: { type: 1, stereo: 4 }, // EITHER dashed/wavy bond
  D: { type: 1, stereo: 4 },
  h: { type: 1, stereo: 0 }, // Restore a plain single bond
  H: { type: 1, stereo: 0 },
  b: { type: 1, stereo: 4 },
  B: { type: 1, stereo: 4 },
};

const BOND_TYPE_SHORTCUTS: Readonly<Record<string, ChemDrawBondOptions>> = {
  '2': { type: 2 },
  '3': { type: 3 },
};

function hasHoveredItemId(
  hoveredItem: Record<string, number> | null,
  itemType: 'atoms' | 'bonds' | 'sgroups',
): boolean {
  return hoveredItem?.[itemType] !== undefined;
}

function isPlainChemDrawHotspotEvent(event: ChemDrawHotspotKeyEvent): boolean {
  return !event.metaKey && !event.ctrlKey && !event.altKey;
}

function resolveAtomHotspotShortcut(
  eventKey: string,
): ChemDrawHotspotRoute | null {
  if (eventKey === 'K') {
    return {
      target: 'atom',
      tool: 'atom-hotspot',
      command: 'stereo-gem-dimethyl',
    };
  }

  const rawKey = eventKey.toLowerCase();
  if (rawKey === '0' || rawKey === '1') {
    return {
      target: 'atom',
      tool: 'atom-hotspot',
      command: 'single-bond',
    };
  }
  if (rawKey === '2') {
    return {
      target: 'atom',
      tool: 'atom-hotspot',
      command: 'carbonyl',
    };
  }
  if (rawKey === '9') {
    return {
      target: 'atom',
      tool: 'atom-hotspot',
      command: 'gem-dimethyl',
    };
  }

  const templateIndex = CHEMDRAW_ATOM_RING_TEMPLATE_INDEX[rawKey];
  return templateIndex === undefined
    ? null
    : {
        target: 'atom',
        tool: 'atom-hotspot',
        command: 'ring',
        templateIndex,
      };
}

/**
 * Resolves only RetainMol's direct ChemDraw-style hotspot commands. Returning
 * null is important: the caller must leave system shortcuts (for example
 * Cmd/Ctrl+Z and Cmd/Ctrl+A) available to the regular shortcut dispatcher.
 */
export function resolveChemDrawHotspotShortcut(
  hoveredItem: Record<string, number> | null,
  event: ChemDrawHotspotKeyEvent,
): ChemDrawHotspotRoute | null {
  if (!isPlainChemDrawHotspotEvent(event)) {
    return null;
  }

  const rawKey = event.key.length === 1 ? event.key.toLowerCase() : '';
  if (
    hasHoveredItemId(hoveredItem, 'atoms') ||
    hasHoveredItemId(hoveredItem, 'sgroups')
  ) {
    return resolveAtomHotspotShortcut(event.key);
  }
  if (!hasHoveredItemId(hoveredItem, 'bonds')) {
    return null;
  }

  const templateIndex = CHEMDRAW_BOND_RING_TEMPLATE_INDEX[rawKey];
  if (templateIndex !== undefined) {
    return { target: 'bond', tool: 'template', templateIndex };
  }

  const opts = BOND_STEREO_SHORTCUTS[event.key] ?? BOND_TYPE_SHORTCUTS[rawKey];
  return opts ? { target: 'bond', tool: 'bond', opts } : null;
}

export function resolveSelectedAtomSproutShortcut(
  event: ChemDrawHotspotKeyEvent,
): ChemDrawHotspotRoute | null {
  if (!isPlainChemDrawHotspotEvent(event)) {
    return null;
  }

  const rawKey = event.key.length === 1 ? event.key.toLowerCase() : '';
  return SELECTED_ATOM_SPROUT_KEYS.has(rawKey)
    ? resolveAtomHotspotShortcut(event.key)
    : null;
}

function getActionForChemDrawHotspotRoute(route: ChemDrawHotspotRoute) {
  if (route.tool === 'bond') {
    return { tool: route.tool, opts: route.opts };
  }

  if (route.tool === 'atom-hotspot' && route.command !== 'ring') {
    return { tool: route.tool, opts: { command: route.command } };
  }

  const templateAction = (
    actions as unknown as Record<
      string,
      { action?: { opts?: { struct?: unknown } } }
    >
  )[`template-${route.templateIndex}`]?.action;
  if (!templateAction?.opts?.struct) return null;

  return route.tool === 'atom-hotspot'
    ? {
        tool: route.tool,
        opts: { command: route.command, struct: templateAction.opts.struct },
      }
    : { tool: 'template', opts: templateAction.opts };
}

export function initKeydownListener(element: KeydownEventTarget | null) {
  return function (dispatch, getState: KeydownListenerOwner) {
    if (!element) {
      return;
    }

    const hotKeys = initHotKeys(actions);
    const elementListeners =
      keydownListeners.get(element) ??
      new Map<KeydownListenerOwner, EventListener>();
    const previousListener = elementListeners.get(getState);
    if (previousListener) {
      element.removeEventListener('keydown', previousListener);
    }

    const listener: EventListener = (event) =>
      keyHandle(dispatch, getState, hotKeys, event as KeyboardEvent);
    elementListeners.set(getState, listener);
    keydownListeners.set(element, elementListeners);
    element.addEventListener('keydown', listener);
  };
}

export function removeKeydownListener(element: KeydownEventTarget | null) {
  return function (_dispatch, getState: KeydownListenerOwner) {
    if (!element) {
      return;
    }

    const elementListeners = keydownListeners.get(element);
    const listener = elementListeners?.get(getState);
    if (listener) {
      element.removeEventListener('keydown', listener);
      elementListeners?.delete(getState);
      if (elementListeners?.size === 0) {
        keydownListeners.delete(element);
      }
    }
  };
}

function removeNotRenderedStruct(actionTool, group, dispatch) {
  const affectedTools = ['paste', 'template'];
  if (affectedTools.includes(actionTool.tool) && group?.includes('save')) {
    dispatch(removeStructAction());
  }
}

function shouldIgnoreKeyEvent(state, event): boolean {
  if (window.isPolymerEditorTurnedOn) {
    return true;
  }
  if (state.modal) {
    return true;
  }
  // TODO: It is done to intercept hotkeys when editing inputs in monomer creation wizard
  // It targets plain inputs only, ideally it has to be incorporated with ClipArea functionality
  return isEditableInputTarget(event.target);
}

function handleRotateEscape(ctx: IToolContext) {
  ctx.rotateController.revert?.();
}

function isActionDisabledOrHidden(actionState, actName): boolean {
  return (
    (actionState[actName] && actionState[actName].disabled === true) ||
    actionState[actName]?.hidden === true
  );
}

function getNextAction(actName) {
  return ['zoom-in', 'zoom-out'].includes(actName)
    ? actions[actName].action()
    : actions[actName].action;
}

function shouldHandleItemDirectly(
  hoveredItem: Record<string, number> | null,
  newAction,
): hoveredItem is Record<string, number> {
  return Boolean(
    hoveredItem &&
      newAction.tool !== 'select' &&
      newAction.dialog !== 'templates',
  );
}

function handleSelectTool(newAction, key: string, index: number) {
  if (key === 'Escape') {
    return SettingsManager.getSettings().selectionTool;
  }
  if (index === -1) {
    return {};
  }
  return newAction;
}

// While hovering a bond, cycling through a shared shortcut (e.g. '1' for
// single/up/down/updown) must advance from the bond's own current type/stereo,
// not from the active toolbar tool (which doesn't change just from hovering,
// so re-pressing the key would otherwise always land on the same entry) (#3705).
function getNextBondTypeAction(hoveredItem, group, render) {
  const hoveredBondId = hoveredItem.bonds;
  if (hoveredBondId === undefined) return null;

  const bond = render.ctab.bonds.get(hoveredBondId)?.b;
  if (!bond) return null;

  const currentIndex = group.findIndex((actName) => {
    const opts = actions[actName]?.action?.opts;
    return opts?.type === bond.type && opts?.stereo === bond.stereo;
  });

  return getNextAction(group[(currentIndex + 1) % group.length]);
}

function handleHotkeyGroup(
  group,
  actionTool,
  actionState,
  key: string,
  ctx: IToolContext,
  render,
  dispatch,
  event,
) {
  const index = checkGroupOnTool(group, actionTool);
  const groupLength = group !== null ? group.length : 1;
  const newIndex = (index + 1) % groupLength;
  const actName = group[newIndex];

  if (isActionDisabledOrHidden(actionState, actName)) {
    event.preventDefault();
    return;
  }

  removeNotRenderedStruct(actionTool, group, dispatch);

  {
    let newAction = getNextAction(actName);
    const hoveredItem = getHoveredItem(render.ctab);
    const { atoms, bonds } = ctx.selection() ?? {};
    const hasSelection = Boolean(atoms?.length) || Boolean(bonds?.length);

    // ChemDraw: 原子字母键仅在悬停于原子 hotspot 时替换
    const isAtomHotkey = actName.startsWith('atom-');
    if (isAtomHotkey) {
      const isHoveringAtom =
        hasHoveredItemId(hoveredItem, 'atoms') ||
        hasHoveredItemId(hoveredItem, 'sgroups');
      if (!isHoveringAtom) {
        event.preventDefault();
        return;
      }
    }

    // For erase action, prioritize selected items over hovered item
    if (actName === 'erase' && hasSelection) {
      dispatch(onAction(newAction));
    } else if (shouldHandleItemDirectly(hoveredItem, newAction)) {
      newAction =
        getNextBondTypeAction(hoveredItem, group, render) ||
        getCurrentAction(group[index]) ||
        newAction;
      handleHotkeyOverItem({
        hoveredItem,
        newAction,
        ctx,
        dispatch,
      });
    } else {
      if (newAction.tool === 'select') {
        newAction = handleSelectTool(newAction, key, index);
      }
      dispatch(onAction(newAction));
    }
  }

  event.preventDefault();
}

/* HotKeys */
function keyHandle(dispatch, getState, hotKeys, event) {
  const state = getState();

  if (shouldIgnoreKeyEvent(state, event)) {
    return;
  }

  const ctx = state.editor as IToolContext;
  const { render } = ctx;
  const actionState = state.actionState;
  const actionTool = actionState.activeTool;
  const key = keyNorm(event);
  const hoveredItem = getHoveredItem(render.ctab);
  // ChemDraw §5: Enter = 编辑鼠标所在 Atom/Bond 的属性（复用 Slash 对话框逻辑）
  if (key === 'Enter' && hoveredItem) {
    const dialogMap: Record<string, string> = {
      atoms: 'atom-props',
      bonds: 'bond-props',
    };
    const hoveredMap = Object.keys(hoveredItem)[0];
    const actName = dialogMap[hoveredMap];
    if (actName && actions[actName]) {
      handleHotkeyOverItem({
        hoveredItem,
        newAction: actions[actName].action,
        ctx,
        dispatch,
      });
      event.preventDefault();
      return;
    }
  }

  const hotspotRoute = resolveChemDrawHotspotShortcut(hoveredItem, event);
  const hotspotAction = hotspotRoute
    ? getActionForChemDrawHotspotRoute(hotspotRoute)
    : null;
  if (hotspotAction && hoveredItem) {
    handleHotkeyOverItem({
      hoveredItem,
      newAction: hotspotAction as never,
      ctx,
      dispatch,
    });
    event.preventDefault();
    return;
  }

  // Selected-atom sprout has a direct entry because these product shortcuts
  // are intentionally independent from Ketcher's action shortcut registry.
  const { atoms: selectedAtoms } = ctx.selection() ?? {};
  const selectedAtomRoute =
    !hoveredItem && selectedAtoms?.length
      ? resolveSelectedAtomSproutShortcut(event)
      : null;
  const selectedAtomAction = selectedAtomRoute
    ? getActionForChemDrawHotspotRoute(selectedAtomRoute)
    : null;
  if (selectedAtomAction) {
    for (const atomId of selectedAtoms as number[]) {
      handleHotkeyOverItem({
        hoveredItem: { atoms: atomId },
        newAction: selectedAtomAction as never,
        ctx,
        dispatch,
      });
    }
    event.preventDefault();
    return;
  }

  // ChemDraw §5 Hotspot 操作：
  //   g = grab：选中鼠标所在 Atom/Bond（免切 Selection 工具）
  const hoveredIdKey = event.key.toLowerCase();
  if (hoveredIdKey === 'g' && hoveredItem) {
    const sel: Record<string, number[]> = {};
    for (const [map, id] of Object.entries(hoveredItem)) {
      sel[map] = [id as number];
    }
    ctx.selection(sel);
    dispatch(onAction({ tool: 'select' }));
    event.preventDefault();
    return;
  }

  //   Space/Tab = Molecule⇄Hotspot 选择切换
  if ((key === 'Space' || key === 'Tab') && hoveredItem) {
    const struct = render.ctab.molecule;
    const hoveredMap = Object.keys(hoveredItem)[0];
    const hoveredId = hoveredItem[hoveredMap];
    let atomId: number | undefined;
    if (hoveredMap === 'atoms') atomId = hoveredId;
    else if (hoveredMap === 'bonds') {
      atomId = struct.bonds.get(hoveredId)?.begin;
    } else if (hoveredMap === 'sgroups') {
      const sg = struct.sgroups.get(hoveredId);
      atomId = sg?.atoms[0];
    }
    if (atomId !== undefined) {
      const atom = struct.atoms.get(atomId);
      const frid = atom?.fragment;
      if (frid !== undefined) {
        ctx.selection({ atoms: Array.from(struct.getFragmentIds(frid)) });
        event.preventDefault();
        return;
      }
    }
  }

  if (ctx.rotateController.isRotating && key === 'Escape') {
    handleRotateEscape(ctx);
    return;
  }

  const group = keyNorm.lookup(hotKeys, event);
  if (group !== undefined) {
    handleHotkeyGroup(
      group,
      actionTool,
      actionState,
      key,
      ctx,
      render,
      dispatch,
      event,
    );
    return;
  }

  if (isArrowKey(event.key)) {
    // ChemDraw §4 分子整体操作：
    //   Shift+Arrow = 移动(已有, 10px 快速步进)
    //   Alt/Option+Arrow = 旋转选中分子（每次 15°，绕选中包围盒中心）
    //   Mod(Cmd/Ctrl)+Arrow = Reaction 操作：连同 rxnArrows/rxnPluses 一起平移
    const { atoms } = ctx.selection() ?? {};
    const hasSelection = Boolean(atoms?.length);

    if (event.metaKey || event.ctrlKey) {
      const selected = ctx.explicitSelected();
      const destinationVectorInCanvas =
        event.key === 'ArrowUp'
          ? new Vec2(0, -1)
          : event.key === 'ArrowDown'
          ? new Vec2(0, 1)
          : event.key === 'ArrowRight'
          ? new Vec2(1, 0)
          : new Vec2(-1, 0);
      const d = Scale.canvasToModel(
        destinationVectorInCanvas,
        ctx.render.options,
      );
      const action = fromMultipleMove(render.ctab, selected, d);
      ctx.update(action);
      ctx.rotateController.rerender();
      event.preventDefault();
      return;
    }

    if (event.altKey && hasSelection) {
      // 旋转：以选中原子包围盒中心为轴，±15°
      const struct = render.ctab.molecule;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      (atoms as number[]).forEach((aid) => {
        const pp = struct.atoms.get(aid)?.pp;
        if (!pp) return;
        minX = Math.min(minX, pp.x);
        minY = Math.min(minY, pp.y);
        maxX = Math.max(maxX, pp.x);
        maxY = Math.max(maxY, pp.y);
      });
      if (minX !== Infinity) {
        const center = new Vec2((minX + maxX) / 2, (minY + maxY) / 2);
        const direction =
          event.key === 'ArrowUp' || event.key === 'ArrowRight' ? 1 : -1;
        const angle = ((15 * Math.PI) / 180) * direction;
        const action = fromRotate(render.ctab, ctx.selection(), center, angle);
        ctx.update(action);
        ctx.rotateController.rerender();
        event.preventDefault();
        return;
      }
    }

    moveSelectedItems(ctx, event.key, event.shiftKey);
  }
}

function getCurrentAction(prevActName) {
  return actions[prevActName]?.action;
}

function getHoveredItem(ctab: object): Record<string, number> | null {
  const hoveredItem: Record<string, number> = {};

  for (const [ctabItem, collection] of Object.entries(ctab)) {
    if (Object.keys(hoveredItem).length) {
      break;
    }

    if (!(collection instanceof Map)) {
      continue;
    }

    const hoveredCollection = collection as Map<number, { hover?: boolean }>;
    hoveredCollection.forEach((item, id) => {
      if (item.hover) {
        hoveredItem[ctabItem] = id;
      }
    });
  }

  return Object.keys(hoveredItem).length ? hoveredItem : null;
}

function checkGroupOnTool(group, actionTool) {
  // 同一物理键可能被 atom-*/template-*/bond 异构共享，group 轮询易串台
  // 已将 1/0/2/3/a 的 sprout 前置直出直连，此处分组仅作同类轮询
  let index = group.indexOf(actionTool.tool);

  group.forEach((actName, i) => {
    if (isEqual(actions[actName].action, actionTool)) index = i;
  });

  return index;
}
