import {
  type ComponentStructureUpdateData,
  type MonomerCreationState,
  type RnaPresetComponentKey,
  type Atom,
  type Bond,
  KetcherLogger,
  MonomerCreationComponentStructureUpdateEvent,
  type Struct,
} from 'ketcher-core';
import { isNumber } from 'lodash';

export interface IRnaPresetManager {
  getRnaComponentForAtom(atomId: number): RnaPresetComponentKey | null;
  canAssignRnaComponent(bond: Bond): boolean;
  autoAssignAtomToRnaComponent(bondId: number): void;
  updateRnaComponentStructureState(
    componentKey: RnaPresetComponentKey,
    updatedAtoms: number[],
    updatedBonds: number[],
  ): void;
  addAtomsAndBondsToRnaComponent(
    componentKey: RnaPresetComponentKey,
    atomIds: number[],
    bondIds: number[],
  ): void;
  removeAtomsAndBondsFromRnaComponents(
    atomIds: number[],
    bondIds: number[],
  ): void;
  setRnaMonomerCreationMode(isActive: boolean): void;
}

type Deps = {
  getMonomerCreationState: () => MonomerCreationState | null;
  getStruct: () => Struct;
  getOriginalStruct: () => Struct;
  getSelectedToOriginalAtomsIdMap: () => Map<number, number>;
};

export class RnaPresetManager implements IRnaPresetManager {
  constructor(private deps: Deps) {}

  getRnaComponentForAtom(atomId: number): RnaPresetComponentKey | null {
    const rnaComponentAtoms =
      this.deps.getMonomerCreationState()?.rnaComponentAtoms;

    if (!rnaComponentAtoms) {
      return null;
    }

    for (const [componentKey, componentData] of rnaComponentAtoms.entries()) {
      if (componentData.atoms.includes(atomId)) {
        return componentKey;
      }
    }

    return null;
  }

  canAssignRnaComponent(bond: Bond): boolean {
    if (!this.deps.getMonomerCreationState()?.rnaComponentAtoms) {
      return false;
    }

    const beginAtomRnaComponent = this.getRnaComponentForAtom(bond.begin);
    const endAtomRnaComponent = this.getRnaComponentForAtom(bond.end);

    if (
      (!beginAtomRnaComponent && !endAtomRnaComponent) ||
      (beginAtomRnaComponent &&
        endAtomRnaComponent &&
        beginAtomRnaComponent !== endAtomRnaComponent)
    ) {
      return false;
    }

    const rnaComponentToAssign = beginAtomRnaComponent ?? endAtomRnaComponent;
    const struct = this.deps.getStruct();
    const atomIdToStartFrom = beginAtomRnaComponent ? bond.end : bond.begin;
    const visitedAtomIds = new Set<number>();
    const atomsToCheck = [atomIdToStartFrom];
    let hasConnectionToAnotherComponent = false;
    let hasConnectionToOriginalStructure = false;

    visitedAtomIds.add(atomIdToStartFrom);

    while (atomsToCheck.length > 0) {
      const currentAtomId = atomsToCheck.pop();
      const currentAtom = isNumber(currentAtomId)
        ? struct.atoms.get(currentAtomId)
        : undefined;

      if (!currentAtom) {
        continue;
      }

      currentAtom?.neighbors.forEach((neighbor) => {
        const halfBond = struct.halfBonds.get(neighbor);

        if (
          hasConnectionToAnotherComponent ||
          hasConnectionToOriginalStructure
        ) {
          return;
        }

        if (!halfBond) {
          KetcherLogger.warn('Half-bond not found in structure');
          return;
        }

        const neighborAtomId =
          halfBond.begin === currentAtomId ? halfBond.end : halfBond.begin;

        if (visitedAtomIds.has(neighborAtomId)) {
          return;
        }

        visitedAtomIds.add(neighborAtomId);

        const neighborAtomRnaComponent =
          this.getRnaComponentForAtom(neighborAtomId);

        if (neighborAtomRnaComponent === rnaComponentToAssign) {
          return;
        }

        if (
          neighborAtomRnaComponent &&
          neighborAtomRnaComponent !== rnaComponentToAssign
        ) {
          hasConnectionToAnotherComponent = true;
          return;
        }

        const originalAtomId = this.deps
          .getSelectedToOriginalAtomsIdMap()
          .get(neighborAtomId);

        if (
          isNumber(originalAtomId) &&
          this.deps.getOriginalStruct().atoms.has(originalAtomId)
        ) {
          hasConnectionToOriginalStructure = true;
          return;
        }

        atomsToCheck.push(neighborAtomId);
        visitedAtomIds.add(neighborAtomId);
      });
    }

    if (hasConnectionToAnotherComponent || hasConnectionToOriginalStructure) {
      return false;
    }

    return true;
  }

