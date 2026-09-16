import {
  Action,
  Atom,
  AtomLabel,
  AttachmentPointName,
  Bond,
  MarkAsRnaComponentOperation,
  type RnaPresetComponentKey,
  type Render,
  type EditorDocumentChangeReason,
  Struct,
  type KetMonomerClass,
  type MonomerCreationState,
  type MonomerCreationInitialValues,
  type SGroupAttachmentPoint,
  getAttachmentPointLabel,
  getAttachmentPointNumberFromLabel,
  getNextFreeAttachmentPoint,
  getAttachmentPointLabelWithBinaryShift,
  genericsList,
  isSingleRGroupAttachmentPoint,
  assert,
  Elements,
  fromAtomsAttrs,
  fromBondAddition,
  KetcherLogger,
  type Vec2,
  AssignLeavingGroupAtomOperation,
  AssignAttachmentAtomOperation,
  ReassignLeavingAtomOperation,
  ReassignAttachmentPointOperation,
  RemoveAttachmentPointOperation,
} from 'ketcher-core';

import { isNumber } from 'lodash';
import type { Selection } from './SelectionManager';

export interface IMonomerWizardManager {
  get monomerCreationState(): MonomerCreationState | null;
  set monomerCreationState(state: MonomerCreationState | null);
  setMonomerCreationSelectedType(
    type: KetMonomerClass | 'rnaPreset' | undefined,
  ): void;
  markAsRnaComponent(
    componentKey: RnaPresetComponentKey,
    atomIds: number[],
    bondIds: number[],
  ): void;
  setConnectionAttachmentPoints(
    points: Map<AttachmentPointName, [number, number]>,
  ): void;
  setVisibleAssignedAttachmentPoints(
    points: Map<AttachmentPointName, [number, number]> | undefined,
  ): void;
  highlightConnectionAttachmentPoint(name: AttachmentPointName | null): void;
  highlightAtomById(atomId: number | null): void;
  get isMonomerCreationWizardActive(): boolean;
  get isMonomerCreationWizardEnabled(): boolean;
  isBondSuitableForAttachmentPoint(bond: Bond): boolean;
  isValidTerminalRGroupAtom(atom: Atom | undefined, struct: Struct): boolean;
  getBondByNeighborHalfBondId(
    struct: Struct,
    neighborHalfBondId?: number,
  ): Bond | null;
  openMonomerCreationWizard(
    selectionOverride?: Selection,
    editInstanceInitialValues?: MonomerCreationInitialValues,
    editInstanceAttachmentPoints?: ReadonlyArray<SGroupAttachmentPoint>,
  ): void;
  assignLeavingGroupAtom(atomId: number): void;
  assignConnectionPointAtom(
    atomId: number,
    attachmentPointName?: AttachmentPointName,
    assignedAttachmentPointsByMonomer?: Map<
      AttachmentPointName,
      [number, number]
    >,
    monomerStructure?: Selection,
    forceAddNewLeavingGroupAtom?: boolean,
    leavingAtomLabel?: AtomLabel,
    leavingAtomPosition?: Vec2,
  ): void;
  closeMonomerCreationWizard(restoreOriginalStruct?: boolean): void;
  reassignAttachmentPointLeavingAtom(
    name: AttachmentPointName,
    newLeavingAtomId: number,
  ): void;
  reassignAttachmentPoint(
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
  ): void;
  changeLeavingAtomLabel(
    name: AttachmentPointName,
    newLeavingAtomLabel: AtomLabel,
  ): void;
  removeAttachmentPoint(name: AttachmentPointName): void;
  cleanupCloseAttachmentPointEditPopup(): void;
  setProblematicAttachmentPoints(
    problematicPoints: Set<AttachmentPointName>,
  ): void;
  setProblematicAtoms(problematicAtoms: Set<number>): void;
  highlightAttachmentPoint(name: AttachmentPointName | null): void;
  findPotentialLeavingAtoms(attachmentAtomId: number): Atom[];
  originalStruct: Struct;
  originalSelection: Selection;
  originalHistoryStack: Action[];
  originalHistoryPointer: number;
  selectedToOriginalAtomsIdMap: Map<number, number>;
  terminalRGroupAtoms: Array<[number, string]>;
  potentialLeavingAtomsForAutoAssignment: number[];
  potentialLeavingAtomsForManualAssignment: number[];
}

