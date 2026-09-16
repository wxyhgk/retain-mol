import {
  assert,
  type Atom,
  Bond,
  type MonomerCreationState,
  OperationType,
  type Struct,
} from 'ketcher-core';

import type { ChangeEventData } from '../utils';

export interface IMonomerSubscriptionManager {
  subscribeToChangeEventInMonomerCreationWizard(): void;
  unsubscribeFromChangeEventInMonomerCreationWizard(): void;
}

type Deps = {
  isWizardActive: () => boolean;
  getMonomerCreationState: () => MonomerCreationState | null;
  refreshMonomerCreationState: () => void;
  getStruct: () => Struct;
  findPotentialLeavingAtoms: (atomId: number) => Atom[];
  removeAtomsAndBondsFromRnaComponents: (
    atomIds: number[],
    bondIds: number[],
  ) => void;
  canAssignRnaComponent: (bond: Bond) => boolean;
  autoAssignAtomToRnaComponent: (bondId: number) => void;
  subscribe: (
    eventName: string,
    handler: (data: ChangeEventData[]) => void,
  ) => { handler: unknown };
  unsubscribe: (eventName: string, subscriber: unknown) => void;
};

export class MonomerSubscriptionManager implements IMonomerSubscriptionManager {
  private changeEventSubscriber: {
    handler: ((action?: unknown) => void) | ((data: ChangeEventData[]) => void);
  } | null = null;

  private static readonly suitableAttachmentPointStereoTypes = new Set([
    Bond.PATTERN.STEREO.NONE,
    Bond.PATTERN.STEREO.UP,
    Bond.PATTERN.STEREO.DOWN,
  ]);

  private isBondSuitableForAttachmentPoint(bond: Bond): boolean {
    if (bond.type !== Bond.PATTERN.TYPE.SINGLE) return false;
    return MonomerSubscriptionManager.suitableAttachmentPointStereoTypes.has(
      bond.stereo,
    );
  }

  constructor(private deps: Deps) {}

  public subscribeToChangeEventInMonomerCreationWizard(): void {
    if (this.changeEventSubscriber) return;
    const handleChangeEvent = (data: ChangeEventData[]) => {
      if (!this.deps.isWizardActive() || data.length === 0) return;
      this.collectChangesForMonomerCreationStateInvalidation(data);
    };
    this.changeEventSubscriber = this.deps.subscribe(
      'change',
      handleChangeEvent,
    ) as never;
  }

  public unsubscribeFromChangeEventInMonomerCreationWizard(): void {
    if (this.changeEventSubscriber) {
      this.deps.unsubscribe('change', this.changeEventSubscriber);
      this.changeEventSubscriber = null;
    }
  }

  private collectChangesForMonomerCreationStateInvalidation(
    data: ChangeEventData[],
  ): void {
    if (!this.deps.getMonomerCreationState()) return;
    const changesMap = new Map<string, Set<number>>();
    data.forEach((entry) => {
      switch (entry.operation) {
        case OperationType.ATOM_ADD:
        case OperationType.ATOM_DELETE:
        case OperationType.ATOM_ATTR:
        case OperationType.BOND_ADD:
        case OperationType.BOND_DELETE:
        case OperationType.BOND_ATTR: {
          if (entry.id !== undefined) {
            const existing = changesMap.get(entry.operation);
            if (existing) existing.add(entry.id);
            else changesMap.set(entry.operation, new Set([entry.id]));
          }
          break;
        }
      }
    });
    this.invalidateMonomerCreationWizardState(changesMap);
  }