  autoAssignAtomToRnaComponent(bondId: number): void {
    const rnaComponentAtoms =
      this.deps.getMonomerCreationState()?.rnaComponentAtoms;

    if (!rnaComponentAtoms) {
      return;
    }

    const struct = this.deps.getStruct();
    const bond = struct.bonds.get(bondId);

    if (!bond) {
      KetcherLogger.warn('Bond not found in structure');
      return;
    }

    const beginAtomComponent = this.getRnaComponentForAtom(bond.begin);
    const endAtomComponent = this.getRnaComponentForAtom(bond.end);
    const componentToMark = beginAtomComponent ?? endAtomComponent;

    if (!componentToMark) {
      return;
    }

    const atomsIdsToMark: number[] = [];
    const bondIdsToMark: number[] = [];
    const bondIdsToCheck = [bondId];
    const visitedBonds = new Set<number>();

    while (bondIdsToCheck.length > 0) {
      const currentBondId = bondIdsToCheck.pop();
      const currentBond = isNumber(currentBondId)
        ? struct.bonds.get(currentBondId)
        : undefined;

      if (
        !isNumber(currentBondId) ||
        !currentBond ||
        visitedBonds.has(currentBondId)
      ) {
        continue;
      }

      bondIdsToMark.push(currentBondId);
      visitedBonds.add(currentBondId);

      const beginAtom = struct.atoms.get(currentBond.begin);
      const endAtom = struct.atoms.get(currentBond.end);
      const beginAtomRnaComponent = this.getRnaComponentForAtom(
        currentBond.begin,
      );
      const endAtomRnaComponent = this.getRnaComponentForAtom(currentBond.end);
      const atomsToContinue: Atom[] = [];

      if (beginAtom && beginAtomRnaComponent !== componentToMark) {
        atomsIdsToMark.push(currentBond.begin);
        atomsToContinue.push(beginAtom);
      }

      if (endAtom && endAtomRnaComponent !== componentToMark) {
        atomsIdsToMark.push(currentBond.end);
        atomsToContinue.push(endAtom);
      }

      atomsToContinue.forEach((atom) => {
        atom.neighbors.forEach((halfBondId) => {
          const halfBond = struct.halfBonds.get(halfBondId);

          if (!halfBond) {
            KetcherLogger.warn('Half-bond not found in structure');
            return;
          }

          const nextBondId = halfBond.bid;
          const nextBond = struct.bonds.get(nextBondId);

          if (!nextBond || bondIdsToCheck.includes(nextBondId)) {
            KetcherLogger.warn('Bond not found in structure');
            return;
          }

          bondIdsToCheck.push(nextBondId);
        });
      });
    }

    this.addAtomsAndBondsToRnaComponent(
      componentToMark,
      atomsIdsToMark,
      bondIdsToMark,
    );
  }

  updateRnaComponentStructureState(
    componentKey: RnaPresetComponentKey,
    updatedAtoms: number[],
    updatedBonds: number[],
  ): void {
    this.deps.getMonomerCreationState()?.rnaComponentAtoms?.set(componentKey, {
      atoms: updatedAtoms,
      bonds: updatedBonds,
    });

    const eventData: ComponentStructureUpdateData = {
      componentKey,
      atomIds: updatedAtoms,
      bondIds: updatedBonds,
    };
    window.dispatchEvent(
      new CustomEvent(MonomerCreationComponentStructureUpdateEvent, {
        detail: eventData,
      }),
    );
  }

  addAtomsAndBondsToRnaComponent(
    componentKey: RnaPresetComponentKey,
    atomIds: number[],
    bondIds: number[],
  ): void {
    const componentData = this.deps
      .getMonomerCreationState()
      ?.rnaComponentAtoms?.get(componentKey);
    if (!componentData) {
      return;
    }

    const updatedAtoms = [...componentData.atoms];
    const updatedBonds = [...componentData.bonds];

    atomIds.forEach((atomId) => {
      if (!updatedAtoms.includes(atomId)) {
        updatedAtoms.push(atomId);
      }
    });

    bondIds.forEach((bondId) => {
      if (!updatedBonds.includes(bondId)) {
        updatedBonds.push(bondId);
      }
    });

    this.updateRnaComponentStructureState(
      componentKey,
      updatedAtoms,
      updatedBonds,
    );
  }

  removeAtomsAndBondsFromRnaComponents(
    atomIds: number[],
    bondIds: number[],
  ): void {
    const rnaComponentAtoms =
      this.deps.getMonomerCreationState()?.rnaComponentAtoms;
    if (!rnaComponentAtoms) {
      return;
    }

    for (const [componentKey, componentData] of rnaComponentAtoms.entries()) {
      const updatedAtoms = componentData.atoms.filter(
        (atomId) => !atomIds.includes(atomId),
      );
      const updatedBonds = componentData.bonds.filter(
        (bondId) => !bondIds.includes(bondId),
      );

      this.updateRnaComponentStructureState(
        componentKey,
        updatedAtoms,
        updatedBonds,
      );
    }
  }

  setRnaMonomerCreationMode(isActive: boolean): void {
    const state = this.deps.getMonomerCreationState();
    if (!state) {
      KetcherLogger.warn('Monomer creation state is not initialized');
      return;
    }

    state.isRnaPresetMode = isActive;
  }
}