type Deps = {
  getRender: () => Render;
  update: (action: Action) => void;
  getStruct: () => Struct;
  setStruct: (struct: Struct, needToCenter?: boolean) => void;
  getSelection: () => Selection | null;
  structSelected: (selection: Selection) => Struct;
  getHistoryStack: () => Action[];
  setHistoryStack: (stack: Action[]) => void;
  getHistoryPtr: () => number;
  setHistoryPtr: (ptr: number) => void;
  subscribeToChangeEventInMonomerCreationWizard: () => void;
  unsubscribeFromChangeEventInMonomerCreationWizard: () => void;
  setMonomerCreationStateNull: () => void;
  toolSelect: () => void;
  notifyDocumentChange?: (reason: EditorDocumentChangeReason) => void;
  setDocumentTransitioning?: (active: boolean) => void;
};

export class MonomerWizardManager implements IMonomerWizardManager {
  private static readonly suitableAttachmentPointStereoTypes = new Set([
    Bond.PATTERN.STEREO.NONE,
    Bond.PATTERN.STEREO.UP,
    Bond.PATTERN.STEREO.DOWN,
  ]);

  public originalStruct: Struct = new Struct();
  public originalSelection: Selection = {};
  public originalHistoryStack: Action[] = [];
  public originalHistoryPointer = 0;
  public readonly selectedToOriginalAtomsIdMap = new Map<number, number>();

  public terminalRGroupAtoms: Array<[number, string]> = [];
  public potentialLeavingAtomsForAutoAssignment: number[] = [];
  public potentialLeavingAtomsForManualAssignment: number[] = [];

  constructor(private deps: Deps) {}

  public get monomerCreationState() {
    return this.deps.getRender().monomerCreationState;
  }

  public set monomerCreationState(state: MonomerCreationState | null) {
    this.deps.getRender().monomerCreationState = state as never;
  }

  public setMonomerCreationSelectedType(
    type: KetMonomerClass | 'rnaPreset' | undefined,
  ) {
    const currentState = this.deps.getRender().monomerCreationState;
    if (!currentState) return;
    this.deps.getRender().monomerCreationState = {
      ...currentState,
      selectedMonomerClass: type,
    } as never;
    this.deps.getRender().update(true);
  }

  public markAsRnaComponent(
    componentKey: RnaPresetComponentKey,
    atomIds: number[],
    bondIds: number[],
  ) {
    const state = this.monomerCreationState;
    if (!state) return;
    if (!state.rnaComponentAtoms) {
      state.rnaComponentAtoms = new Map();
    }
    const prevComponentData = state.rnaComponentAtoms.get(componentKey);
    const prevAtomIds = prevComponentData?.atoms ?? [];
    const prevBondIds = prevComponentData?.bonds ?? [];
    const action = new Action([
      new MarkAsRnaComponentOperation(
        state,
        componentKey,
        atomIds,
        bondIds,
        prevAtomIds,
        prevBondIds,
      ),
    ]).perform(this.deps.getRender().ctab);
    this.deps.update(action);
  }

  public setConnectionAttachmentPoints(
    points: Map<AttachmentPointName, [number, number]>,
  ) {
    const currentState = this.deps.getRender().monomerCreationState;
    if (!currentState) return;
    this.deps.getRender().monomerCreationState = {
      ...currentState,
      connectionAttachmentPoints: points,
    } as never;
    this.deps.getRender().update(true);
  }

  public setVisibleAssignedAttachmentPoints(
    points: Map<AttachmentPointName, [number, number]> | undefined,
  ) {
    const currentState = this.deps.getRender().monomerCreationState;
    if (!currentState) return;
    this.deps.getRender().monomerCreationState = {
      ...currentState,
      visibleAssignedAttachmentPoints: points,
    } as never;
    this.deps.getRender().update(true);
  }

  public highlightConnectionAttachmentPoint(name: AttachmentPointName | null) {
    if (!name) {
      this.deps.getRender().ctab.setSelection(null);
      return;
    }
    const currentState = this.deps.getRender().monomerCreationState;
    if (!currentState?.connectionAttachmentPoints) return;
    const atomPair = currentState.connectionAttachmentPoints.get(name);
    if (!atomPair) return;
    this.deps.getRender().ctab.setSelection({ atoms: [atomPair[0]] });
  }

  public highlightAtomById(atomId: number | null) {
    if (atomId === null) {
      this.deps.getRender().ctab.setSelection(null);
      return;
    }
    this.deps.getRender().ctab.setSelection({ atoms: [atomId] });
  }

