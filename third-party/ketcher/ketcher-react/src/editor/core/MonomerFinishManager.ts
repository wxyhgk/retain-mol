import {
  type BaseMonomer,
  type IKetMonomerTemplate,
  type IKetTemplateConnection,
  type MonomerCreationState,
  type Bond,
  type Render,
  type EditorDocumentChangeReason,
  type Struct,
  Action,
  AttachmentPointName,
  fromFragmentDeletion,
  fromNewCanvas,
  fromSgroupAddition,
  getKetRef,
  KetConnectionType,
  KetMonomerClass,
  KetTemplateType,
  MacromoleculesConverter,
  setMonomerGroupTemplatePrefix,
  setMonomerTemplatePrefix,
  SGroup,
  Vec2,
} from 'ketcher-core';
import { isNumber } from 'lodash';
import type { Selection } from './SelectionManager';
import type { ISGroupManager } from './SGroupManager';

export type FinishNewMonomersCreationOptions = {
  rnaPresetName?: string;
  phosphatePosition?: '3' | '5';
};

export type FinishNewMonomersCreationData = {
  monomer: BaseMonomer;
  monomerTemplate: IKetMonomerTemplate;
  monomerRef: string;
  monomerStructureInWizard: Selection;
  atomIdMap: Map<number, number>;
};

type EditableSGroupMonomer = {
  monomer?: {
    monomerItem?: {
      label?: string;
      expanded?: boolean;
      props?: {
        MonomerClass?: KetMonomerClass;
        MonomerCode?: string;
        MonomerName?: string;
      };
    };
  };
};

export interface IMonomerFinishManager {
  finishNewMonomersCreation(
    monomersData: FinishNewMonomersCreationData[],
    options?: FinishNewMonomersCreationOptions,
  ): void;
}

type Deps = {
  getRender: () => Render;
  getStruct: () => Struct;
  setStruct: (struct: Struct) => Struct;
  update: (action: Action | true, ignoreHistory?: boolean) => void;
  closeMonomerCreationWizard: () => void;
  getMonomerCreationState: () => MonomerCreationState | null;
  getOriginalStruct: () => Struct;
  getOriginalSelection: () => Selection;
  getSelectedToOriginalAtomsIdMap: () => Map<number, number>;
  updateMonomersLibrary: (
    library: string,
    options: {
      format: 'ket';
      shouldPersist: boolean;
      needDispatchLibraryUpdateEvent: boolean;
    },
  ) => unknown;
  selection: (sel: Selection | null) => Selection | null;
  dispatchChange: () => void;
  getSGroupManager: () => ISGroupManager;
  setDocumentTransitioning: (active: boolean) => void;
  notifyDocumentChange?: (reason: EditorDocumentChangeReason) => void;
};

export class MonomerFinishManager implements IMonomerFinishManager {
  private readonly deps: Deps;

  constructor(deps: Deps) {
    this.deps = deps;
  }

