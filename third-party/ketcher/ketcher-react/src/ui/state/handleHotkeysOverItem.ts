import type { Dispatch } from 'redux';
import {
  fromAtomAddition,
  fromAtomsAttrs,
  fromBondAddition,
  fromBondsAttrs,
  fromFragmentDeletion,
  FunctionalGroup,
  Atom,
  Action,
  KetcherLogger,
  bondChangingAction,
} from 'ketcher-core';
import { STRUCT_TYPE } from 'src/constants';
import { openDialog } from './modal';
import { getSelectedAtoms } from '../../editor/tool/select';
import { onAction } from './shared';
import type { IToolContext } from '../../editor/tool/IToolContext';
import { updateSelectedAtoms } from 'src/ui/state/modal/atoms';
import {
  type ElementFormData,
  fromAtom,
  toAtom,
  fromBond,
  toBond,
} from '../data/convert/structconv';
import SGroupTool from '../../editor/tool/sgroup';
import { deleteFunctionalGroups } from '../../editor/tool/helper/deleteFunctionalGroups';
import TemplateTool from '../../editor/tool/template';
import { dispatchMonomerOrGroupDialog } from '../../editor/tool/monomerDialog.helpers';
import { attachTemplateToBond } from '../../editor/tool/templateAttachment';
import {
  executeAtomHotspotCommand,
  type AtomHotspotOptions,
} from '../../editor/tool/atomHotspot';

// ChemDraw §1 全量基团（27 项 label，去重后 26 + * 忽略）：单字母大小写严格区分，
// 同义组 o/q→OH、n/w→NH2、l/C→Cl 已在 atoms.js 归一，非元素走 pseudo
const SPROUT_LABELS = [
  'OH',
  'OMe',
  'NH2',
  'NO2',
  'SH',
  'SiH3',
  'PH2',
  'Ph',
  'F',
  'CF3',
  'Cl',
  'Li',
  'Br',
  'BH2',
  'H',
  'Cbz',
  'Boc',
  'Fmoc',
  'Me',
  'MgBr',
  'CH3',
  'I',
  'D',
  'Ac',
  'Et',
  'CO2Me',
] as const;

type TNewAction = {
  tool?: string;
  dialog?: string;
  opts?: any;
};

type HandlersProps = {
  hoveredItemId: number;
  newAction: TNewAction;
  ctx: IToolContext;
  dispatch: Dispatch;
};

type HandleHotkeyOverItemProps = {
  hoveredItem: Record<string, number>;
  newAction: TNewAction;
  ctx: IToolContext;
  dispatch: Dispatch;
};

export function handleHotkeyOverItem(props: HandleHotkeyOverItemProps) {
  if (props.newAction.tool === 'eraser') {
    return handleEraser(props);
  } else if (props.newAction.dialog) {
    return handleDialog(props);
  } else if (props.newAction.tool) {
    return handleTool(props);
  } else {
    return handleOtherActions(props);
  }
}

function handleOtherActions({
  dispatch,
  newAction,
}: HandleHotkeyOverItemProps) {
  dispatch(onAction(newAction));
}

function eraseItem({
  ctx,
  item,
}: {
  ctx: IToolContext;
  item: Record<string, number[]>;
}) {
  const action = fromFragmentDeletion(ctx.render.ctab, item);

  ctx.update(action);
  ctx.hover(null);
}

function handleEraser({
  ctx,
  hoveredItem,
  newAction,
  dispatch,
}: HandleHotkeyOverItemProps) {
  const item = mapItemsToArrays(hoveredItem);
  const itemType = Object.keys(hoveredItem)[0];
  const activeTool = ctx.tool();

  if (activeTool instanceof TemplateTool) {
    activeTool.templatePreview?.hideConnectedPreview();
  }

  if ([STRUCT_TYPE.atoms, STRUCT_TYPE.bonds].includes(itemType)) {
    isFunctionalGroupChange(
      { ctx, hoveredItemId: item[itemType][0], newAction, dispatch },
      itemType,
    ).then((res) => {
      if (res) {
        eraseItem({ ctx, item });
      }
    });
  } else {
    eraseItem({ ctx, item });
  }
}