  public get isMonomerCreationWizardActive() {
    return Boolean(this.monomerCreationState);
  }

  public get isMonomerCreationWizardEnabled(): boolean {
    // Reset stale state so openMonomerCreationWizard won't use outdated atom IDs
    this.terminalRGroupAtoms = [];
    this.potentialLeavingAtomsForAutoAssignment = [];
    this.potentialLeavingAtomsForManualAssignment = [];

    if (this.isMonomerCreationWizardActive) {
      return false;
    }

    const currentStruct = this.deps.getStruct();
    const selection = this.deps.getSelection();

    // When there's no selection, use all atoms from the structure
    const atomsToProcess =
      selection !== null
        ? selection.atoms
        : Array.from(currentStruct.atoms.keys());

    if (!atomsToProcess || atomsToProcess.length === 0) {
      return false;
    }

    const selectionInvalid = atomsToProcess.some((atomId) => {
      const atom = currentStruct.atoms.get(atomId);

      if (!atom) {
        return true;
      }

      const { sgs, attachmentPoints, rglabel, neighbors, label } = atom;

      const belongsToSGroup = sgs.size > 0;
      const isAttachmentPoint = attachmentPoints !== null;
      const isNonTerminalRGroupLabel = rglabel !== null && neighbors.length > 1;
      const isTerminalRGroupCandidate =
        rglabel !== null && neighbors.length === 1;
      const hasUnsupportedTerminalRGroupBond =
        isTerminalRGroupCandidate &&
        !this.isValidTerminalRGroupAtom(atom, currentStruct);
      const hasMultipleRGroupLabel =
        rglabel !== null && !isSingleRGroupAttachmentPoint(Number(rglabel));
      const belongsToRGroup = currentStruct.rgroups.some((rgroup) =>
        rgroup.frags.has(atom.fragment),
      );
      const isExtendedTableAtom = genericsList.includes(label);

      return (
        belongsToSGroup ||
        isAttachmentPoint ||
        isNonTerminalRGroupLabel ||
        hasUnsupportedTerminalRGroupBond ||
        hasMultipleRGroupLabel ||
        belongsToRGroup ||
        isExtendedTableAtom
      );
    });

    if (selectionInvalid) {
      return false;
    }

    const terminalRGroupAtoms = atomsToProcess.filter((atomId) => {
      const atom = currentStruct.atoms.get(atomId);

      // Bond suitability is already enforced in selectionInvalid for terminal R-group candidates.
      return atom?.rglabel !== null && atom?.neighbors.length === 1;
    });

    const atomsToProcessSet = new Set(atomsToProcess);
    const bondsToOutside = currentStruct.bonds.filter((_, bond) => {
      return (
        (atomsToProcessSet.has(bond.begin) &&
          !atomsToProcessSet.has(bond.end)) ||
        (atomsToProcessSet.has(bond.end) && !atomsToProcessSet.has(bond.begin))
      );
    });

    const selectionHasInvalidOutgoingBonds = bondsToOutside.some(
      (bond) => !this.isBondSuitableForAttachmentPoint(bond),
    );
    if (selectionHasInvalidOutgoingBonds) {
      return false;
    }

    const potentialLeavingAtomsForAutoAssignment: number[] = [];
    bondsToOutside.forEach((bond) => {
      potentialLeavingAtomsForAutoAssignment.push(
        atomsToProcessSet.has(bond.begin) ? bond.end : bond.begin,
      );
    });

    const potentialLeavingAtomForManualAssignment: number[] = [];
    atomsToProcessSet.forEach((selectionAtomId) => {
      const selectionAtom = currentStruct.atoms.get(selectionAtomId);

      assert(selectionAtom);

      if (
        selectionAtom.neighbors.length > 1 ||
        isNumber(selectionAtom.rglabel)
      ) {
        return;
      }

      const bondToSelectionAtom = this.getBondByNeighborHalfBondId(
        currentStruct,
        selectionAtom.neighbors[0],
      );

      if (!bondToSelectionAtom) {
        return;
      }

      if (!this.isBondSuitableForAttachmentPoint(bondToSelectionAtom)) {
        return;
      }

      potentialLeavingAtomForManualAssignment.push(selectionAtomId);
    });

    const totalNumberOfAtomsForAutoAssignment =
      terminalRGroupAtoms.length +
      potentialLeavingAtomsForAutoAssignment.length;
    if (totalNumberOfAtomsForAutoAssignment > 8) {
      return false;
    }

    this.terminalRGroupAtoms = terminalRGroupAtoms.map((atomId) => {
      const atom = currentStruct.atoms.get(atomId);

      assert(atom);
      assert(atom.rglabel);

      const attachmentPointLabel = getAttachmentPointLabelWithBinaryShift(
        Number(atom.rglabel),
      );
      return [atomId, attachmentPointLabel] as [number, string];
    });
    this.potentialLeavingAtomsForAutoAssignment =
      potentialLeavingAtomsForAutoAssignment;
    this.potentialLeavingAtomsForManualAssignment =
      potentialLeavingAtomForManualAssignment;

    window.dispatchEvent(new CustomEvent('monomerCreationEnabled'));

    return true;
  }

