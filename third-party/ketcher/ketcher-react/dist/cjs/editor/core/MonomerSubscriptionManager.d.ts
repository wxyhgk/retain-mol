import { type Atom, Bond, type MonomerCreationState, type Struct } from 'ketcher-core';
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
    removeAtomsAndBondsFromRnaComponents: (atomIds: number[], bondIds: number[]) => void;
    canAssignRnaComponent: (bond: Bond) => boolean;
    autoAssignAtomToRnaComponent: (bondId: number) => void;
    subscribe: (eventName: string, handler: (data: ChangeEventData[]) => void) => {
        handler: unknown;
    };
    unsubscribe: (eventName: string, subscriber: unknown) => void;
};
export declare class MonomerSubscriptionManager implements IMonomerSubscriptionManager {
    private deps;
    private changeEventSubscriber;
    private static readonly suitableAttachmentPointStereoTypes;
    private isBondSuitableForAttachmentPoint;
    constructor(deps: Deps);
    subscribeToChangeEventInMonomerCreationWizard(): void;
    unsubscribeFromChangeEventInMonomerCreationWizard(): void;
    private collectChangesForMonomerCreationStateInvalidation;
    private invalidateMonomerCreationWizardState;
}
export {};