function handleDialog({
  hoveredItem,
  newAction,
  ctx,
  dispatch,
}: HandleHotkeyOverItemProps) {
  const dialogType = Object.keys(hoveredItem)[0];
  const dialogHandler = getDialogHandler(dialogType);
  const hoveredItemId = hoveredItem[dialogType];

  if (dialogHandler) {
    const props: HandlersProps = {
      hoveredItemId,
      newAction,
      ctx,
      dispatch,
    };
    return dialogHandler(props);
  }
}

function getDialogHandler(itemType: string) {
  const dialogs = {
    atoms: (props: HandlersProps) => handleAtomPropsDialog(props),
    bonds: (props: HandlersProps) => handleBondPropsDialog(props),
  };

  const dialog = dialogs[itemType];
  return dialog;
}

function handleAtomPropsDialog({
  hoveredItemId,
  newAction,
  ctx,
  dispatch,
}: HandlersProps) {
  const selection = ctx.selection();
  const restruct = ctx.render.ctab;

  if (selection?.atoms?.includes(hoveredItemId)) {
    const atoms = getSelectedAtoms(selection, restruct.molecule);
    const changeAtomPromise = ctx.event.elementEdit.dispatch(atoms);

    updateSelectedAtoms({
      atoms: selection.atoms || [],
      editor: ctx,
      changeAtomPromise: changeAtomPromise as Parameters<
        typeof updateSelectedAtoms
      >[0]['changeAtomPromise'],
    });
  } else {
    const atomFromStruct = restruct.atoms.get(hoveredItemId);
    const convertedAtomForModal = fromAtom(atomFromStruct?.a);

    if (!newAction.dialog) return;

    openDialog(dispatch, newAction.dialog, convertedAtomForModal ?? undefined)
      .then((res) => {
        const updatedAtom = fromAtomsAttrs(
          restruct,
          hoveredItemId,
          toAtom(res as ElementFormData),
          false,
        );

        ctx.update(updatedAtom);
      })
      .catch((e) => {
        KetcherLogger.error(
          'handleHotkeysOverItem.ts::handleAtomPropsDialog',
          e,
        );
      });
  }
}

function handleBondPropsDialog({
  hoveredItemId,
  newAction,
  ctx,
  dispatch,
}: HandlersProps) {
  const restruct = ctx.render.ctab;
  const bondFromStruct = restruct.bonds.get(hoveredItemId);
  const convertedBondForModal = fromBond(bondFromStruct?.b);

  if (!newAction.dialog) return;

  openDialog(dispatch, newAction.dialog, convertedBondForModal ?? undefined)
    .then((res) => {
      const convertedBond = toBond(res as ReturnType<typeof fromBond>);
      if (!convertedBond) return;

      const updatedBond = fromBondsAttrs(
        restruct,
        hoveredItemId,
        convertedBond,
        false,
      );

      ctx.update(updatedBond);
    })
    .catch((e) => {
      KetcherLogger.error(
        'handleHoutkeysOverItem.ts::handleBondPropsDialog',
        e,
      );
    });
}

function handleTool({
  hoveredItem,
  newAction,
  ctx,
  dispatch,
}: HandleHotkeyOverItemProps) {
  for (const item in hoveredItem) {
    const toolHandler = getToolHandler(item, newAction.tool);
    const hoveredItemId = hoveredItem[item];

    if (toolHandler) {
      const props: HandlersProps = {
        hoveredItemId,
        ctx,
        newAction,
        dispatch,
      };
      // Structural sprout commands are not functional-group substitutions.
      if (newAction.tool === 'template' || newAction.tool === 'atom-hotspot') {
        return toolHandler(props);
      }
      const isChangeStructureTool = newAction.tool !== 'hand';
      isFunctionalGroupChange(props, item).then((result) => {
        if (!result && isChangeStructureTool) return;
        toolHandler(props);
      });
    }
  }
}