  public isBondSuitableForAttachmentPoint(bond: Bond): boolean {
    if (bond.type !== Bond.PATTERN.TYPE.SINGLE) return false;
    return MonomerWizardManager.suitableAttachmentPointStereoTypes.has(
      bond.stereo,
    );
  }

  public isValidTerminalRGroupAtom(
    atom: Atom | undefined,
    struct: Struct,
  ): boolean {
    if (!atom) return false;
    const bondToTerminalRGroupAtom = this.getBondByNeighborHalfBondId(
      struct,
      atom.neighbors[0],
    );
    return (
      bondToTerminalRGroupAtom !== null &&
      this.isBondSuitableForAttachmentPoint(bondToTerminalRGroupAtom)
    );
  }

  public getBondByNeighborHalfBondId(
    struct: Struct,
    neighborHalfBondId?: number,
  ): Bond | null {
    if (!isNumber(neighborHalfBondId)) return null;
    const halfBond = struct.halfBonds.get(neighborHalfBondId);
    if (!halfBond) return null;
    return struct.bonds.get(halfBond.bid) ?? null;
  }

  public openMonomerCreationWizard(
    selectionOverride?: Selection,
    editInstanceInitialValues?: MonomerCreationInitialValues,
    editInstanceAttachmentPoints?: ReadonlyArray<SGroupAttachmentPoint>,
  ) {
    const currentStruct = this.deps.getRender().ctab.molecule;
    const rawSelection = selectionOverride ??
      this.deps.getSelection() ?? {
        atoms: Array.from(this.deps.getStruct().atoms.keys()),
        bonds: Array.from(this.deps.getStruct().bonds.keys()),
      };
    const selection: Selection = {
      rxnArrows: [],
      rxnPluses: [],
      texts: [],
      rgroupAttachmentPoints: [],
      ...rawSelection,
    };

    this.originalSelection = selection;
    const selectedStruct = this.deps.structSelected(selection);

    if (editInstanceInitialValues) {
      selectedStruct.functionalGroups.clear();
      Array.from(selectedStruct.sgroups.keys()).forEach((sgid) => {
        selectedStruct.sGroupDelete(sgid);
      });
      this.terminalRGroupAtoms = [];
      this.potentialLeavingAtomsForAutoAssignment = [];
      this.potentialLeavingAtomsForManualAssignment = [];
    }

    /*
     * Upon cloning the structure each entity gets a new id thus losing the mapping between the new and original one
     * Original atom ids can be retrieved from the selection data (do not confuse with the selected struct) by index:
     * E.g. selection.atoms = [3, 5, 7] will correspond to selectedStruct.atoms = [0, 1, 2]
     * However, ids get sorted upon cloning so we have to sort the selection atoms first as well in order to retrieve the correct index
     */
    const originalToSelectedAtomsIdMap = new Map<number, number>();
    [...(selection.atoms ?? [])]
      .sort((a, b) => a - b)
      .forEach((atomId, i) => {
        originalToSelectedAtomsIdMap.set(atomId, i);
        this.selectedToOriginalAtomsIdMap.set(i, atomId);
      });

    const assignedAttachmentPoints = new Map<
      AttachmentPointName,
      [number, number]
    >();

    editInstanceAttachmentPoints?.forEach((attachmentPoint) => {
      if (!attachmentPoint.attachmentPointNumber) {
        return;
      }

      const attachmentAtomId = originalToSelectedAtomsIdMap.get(
        attachmentPoint.atomId,
      );
      const leavingAtomId = originalToSelectedAtomsIdMap.get(
        attachmentPoint.leaveAtomId as number,
      );

      if (!isNumber(attachmentAtomId) || !isNumber(leavingAtomId)) {
        return;
      }

      assignedAttachmentPoints.set(
        getAttachmentPointLabel(attachmentPoint.attachmentPointNumber),
        [attachmentAtomId, leavingAtomId],
      );
    });

    const sideTerminalSGroupAtoms = this.terminalRGroupAtoms.filter(
      ([, attachmentPointLabel]) =>
        attachmentPointLabel !== AttachmentPointName.R1 &&
        attachmentPointLabel !== AttachmentPointName.R2,
    );
    let sideAttachmentPointsNames: AttachmentPointName[] = [];
    for (let i = 0; i < sideTerminalSGroupAtoms.length; i++) {
      const attachmentPointNumber = i + 3;
      if (attachmentPointNumber > 8) {
        break;
      }

      sideAttachmentPointsNames = sideAttachmentPointsNames.concat(
        getAttachmentPointLabel(attachmentPointNumber),
      );
    }

    const terminalRGroupAtomsSortedByLabel = [...this.terminalRGroupAtoms].sort(
      ([, labelA], [, labelB]) => {
        const labelANumber = getAttachmentPointNumberFromLabel(
          labelA as AttachmentPointName,
        );
        const labelBNumber = getAttachmentPointNumberFromLabel(
          labelB as AttachmentPointName,
        );
        return labelANumber - labelBNumber;
      },
    );

    terminalRGroupAtomsSortedByLabel.forEach(
      ([atomId, attachmentPointLabel]) => {
        const selectedStructLeavingAtomId =
          originalToSelectedAtomsIdMap.get(atomId);

        assert(selectedStructLeavingAtomId !== undefined);

        const selectedStructLeavingAtom = selectedStruct.atoms.get(
          selectedStructLeavingAtomId,
        );

        assert(selectedStructLeavingAtom);
        assert(selectedStructLeavingAtom.rglabel);

        let attachmentPointName: AttachmentPointName;

        // Check if this is R1 or R2 and if it's already assigned
        const isR1OrR2 =
          attachmentPointLabel === AttachmentPointName.R1 ||
          attachmentPointLabel === AttachmentPointName.R2;
        const isAlreadyAssigned = assignedAttachmentPoints.has(
          attachmentPointLabel as AttachmentPointName,
        );

        if (
          (isR1OrR2 && !isAlreadyAssigned) ||
          (!isR1OrR2 &&
            sideAttachmentPointsNames.includes(
              attachmentPointLabel as AttachmentPointName,
            ))
        ) {
          attachmentPointName = attachmentPointLabel as AttachmentPointName;
        } else {
          // For duplicate R1/R2 or other cases, assign to smallest available Rn (n>2)
          // or fall back to R1/R2 if no side attachment points are available
          const assignedAttachmentPointNames = Array.from(
            assignedAttachmentPoints.keys(),
          );
          // Skip R1/R2 when:
          // 1. Processing a duplicate R1/R2 label (requirement 2.6: prefer R3+)
          // 2. Processing other labels when we haven't assigned all expected side attachments yet
          const shouldSkipR1AndR2 =
            isR1OrR2 ||
            assignedAttachmentPointNames.length <
              sideAttachmentPointsNames.length;
          attachmentPointName = getNextFreeAttachmentPoint(
            assignedAttachmentPointNames,
            shouldSkipR1AndR2,
          );
        }

        selectedStructLeavingAtom.rglabel = null;
        selectedStructLeavingAtom.label = AtomLabel.H;

        const neighborHalfBondId = selectedStructLeavingAtom.neighbors[0];

        const selectedStructAttachmentAtomId =
          selectedStruct.halfBonds.get(neighborHalfBondId)?.end;

        assert(selectedStructAttachmentAtomId !== undefined);

        assignedAttachmentPoints.set(attachmentPointName, [
          selectedStructAttachmentAtomId,
          selectedStructLeavingAtomId,
        ]);
      },
    );

    this.potentialLeavingAtomsForAutoAssignment.forEach((leavingAtomId) => {
      const leavingAtom = currentStruct.atoms.get(leavingAtomId);
      assert(leavingAtom);

      let attachmentAtomId = -1;
      leavingAtom.neighbors.forEach((halfBondId) => {
        const halfBond = currentStruct.halfBonds.get(halfBondId);
        assert(halfBond !== undefined);

        if (selection.atoms?.includes(halfBond.end)) {
          attachmentAtomId = halfBond.end;
        }
      });

      if (attachmentAtomId === -1) {
        return;
      }

      const selectedStructLeavingAtom = new Atom({
        label: AtomLabel.H,
        pp: leavingAtom.pp,
      });
      const selectedStructLeavingAtomId = selectedStruct.atoms.add(
        selectedStructLeavingAtom,
      );
      this.selectedToOriginalAtomsIdMap.set(
        selectedStructLeavingAtomId,
        leavingAtomId,
      );

      const selectedStructAttachmentAtomId =
        originalToSelectedAtomsIdMap.get(attachmentAtomId);
      assert(selectedStructAttachmentAtomId !== undefined);

      this.selectedToOriginalAtomsIdMap.set(
        selectedStructAttachmentAtomId,
        attachmentAtomId,
      );

      const bondFromOriginalAttachmentAtom = Array.from(
        currentStruct.bonds.values(),
      ).find(
        (bond) =>
          (bond.begin === leavingAtomId && bond.end === attachmentAtomId) ||
          (bond.end === leavingAtomId && bond.begin === attachmentAtomId),
      );
      assert(bondFromOriginalAttachmentAtom);

      const newBond = new Bond({
        type: bondFromOriginalAttachmentAtom.type,
        stereo: bondFromOriginalAttachmentAtom.stereo,
        begin: selectedStructAttachmentAtomId,
        end: selectedStructLeavingAtomId,
      });
      selectedStruct.bonds.add(newBond);

      const assignedAttachmentPointNames = Array.from(
        assignedAttachmentPoints.keys(),
      );
      const attachmentPointName = getNextFreeAttachmentPoint(
        assignedAttachmentPointNames,
        assignedAttachmentPointNames.length < sideAttachmentPointsNames.length,
      );

      assignedAttachmentPoints.set(attachmentPointName, [
        selectedStructAttachmentAtomId,
        selectedStructLeavingAtomId,
      ]);
    });

    const potentialAttachmentPoints = new Map<number, Set<number>>();
    this.potentialLeavingAtomsForManualAssignment.forEach((leavingAtomId) => {
      const leavingAtom = currentStruct.atoms.get(leavingAtomId);
      assert(leavingAtom);

      const originalLeavingAtomId =
        originalToSelectedAtomsIdMap.get(leavingAtomId);
      const isLeavingAtomSelected = isNumber(originalLeavingAtomId);

      if (!isLeavingAtomSelected) {
        return;
      }

      let attachmentAtomId = -1;
      leavingAtom.neighbors.forEach((halfBondId) => {
        const halfBond = currentStruct.halfBonds.get(halfBondId);
        assert(halfBond !== undefined);

        if (selection.atoms?.includes(halfBond.end)) {
          attachmentAtomId = halfBond.end;
        }
      });

      if (attachmentAtomId === -1) {
        return;
      }

      const originalAttachmentAtomId =
        originalToSelectedAtomsIdMap.get(attachmentAtomId);

      if (!isNumber(originalAttachmentAtomId)) {
        return;
      }

      const potentialLeavingAtomsSet = potentialAttachmentPoints.get(
        originalAttachmentAtomId,
      );
      if (!potentialLeavingAtomsSet) {
        const potentialLeavingAtoms = new Set([originalLeavingAtomId]);
        potentialAttachmentPoints.set(
          originalAttachmentAtomId,
          potentialLeavingAtoms,
        );
      } else {
        potentialLeavingAtomsSet.add(originalLeavingAtomId);
      }
    });

    const hasDefaultAttachmentPoints =
      this.terminalRGroupAtoms.length > 0 ||
      this.potentialLeavingAtomsForAutoAssignment.length > 0;

    this.monomerCreationState = {
      assignedAttachmentPoints,
      potentialAttachmentPoints,
      problematicAttachmentPoints: new Set(),
      hasDefaultAttachmentPoints,
      ...(editInstanceInitialValues ? { editInstanceInitialValues } : {}),
    };
    // Readers must stop exposing the canvas before the wizard installs its draft.
    this.deps.notifyDocumentChange?.('mode');

    this.originalHistoryStack = this.deps.getHistoryStack();
    this.originalHistoryPointer = this.deps.getHistoryPtr();
    this.originalStruct = currentStruct;

    this.deps.setHistoryStack([]);
    this.deps.setHistoryPtr(0);
    this.deps.setStruct(selectedStruct);

    this.deps.subscribeToChangeEventInMonomerCreationWizard();
  }