  finishNewMonomersCreation(
    monomersData: FinishNewMonomersCreationData[],
    { rnaPresetName, phosphatePosition }: FinishNewMonomersCreationOptions = {},
  ): void {
    // Closing the wizard precedes asynchronous merging; keep readers unavailable
    // until the final structure has replaced every temporary/intermediate graph.
    this.deps.setDocumentTransitioning(true);
    this.deps.notifyDocumentChange?.('mode');
    const isRnaType = Boolean(rnaPresetName);
    const editAllInitialValues =
      this.deps.getMonomerCreationState()?.editInstanceInitialValues;
    const render = this.deps.getRender();

    const libraryItems = monomersData.map((monomerData) => {
      const {
        monomer,
        monomerTemplate,
        monomerRef,
        monomerStructureInWizard,
        atomIdMap,
      } = monomerData;
      const reversedAtomIdMap = new Map();
      for (const [key, value] of atomIdMap.entries())
        reversedAtomIdMap.set(value, key);
      const sGroupAttachmentPoints =
        MacromoleculesConverter.convertMonomerAttachmentPointsToSGroupAttachmentPoints(
          monomer,
          reversedAtomIdMap,
        );
      const action = fromSgroupAddition(
        render.ctab,
        SGroup.TYPES.SUP,
        monomerStructureInWizard.atoms,
        { expanded: true },
        render.ctab.molecule.sgroups.newId(),
        sGroupAttachmentPoints,
        editAllInitialValues?.position ?? monomer.position,
        true,
        monomer.monomerItem.props.MonomerName,
        null,
        monomer,
      );
      render.ctab.molecule.clearFragments();
      render.ctab.molecule.markFragments();
      this.deps.update(action);
      const { root: templateRoot, ...templateData } = monomerTemplate;
      return { root: { ...templateRoot }, [monomerRef]: { ...templateData } };
    });

    let ket: Record<string, unknown> & { root: { templates: unknown[] } } = {
      root: {
        templates: libraryItems.map(
          (li) =>
            (li as { root: { templates: unknown[] } }).root.templates?.[0],
        ),
      },
    } as never;
    libraryItems.forEach((libraryItem) => {
      ket = { ...libraryItem, ...ket } as never;
    });

    if (isRnaType) {
      const templateId = monomersData
        .map((d) => d.monomerTemplate.id)
        .join('_');
      const templateRef = setMonomerGroupTemplatePrefix(templateId);
      const sugarMonomerTemplate = monomersData.find(
        ({ monomerTemplate }) =>
          monomerTemplate.class === KetMonomerClass.Sugar,
      )?.monomerTemplate;
      const phosphateMonomerTemplate = monomersData.find(
        ({ monomerTemplate }) =>
          monomerTemplate.class === KetMonomerClass.Phosphate,
      )?.monomerTemplate;
      const baseMonomerTemplate = monomersData.find(
        ({ monomerTemplate }) => monomerTemplate.class === KetMonomerClass.Base,
      )?.monomerTemplate;
      const rnaPresetConnections: IKetTemplateConnection[] = [];
      if (sugarMonomerTemplate && phosphateMonomerTemplate) {
        const sugarAttachmentPointId =
          phosphatePosition === '5'
            ? AttachmentPointName.R1
            : AttachmentPointName.R2;
        const phosphateAttachmentPointId =
          phosphatePosition === '5'
            ? AttachmentPointName.R2
            : AttachmentPointName.R1;
        rnaPresetConnections.push({
          connectionType: KetConnectionType.SINGLE,
          endpoint1: {
            templateId: setMonomerTemplatePrefix(sugarMonomerTemplate.id),
            attachmentPointId: sugarAttachmentPointId,
          },
          endpoint2: {
            templateId: setMonomerTemplatePrefix(phosphateMonomerTemplate.id),
            attachmentPointId: phosphateAttachmentPointId,
          },
        });
      }
      if (sugarMonomerTemplate && baseMonomerTemplate) {
        rnaPresetConnections.push({
          connectionType: KetConnectionType.SINGLE,
          endpoint1: {
            templateId: setMonomerTemplatePrefix(sugarMonomerTemplate.id),
            attachmentPointId: AttachmentPointName.R3,
          },
          endpoint2: {
            templateId: setMonomerTemplatePrefix(baseMonomerTemplate.id),
            attachmentPointId: AttachmentPointName.R1,
          },
        });
      }
      const libraryItem = {
        root: { templates: [getKetRef(templateRef)] },
        [templateRef]: {
          type: KetTemplateType.MONOMER_GROUP_TEMPLATE,
          class: KetMonomerClass.RNA,
          name: rnaPresetName,
          id: templateId,
          templates: [...monomersData.map((d) => getKetRef(d.monomerRef))],
          connections: rnaPresetConnections,
        },
      };
      (ket.root.templates as unknown[]).push(getKetRef(templateRef));
      (ket as Record<string, unknown>)[templateRef] = (
        libraryItem as Record<string, unknown>
      )[templateRef];
    }
    this.deps.updateMonomersLibrary(JSON.stringify(ket), {
      format: 'ket',
      shouldPersist: true,
      needDispatchLibraryUpdateEvent: true,
    });

    const selectedOriginalAtoms = new Set(
      this.deps.getOriginalSelection().atoms ?? [],
    );
    const sourceMonomerExpanded = this.deps
      .getSGroupManager()
      .getOriginalSelectedMonomerExpanded(selectedOriginalAtoms);
    const externalBonds: Bond[] = [];
    this.deps.getOriginalStruct().bonds.forEach((bond) => {
      if (
        selectedOriginalAtoms.has(bond.begin) &&
        !selectedOriginalAtoms.has(bond.end)
      )
        externalBonds.push(bond);
      if (
        selectedOriginalAtoms.has(bond.end) &&
        !selectedOriginalAtoms.has(bond.begin)
      )
        externalBonds.push(bond);
    });
    const originalToSelectedAtomsIdMap = new Map<number, number>();
    this.deps
      .getSelectedToOriginalAtomsIdMap()
      .forEach((originalAtomId, selectedAtomId) => {
        originalToSelectedAtomsIdMap.set(originalAtomId, selectedAtomId);
      });
    const structFromWizard = this.deps.getStruct();
    let monomerShiftVector: Vec2 | null = null;
    let matchedAtomsCount = 0;
    let totalShiftX = 0;
    let totalShiftY = 0;
    this.deps
      .getSelectedToOriginalAtomsIdMap()
      .forEach((originalAtomId, selectedAtomId) => {
        const originalAtom = this.deps
          .getOriginalStruct()
          .atoms.get(originalAtomId);
        const selectedAtom = structFromWizard.atoms.get(selectedAtomId);
        if (!originalAtom?.pp || !selectedAtom?.pp) return;
        totalShiftX += originalAtom.pp.x - selectedAtom.pp.x;
        totalShiftY += originalAtom.pp.y - selectedAtom.pp.y;
        matchedAtomsCount += 1;
      });
    if (matchedAtomsCount > 0)
      monomerShiftVector = new Vec2(
        totalShiftX / matchedAtomsCount,
        totalShiftY / matchedAtomsCount,
      );

    this.deps.closeMonomerCreationWizard();
    const loadOriginalAction = fromNewCanvas(
      render.ctab,
      this.deps.getOriginalStruct(),
    );
    this.deps.update(loadOriginalAction, true);
    this.deps.dispatchChange();

    setTimeout(() => {
      const newAction = new Action();
      newAction.mergeWith(
        fromFragmentDeletion(render.ctab, this.deps.getOriginalSelection()),
      );
      this.deps.update(newAction, true);
      const atomIdMap = new Map<number, number>();
      structFromWizard.mergeInto(
        this.deps.getStruct(),
        undefined,
        undefined,
        undefined,
        undefined,
        atomIdMap,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      );
      const struct = this.deps.getStruct();
      if (monomerShiftVector) {
        atomIdMap.forEach((newAtomId) => {
          const atom = struct.atoms.get(newAtomId);
          if (atom?.pp) atom.pp = atom.pp.add(monomerShiftVector);
        });
      }
      externalBonds.forEach((bond) => {
        const isBeginSelected = selectedOriginalAtoms.has(bond.begin);
        const isEndSelected = selectedOriginalAtoms.has(bond.end);
        if (isBeginSelected && !isEndSelected) {
          const wizardId = originalToSelectedAtomsIdMap.get(bond.begin);
          const newBegin = isNumber(wizardId)
            ? atomIdMap.get(wizardId)
            : undefined;
          if (isNumber(newBegin)) {
            const nb = bond.clone();
            nb.begin = newBegin;
            struct.bonds.add(nb);
          }
        }
        if (isEndSelected && !isBeginSelected) {
          const wizardId = originalToSelectedAtomsIdMap.get(bond.end);
          const newEnd = isNumber(wizardId)
            ? atomIdMap.get(wizardId)
            : undefined;
          if (isNumber(newEnd)) {
            const nb = bond.clone();
            nb.end = newEnd;
            struct.bonds.add(nb);
          }
        }
      });
      struct.bonds.forEach((bond) => {
        const fromSgroup = struct.getGroupFromAtomId(bond.begin);
        const toSgroup = struct.getGroupFromAtomId(bond.end);
        if (fromSgroup && fromSgroup.isMonomer && fromSgroup !== toSgroup)
          this.deps
            .getSGroupManager()
            .updateBondEndpointByAttachmentPoint(bond, 'begin', fromSgroup);
        if (toSgroup && toSgroup.isMonomer && toSgroup !== fromSgroup)
          this.deps
            .getSGroupManager()
            .updateBondEndpointByAttachmentPoint(bond, 'end', toSgroup);
      });
      if (editAllInitialValues?.editMode && monomersData.length === 1) {
        struct.sgroups.forEach((sgroup) => {
          if (
            (sgroup as EditableSGroupMonomer).monomer ===
            monomersData[0].monomer
          )
            this.deps
              .getSGroupManager()
              .setMonomerExpandedState(sgroup, sourceMonomerExpanded);
        });
      }
      if (
        editAllInitialValues?.editMode === 'all' &&
        monomersData.length === 1 &&
        editAllInitialValues.originalType &&
        editAllInitialValues.originalSymbol
      ) {
        this.deps
          .getSGroupManager()
          .replaceMatchingMonomerStructures(
            struct,
            monomersData[0].monomer,
            editAllInitialValues.originalType,
            editAllInitialValues.originalSymbol,
            sourceMonomerExpanded,
            editAllInitialValues.selectedSGroupIds,
          );
        struct.sGroupsRecalcCrossBonds();
      }
      this.deps.setStruct(
        this.deps
          .getStruct()
          .clone(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            true,
          ),
      );
      const createdMonomers = new Set(
        monomersData.map(({ monomer }) => monomer),
      );
      const selectedAtoms = new Set<number>();
      const selectedBonds = new Set<number>();
      const finalStruct = this.deps.getStruct();
      finalStruct.sgroups.forEach((sgroup) => {
        const sm = (sgroup as { monomer?: unknown }).monomer;
        if (!sgroup.isMonomer || !createdMonomers.has(sm as BaseMonomer))
          return;
        SGroup.getAtoms(finalStruct, sgroup).forEach((id) =>
          selectedAtoms.add(id),
        );
        SGroup.getBonds(finalStruct, sgroup).forEach((id) =>
          selectedBonds.add(id),
        );
      });
      if (selectedAtoms.size > 0 || selectedBonds.size > 0) {
        this.deps.selection({
          atoms: Array.from(selectedAtoms),
          bonds: Array.from(selectedBonds),
        });
      }
      this.deps.setDocumentTransitioning(false);
      this.deps.notifyDocumentChange?.('mode');
    }, 0);
  }
}