async function isFunctionalGroupChange(
  props: HandlersProps,
  type: string,
): Promise<boolean> {
  if (type === 'sgroups') return true;
  return await isChangingFunctionalGroup(props, type);
}

function getToolHandler(itemType: string, toolName = '') {
  const items = {
    atoms: {
      atom: (props: HandlersProps) => handleAtomTool(props),
      'atom-hotspot': (props: HandlersProps) => handleAtomHotspotTool(props),
      bond: (props: HandlersProps) => handleBondTool(props),
      charge: (props: HandlersProps) => handleChargeTool(props),
      rgroupatom: (props: HandlersProps) => handleRGroupAtomTool(props),
      template: (props: HandlersProps) => handleTemplateOnAtom(props),
      sgroup: ({ ctx, hoveredItemId }: HandlersProps) => {
        SGroupTool.sgroupDialog(ctx, hoveredItemId);
      },
      hand: ({ dispatch }: HandlersProps) =>
        dispatch(onAction({ tool: 'hand' })),
    },
    bonds: {
      bond: (props: HandlersProps) => handleBondTypeChangeTool(props),
      template: ({ ctx, hoveredItemId, newAction }: HandlersProps) =>
        attachTemplateToBond(ctx, newAction.opts, hoveredItemId),
    },
    sgroups: {
      atom: (props: HandlersProps) => handleSgroupsTool(props),
      'atom-hotspot': (props: HandlersProps) =>
        handleSgroupAtomHotspotTool(props),
    },
    _default: {},
  };

  const item = items[itemType];

  if (item) {
    return item[toolName];
  }
  return items._default[toolName];
}

function handleAtomTool({ hoveredItemId, newAction, ctx }: HandlersProps) {
  const label: string | undefined = newAction.opts?.label;
  if (label && (SPROUT_LABELS as readonly string[]).includes(label)) {
    // Sprout abbreviations: element halogens keep element label, pseudo-groups use pseudo
    const isElement = label === 'Br' || label === 'Cl' || label === 'F';
    const atomProps = isElement ? { label } : { label, pseudo: label };
    ctx.update(fromAtomsAttrs(ctx.render.ctab, hoveredItemId, atomProps, true));
    return;
  }
  const atomProps = { ...newAction.opts };
  const updatedAtoms = fromAtomsAttrs(
    ctx.render.ctab,
    hoveredItemId,
    atomProps,
    true,
  );
  ctx.update(updatedAtoms);
}

function handleSgroupsTool({ hoveredItemId, newAction, ctx }: HandlersProps) {
  const atomProps = { ...newAction.opts };
  const action = new Action();
  const ctab = ctx.render.ctab;
  const sGroup = ctab.molecule.sgroups.get(hoveredItemId);
  if (sGroup == null) {
    throw new Error(
      `unexpected error, sgroup with id "${hoveredItemId}" is not found`,
    );
  }
  const { atomId: SGroupPositionAtomId } = sGroup.getContractedPosition(
    ctab.molecule,
  );
  deleteFunctionalGroups([hoveredItemId], ctab, action);
  action.mergeWith(
    fromAtomsAttrs(ctx.render.ctab, SGroupPositionAtomId, atomProps, true),
  );
  ctx.update(action);
}

function handleBondTool({ hoveredItemId, newAction, ctx }: HandlersProps) {
  const opts = newAction.opts ?? {};
  const reStruct = ctx.render.ctab;
  // ChemDraw 2 = 将悬停原子原位变为羰基：B → B(=O)
  // B 自身成为羰基碳，向上双键连 O（A-B 中的 B 即羰基碳）
  if (opts.type === 2 && opts.label === 'O') {
    const [oAction] = fromBondAddition(reStruct, { type: 2 }, hoveredItemId, {
      label: 'O',
    });
    ctx.update(oAction);
    return;
  }
  const newBond = fromBondAddition(reStruct, opts, hoveredItemId, {
    label: 'C',
  })[0];
  ctx.update(newBond);
}