  public assignLeavingGroupAtom(atomId: number) {
    const action = new Action([
      new AssignLeavingGroupAtomOperation(this.monomerCreationState, atomId),
    ]).perform(this.deps.getRender().ctab);
    this.deps.update(action);
  }

  public assignConnectionPointAtom(
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
    assert(this.monomerCreationState);
    const potentialLeavingAtoms =
      this.monomerCreationState.potentialAttachmentPoints.get(atomId);
    let leavingAtomId: number;
    let additionalAction: Action | null = null;
    if (!forceAddNewLeavingGroupAtom && potentialLeavingAtoms) {
      const [, minimalAtomicNumberAtomId] = Array.from(potentialLeavingAtoms)
        .sort((a, b) => a - b)
        .reduce(
          (acc, currentAtomId) => {
            const atom = this.deps.getStruct().atoms.get(currentAtomId);
            assert(atom);
            const atomicNumber = Elements.get(atom.label)?.number;
            if (atomicNumber !== undefined) {
              const minimalAtomicNumber = acc[0];
              if (atomicNumber < minimalAtomicNumber) {
                return [atomicNumber, currentAtomId];
              }
            }
            return acc;
          },
          [999, -1] as [number, number],
        );
      leavingAtomId = minimalAtomicNumberAtomId;
    } else {
      const [bondAdditionAction, , endAtomId, newBondId] = fromBondAddition(
        this.deps.getRender().ctab,
        { type: Bond.PATTERN.TYPE.SINGLE, stereo: Bond.PATTERN.STEREO.NONE },
        atomId,
        { label: leavingAtomLabel },
        undefined,
        leavingAtomPosition,
      );
      additionalAction = bondAdditionAction;
      leavingAtomId = endAtomId;
      if (monomerStructure) {
        monomerStructure.atoms?.push(leavingAtomId);
        monomerStructure.bonds?.push(newBondId);
      }
    }
    let finalAction = new Action([
      new AssignAttachmentAtomOperation(
        this.monomerCreationState,
        atomId,
        leavingAtomId,
        attachmentPointName,
        assignedAttachmentPointsByMonomer,
      ),
    ]).perform(this.deps.getRender().ctab);
    if (additionalAction) {
      finalAction = finalAction.mergeWith(additionalAction);
    }
    this.deps.update(finalAction);
  }