  private invalidateMonomerCreationWizardState(
    changesMap: Map<string, Set<number>>,
  ): void {
    const state = this.deps.getMonomerCreationState();
    if (!state) return;

    for (const [operation, ids] of changesMap.entries()) {
      switch (operation) {
        case OperationType.ATOM_DELETE: {
          const attachmentPointsToInvalidate = Array.from(
            state.assignedAttachmentPoints.entries(),
          ).filter(
            ([, atomPair]) => ids.has(atomPair[0]) || ids.has(atomPair[1]),
          );
          if (!attachmentPointsToInvalidate) {
            continue;
          }
          attachmentPointsToInvalidate.forEach(
            ([attachmentPointName, atomPair]) => {
              const [attachmentAtomId, leavingAtomId] = atomPair;
              if (ids.has(attachmentAtomId)) {
                state.assignedAttachmentPoints.delete(attachmentPointName);
              } else if (ids.has(leavingAtomId)) {
                const potentialLeavingAtoms =
                  this.deps.findPotentialLeavingAtoms(attachmentAtomId);
                if (potentialLeavingAtoms.length === 0) {
                  state.assignedAttachmentPoints.delete(attachmentPointName);
                } else {
                  const newLeavingAtomId = this.deps
                    .getStruct()
                    .atoms.keyOf(potentialLeavingAtoms[0]);
                  assert(newLeavingAtomId !== null);
                  state.assignedAttachmentPoints.set(attachmentPointName, [
                    attachmentAtomId,
                    newLeavingAtomId,
                  ]);
                }
              }
            },
          );

          const potentialAttachmentPointsToInvalidate = Array.from(
            state.potentialAttachmentPoints.entries(),
          );
          potentialAttachmentPointsToInvalidate.forEach(
            ([attachmentAtomId, leavingAtomIds]) => {
              if (ids.has(attachmentAtomId)) {
                state.potentialAttachmentPoints.delete(attachmentAtomId);
              } else {
                const updated = new Set(
                  Array.from(leavingAtomIds).filter((id) => !ids.has(id)),
                );
                if (updated.size === 0) {
                  state.potentialAttachmentPoints.delete(attachmentAtomId);
                } else {
                  state.potentialAttachmentPoints.set(
                    attachmentAtomId,
                    updated,
                  );
                }
              }
            },
          );

          this.deps.removeAtomsAndBondsFromRnaComponents([...ids.values()], []);
          break;
        }

        case OperationType.BOND_ATTR: {
          for (const id of ids.values()) {
            const bond = this.deps.getStruct().bonds.get(id);
            assert(bond);
            const attachmentPointWithBond = Array.from(
              state.assignedAttachmentPoints.entries(),
            ).find(([, atomPair]) => {
              return (
                (bond.begin === atomPair[0] && bond.end === atomPair[1]) ||
                (bond.begin === atomPair[1] && bond.end === atomPair[0])
              );
            });
            if (attachmentPointWithBond) {
              if (!this.isBondSuitableForAttachmentPoint(bond)) {
                state.problematicAttachmentPoints.add(
                  attachmentPointWithBond[0],
                );
              } else {
                state.problematicAttachmentPoints.delete(
                  attachmentPointWithBond[0],
                );
              }
            }
            if (!this.isBondSuitableForAttachmentPoint(bond)) {
              state.potentialAttachmentPoints.forEach(
                (leavingAtomIds, attachmentAtomId) => {
                  const updated = new Set(leavingAtomIds);
                  const bondFromAttachmentAtom =
                    bond.begin === attachmentAtomId &&
                    leavingAtomIds.has(bond.end);
                  const bondToAttachmentAtom =
                    bond.end === attachmentAtomId &&
                    leavingAtomIds.has(bond.begin);
                  if (bondFromAttachmentAtom || bondToAttachmentAtom) {
                    updated.delete(
                      bondFromAttachmentAtom ? bond.end : bond.begin,
                    );
                  }
                  if (updated.size === 0) {
                    state.potentialAttachmentPoints.delete(attachmentAtomId);
                  } else {
                    state.potentialAttachmentPoints.set(
                      attachmentAtomId,
                      updated,
                    );
                  }
                },
              );
            }
          }
          break;
        }

        case OperationType.BOND_ADD: {
          for (const id of ids.values()) {
            const bond = this.deps.getStruct().bonds.get(id);
            assert(bond);
            const attachmentPointWithBondToLeavingAtom = Array.from(
              state.assignedAttachmentPoints.entries(),
            ).find(([, [attachmentAtomId, leavingAtomId]]) => {
              return (
                (bond.begin === leavingAtomId &&
                  bond.end !== attachmentAtomId) ||
                (bond.end === leavingAtomId && bond.begin !== attachmentAtomId)
              );
            });
            if (attachmentPointWithBondToLeavingAtom) {
              const [attachmentPointName] =
                attachmentPointWithBondToLeavingAtom;
              state.assignedAttachmentPoints.delete(attachmentPointName);
            }
            if (this.isBondSuitableForAttachmentPoint(bond)) {
              if (state.potentialAttachmentPoints.has(bond.begin)) {
                const leavingAtomIds = state.potentialAttachmentPoints.get(
                  bond.begin,
                );
                assert(leavingAtomIds);
                const endAtom = this.deps.getStruct().atoms.get(bond.end);
                if (endAtom && endAtom.neighbors.length === 1) {
                  const updated = new Set(leavingAtomIds);
                  updated.add(bond.end);
                  state.potentialAttachmentPoints.set(bond.begin, updated);
                }
              }
              if (state.potentialAttachmentPoints.has(bond.end)) {
                const leavingAtomIds = state.potentialAttachmentPoints.get(
                  bond.end,
                );
                assert(leavingAtomIds);
                const beginAtom = this.deps.getStruct().atoms.get(bond.begin);
                if (beginAtom && beginAtom.neighbors.length === 1) {
                  const updated = new Set(leavingAtomIds);
                  updated.add(bond.begin);
                  state.potentialAttachmentPoints.set(bond.end, updated);
                }
              }
            }
            if (this.deps.canAssignRnaComponent(bond)) {
              this.deps.autoAssignAtomToRnaComponent(id);
            }
          }
          break;
        }

        case OperationType.BOND_DELETE: {
          this.deps.removeAtomsAndBondsFromRnaComponents([], [...ids.values()]);
          break;
        }

        default:
          break;
      }
    }

    this.deps.refreshMonomerCreationState();
  }
}