function handleTemplateOnAtom({
  hoveredItemId,
  newAction,
  ctx,
}: HandlersProps) {
  executeAtomHotspotCommand(ctx, hoveredItemId, {
    command: 'ring',
    struct: newAction.opts?.struct,
  });
}

function handleAtomHotspotTool({
  hoveredItemId,
  newAction,
  ctx,
}: HandlersProps) {
  executeAtomHotspotCommand(
    ctx,
    hoveredItemId,
    newAction.opts as AtomHotspotOptions,
  );
}

function handleSgroupAtomHotspotTool({
  hoveredItemId,
  newAction,
  ctx,
}: HandlersProps) {
  const sgroup = ctx.render.ctab.molecule.sgroups.get(hoveredItemId);
  const atomId = sgroup?.getContractedPosition(ctx.render.ctab.molecule).atomId;
  if (atomId === undefined) return;

  executeAtomHotspotCommand(ctx, atomId, newAction.opts as AtomHotspotOptions);
}

function handleBondTypeChangeTool({
  hoveredItemId,
  newAction,
  ctx,
}: HandlersProps) {
  const restruct = ctx.render.ctab;
  const bond = restruct.bonds.get(hoveredItemId)?.b;
  if (!bond) return;

  const action = bondChangingAction(restruct, hoveredItemId, bond, {
    ...newAction.opts,
  });
  ctx.update(action);
}

function handleChargeTool({ hoveredItemId, newAction, ctx }: HandlersProps) {
  const existingAtom = ctx.render.ctab.atoms.get(hoveredItemId)?.a;
  if (existingAtom) {
    const updatedAtom = fromAtomsAttrs(
      ctx.render.ctab,
      hoveredItemId,
      {
        charge: existingAtom.charge + newAction.opts,
      },
      null,
    );
    ctx.update(updatedAtom);
  }
}

function mapItemsToArrays(
  items: Record<string, number>,
): Record<string, number[]> {
  const mappedItems = {};
  for (const item in items) {
    mappedItems[item] = [items[item]];
  }
  return mappedItems;
}

async function handleRGroupAtomTool({ hoveredItemId, ctx }: HandlersProps) {
  const struct = ctx.render.ctab.molecule;
  const atom =
    hoveredItemId || hoveredItemId === 0
      ? struct.atoms.get(hoveredItemId)
      : null;
  const rglabel = atom ? atom.rglabel : 0;
  const label = atom ? atom.label : 'R#';

  try {
    let element = await ctx.event.elementEdit.dispatch({
      label: 'R#',
      rglabel,
      fragId: atom ? atom.fragment : null,
    });
    element = { ...Atom.attrlist, ...(element || {}) };

    if (!hoveredItemId && hoveredItemId !== 0 && element.rglabel) {
      ctx.update(fromAtomAddition(ctx.render.ctab, null, element));
    } else if (rglabel !== element.rglabel) {
      if (!element.rglabel && label !== 'R#') {
        element.label = label;
      }

      ctx.update(
        fromAtomsAttrs(ctx.render.ctab, hoveredItemId, element, false),
      );
    }
  } catch (e) {
    KetcherLogger.error('handleHotkeysOverItem.ts::handleRGroupAtomTool', e);
  } // w/o changes
}

function getFunctionalGroupIdByItem(
  ctx: IToolContext,
  hoveredItemId: number,
  type: string,
): number | null {
  const molecule = ctx.render.ctab.molecule;
  const functionalGroups = molecule.functionalGroups;

  return type === 'atoms'
    ? FunctionalGroup.findFunctionalGroupByAtom(functionalGroups, hoveredItemId)
    : FunctionalGroup.findFunctionalGroupByBond(
        molecule,
        functionalGroups,
        hoveredItemId,
      );
}

async function isChangingFunctionalGroup(
  { hoveredItemId, ctx }: HandlersProps,
  type: string,
) {
  const fgId = getFunctionalGroupIdByItem(ctx, hoveredItemId, type);

  if (fgId !== null) {
    await dispatchMonomerOrGroupDialog(ctx, [fgId]);

    return false;
  }

  return true;
}