  public reassignAttachmentPointLeavingAtom(
    name: AttachmentPointName,
    newLeavingAtomId: number,
  ) {
    assert(this.monomerCreationState);
    const atomPair =
      this.monomerCreationState.assignedAttachmentPoints.get(name);
    assert(atomPair);
    const [attachmentAtomId, currentLeavingAtomId] = atomPair;
    let leavingAtomIdToUse = newLeavingAtomId;
    let additionalAction: Action | null = null;
    if (newLeavingAtomId === -1) {
      const [bondAdditionAction, , endAtomId] = fromBondAddition(
        this.deps.getRender().ctab,
        { type: Bond.PATTERN.TYPE.SINGLE, stereo: Bond.PATTERN.STEREO.NONE },
        attachmentAtomId,
        { label: AtomLabel.H },
      );
      additionalAction = bondAdditionAction;
      leavingAtomIdToUse = endAtomId;
    }
    let finalAction = new Action([
      new ReassignLeavingAtomOperation(
        this.monomerCreationState,
        name,
        attachmentAtomId,
        leavingAtomIdToUse,
        currentLeavingAtomId,
      ),
    ]).perform(this.deps.getRender().ctab);
    if (additionalAction) {
      finalAction = finalAction.mergeWith(additionalAction);
    }
    this.deps.update(finalAction);
  }

  public reassignAttachmentPoint(
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
  ) {
    assert(this.monomerCreationState);
    const action = new Action([
      new ReassignAttachmentPointOperation(
        this.monomerCreationState,
        currentName,
        newName,
      ),
    ]).perform(this.deps.getRender().ctab);
    this.deps.update(action);
  }

  public changeLeavingAtomLabel(
    name: AttachmentPointName,
    newLeavingAtomLabel: AtomLabel,
  ) {
    assert(this.monomerCreationState);
    const atomPair =
      this.monomerCreationState.assignedAttachmentPoints.get(name);
    assert(atomPair);
    const [, leavingAtomId] = atomPair;
    const leavingAtom = this.deps.getStruct().atoms.get(leavingAtomId);
    assert(leavingAtom);
    if (leavingAtom.label === newLeavingAtomLabel) return;
    const action = fromAtomsAttrs(
      this.deps.getRender().ctab,
      leavingAtomId,
      { label: newLeavingAtomLabel },
      false,
    );
    this.deps.update(action);
  }

  public removeAttachmentPoint(name: AttachmentPointName) {
    assert(this.monomerCreationState);
    const atomPair =
      this.monomerCreationState.assignedAttachmentPoints.get(name);
    assert(atomPair);
    const [attachmentAtomId] = atomPair;
    const potentialLeavingAtoms = new Set(
      this.findPotentialLeavingAtoms(attachmentAtomId).map((atom) => {
        const atomId = this.deps.getStruct().atoms.keyOf(atom);
        assert(atomId !== null);
        return atomId;
      }),
    );
    const action = new Action([
      new RemoveAttachmentPointOperation(
        this.monomerCreationState,
        name,
        potentialLeavingAtoms,
      ),
    ]).perform(this.deps.getRender().ctab);
    this.deps.update(action);
  }

  public cleanupCloseAttachmentPointEditPopup() {
    assert(this.monomerCreationState);
    this.monomerCreationState.clickedAttachmentPoint = null;
    this.deps.getRender().update(true);
  }

  public setProblematicAttachmentPoints(
    problematicPoints: Set<AttachmentPointName>,
  ) {
    assert(this.monomerCreationState);
    this.monomerCreationState.problematicAttachmentPoints = problematicPoints;
    this.monomerCreationState = { ...(this.monomerCreationState ?? {}) };
    this.deps.getRender().update(true);
  }

  public setProblematicAtoms(problematicAtoms: Set<number>) {
    if (!this.monomerCreationState) {
      KetcherLogger.error(
        'Can not set problematic atoms. There is no monomerCreationState',
      );
      return;
    }
    this.monomerCreationState.problematicAtoms = problematicAtoms;
    this.monomerCreationState = { ...(this.monomerCreationState ?? {}) };
    this.deps.getRender().update(true);
  }

  public highlightAttachmentPoint(name: AttachmentPointName | null) {
    if (!name) {
      this.deps.getRender().ctab.setSelection(null);
      return;
    }
    assert(this.monomerCreationState);
    const atomPair =
      this.monomerCreationState.assignedAttachmentPoints.get(name);
    assert(atomPair);
    let selection: Selection = { atoms: [...atomPair] };
    const [attachmentAtomId, leavingAtomId] = atomPair;
    const bondId = this.deps.getStruct().bonds.find((_, bond) => {
      return (
        (bond.begin === attachmentAtomId && bond.end === leavingAtomId) ||
        (bond.begin === leavingAtomId && bond.end === attachmentAtomId)
      );
    });
    if (bondId !== null) {
      selection = { ...selection, bonds: [bondId] };
    }
    this.deps.getRender().ctab.setSelection(selection);
  }

  public findPotentialLeavingAtoms(attachmentAtomId: number) {
    const bondsToOutside = this.deps.getStruct().bonds.filter((_, bond) => {
      return (
        (attachmentAtomId === bond.begin && attachmentAtomId !== bond.end) ||
        (attachmentAtomId === bond.end && attachmentAtomId !== bond.begin)
      );
    });
    const potentialLeavingAtoms: Atom[] = [];
    bondsToOutside.forEach((bond) => {
      if (!this.isBondSuitableForAttachmentPoint(bond)) return;
      const atomIdToUse =
        attachmentAtomId === bond.begin ? bond.end : bond.begin;
      const atom = this.deps.getStruct().atoms.get(atomIdToUse);
      assert(atom);
      if (atom.neighbors.length === 1) {
        potentialLeavingAtoms.push(atom);
      }
    });
    return potentialLeavingAtoms;
  }

  public closeMonomerCreationWizard(restoreOriginalStruct = false) {
    if (!this.isMonomerCreationWizardActive) {
      return;
    }

    if (!restoreOriginalStruct) this.deps.setDocumentTransitioning?.(true);

    this.deps.unsubscribeFromChangeEventInMonomerCreationWizard();

    this.deps.setHistoryStack(this.originalHistoryStack);
    this.deps.setHistoryPtr(this.originalHistoryPointer);

    if (restoreOriginalStruct) {
      this.deps.setStruct(this.originalStruct, false);
    }

    this.deps.setMonomerCreationStateNull();

    if (restoreOriginalStruct) this.deps.setDocumentTransitioning?.(false);
    this.deps.notifyDocumentChange?.('mode');

    this.deps.toolSelect();
  }
}
