import { type AmbiguousMonomerType, type MonomerItemType, type MonomerOrAmbiguousType, AttachmentPointName } from '../types';
import { Vec2 } from '../entities/vec2';
import { Command } from '../entities/Command';
import type { DrawingEntity } from '../entities/DrawingEntity';
import { PolymerBond } from '../entities/PolymerBond';
import { type KetFileMultitailArrowNode, type LinkerSequenceNode, type RNABase, type RxnArrowMode, BaseMonomer, Chem, MonomerSequenceNode, Phosphate, Struct, Sugar, UnsplitNucleotide } from '../entities';
import { SGroup } from '../entities/sgroup';
import type { BondCIP } from '../entities/types';
import { ChainsCollection } from '../entities/monomer-chains/ChainsCollection';
import { Nucleoside } from './Nucleoside';
import { Nucleotide } from './Nucleotide';
import { MACROMOLECULES_BOND_TYPES } from '../../application/editor/tools/types';
import { CanvasMatrix } from '../entities/canvas-matrix/CanvasMatrix';
import { Matrix } from '../entities/canvas-matrix/Matrix';
import { Cell } from '../entities/canvas-matrix/Cell';
import { AmbiguousMonomer } from '../entities/AmbiguousMonomer';
import type { IKetTemplateConnection } from '../../application/formatters/types/ket';
import { type AtomProperties, Atom } from '../entities/CoreAtom';
import { Bond } from '../entities/CoreBond';
import { MonomerToAtomBond } from '../entities/MonomerToAtomBond';
import { type CoreAtomLabel } from '../constants';
import { HydrogenBond } from '../entities/HydrogenBond';
import type { Chain } from '../entities/monomer-chains/Chain';
import { RxnArrow } from '../entities/CoreRxnArrow';
import { MultitailArrow } from '../entities/CoreMultitailArrow';
import type { KetFileNode } from '../serializers/serializers.types';
import { RxnPlus } from '../entities/CoreRxnPlus';
import type { initiallySelectedType } from '../entities/BaseMicromoleculeEntity';
import { CoreStereoFlag } from '../entities/CoreStereoFlag';
import type { StereoFlag as StereoFlagEnum } from '../entities/fragment';
import { SGroupDrawingEntity } from '../entities/SGroupDrawingEntity';
import type { IRnaPreset } from '../../application/editor/tools/Tool';
export declare const SNAKE_LAYOUT_Y_OFFSET_BETWEEN_CHAINS: number;
export declare const MONOMER_START_X_POSITION: number;
export declare const MONOMER_START_Y_POSITION: number;
type RnaPresetAdditionParams = {
    sugar: MonomerItemType;
    sugarPosition: Vec2;
    rnaBase: MonomerItemType | undefined;
    rnaBasePosition: Vec2 | undefined;
    phosphate: MonomerItemType | undefined;
    phosphatePosition: Vec2 | undefined;
    existingNode?: Nucleotide | Nucleoside | LinkerSequenceNode;
    connections?: IKetTemplateConnection[];
};
interface MonomerConnectedToSelection {
    monomerFromSelection: BaseMonomer;
    monomerConnectedToSelection: BaseMonomer;
    bond: PolymerBond;
}
export declare class DrawingEntitiesManager {
    monomers: Map<number, BaseMonomer>;
    polymerBonds: Map<number, PolymerBond | HydrogenBond>;
    private readonly bondsMonomersOverlaps;
    atoms: Map<number, Atom>;
    bonds: Map<number, Bond>;
    monomerToAtomBonds: Map<number, MonomerToAtomBond>;
    rxnArrows: Map<number, RxnArrow>;
    multitailArrows: Map<number, MultitailArrow>;
    rxnPluses: Map<number, RxnPlus>;
    stereoFlags: Map<number, CoreStereoFlag>;
    sgroups: Map<number, SGroupDrawingEntity>;
    micromoleculesHiddenEntities: Struct;
    canvasMatrix?: CanvasMatrix;
    snakeLayoutMatrix?: Matrix<Cell>;
    antisenseMonomerToSenseChain: Map<BaseMonomer, Chain>;
    private nextArrowId;
    private ensureArrowId;
    private resetArrowIdCounter;
    private static normalizeInitiallySelected;
    get bottomRightMonomerPosition(): Vec2;
    get bottomLeftMonomerPosition(): Vec2;
    get selectedEntitiesArr(): DrawingEntity[];
    get selectedEntities(): [number, DrawingEntity][];
    get selectedMonomers(): BaseMonomer[];
    get selectedMicromoleculeEntities(): DrawingEntity[];
    get externalConnectionsToSelection(): MonomerConnectedToSelection[];
    get allEntities(): [number, DrawingEntity][];
    get allEntitiesArray(): DrawingEntity[];
    get hasDrawingEntities(): boolean;
    get hasMonomers(): boolean;
    get allBondsToMonomers(): ([number, PolymerBond] | [number, MonomerToAtomBond])[];
    deleteSelectedEntities(): Command;
    deleteAllEntities(): Command;
    addMonomerChangeModel(monomerItem: MonomerOrAmbiguousType, position: Vec2, _monomer?: BaseMonomer): BaseMonomer | AmbiguousMonomer;
    createMonomer(monomerItem: MonomerOrAmbiguousType, position: Vec2, generateId?: boolean): Sugar | AmbiguousMonomer | Phosphate | RNABase | Chem | import("../entities").Peptide | UnsplitNucleotide | import("../entities").UnresolvedMonomer;
    updateMonomerItem(monomer: BaseMonomer, monomerItemNew: MonomerItemType): BaseMonomer;
    addMonomer(monomerItem: MonomerOrAmbiguousType, position: Vec2, _monomer?: BaseMonomer): Command;
    deleteDrawingEntity(drawingEntity: DrawingEntity, needToDeleteConnectedEntities?: boolean, force?: boolean): Command;
    selectDrawingEntity(drawingEntity: DrawingEntity): Command;
    private selectDrawingEntitiesModelChange;
    selectDrawingEntities(drawingEntities: DrawingEntity[]): Command;
    createDrawingEntitySelectionCommand(drawingEntity: DrawingEntity): Command;
    unselectAllDrawingEntities(): Command;
    unselectDrawingEntity(drawingEntity: DrawingEntity): Command;
    selectAllDrawingEntities(): Command;
    addDrawingEntitiesToSelection(drawingEntities: DrawingEntity[]): Command;
    moveDrawingEntityModelChange(drawingEntity: DrawingEntity, offset?: Vec2): DrawingEntity;
    private moveChemAtomsPoint;
    moveSelectedDrawingEntities(partOfMovementOffset: Vec2, fullMovementOffset?: Vec2): Command;
    rotateSelectedDrawingEntities(center: Vec2, angleInDegrees: number, isPartialRotation?: boolean): Command;
    flipSelectedDrawingEntities(flipDirection: 'horizontal' | 'vertical'): Command;
    getSelectedEntitiesBoundingBox(): import("../entities/structureBbox").StructureBbox | null;
    getSelectedEntitiesCenter(): Vec2 | null;
    createDrawingEntityMovingCommand(drawingEntity: DrawingEntity, partOfMovementOffset: Vec2, fullMovementOffset?: Vec2): Command;
    createDrawingEntityRedrawCommand(drawingEntityRedrawModelChange: () => DrawingEntity, invertDrawingEntityRedrawModelChange: () => DrawingEntity): Command;
    private deleteMonomerChangeModel;
    deleteMonomer(monomer: BaseMonomer, needToDeleteConnectedBonds?: boolean, force?: boolean): Command;
    modifyMonomerItem(monomer: BaseMonomer, monomerItemNew: MonomerItemType): Command;
    selectIfLocatedInRectangle(rectangleTopLeftPoint: Vec2, rectangleBottomRightPoint: Vec2, previousSelectedEntities: [number, DrawingEntity][], shiftKey?: boolean): Command;
    selectIfLocatedInPolygon(polygonPoints: Vec2[], previousSelectedEntities: [number, DrawingEntity][], shiftKey?: boolean): Command;
    /**
     * Syncs stereo flag selection with their associated monomers.
     * When a monomer is selected, its stereo flag should also be selected.
     */
    syncStereoFlagsSelectionWithMonomers(): Command;
    private checkBondSelectionForSequenceMode;
    startPolymerBondCreationChangeModel(firstMonomer: any, startPosition: any, endPosition: any, bondType?: MACROMOLECULES_BOND_TYPES, _polymerBond?: PolymerBond | HydrogenBond): HydrogenBond | PolymerBond;
    startPolymerBondCreation(firstMonomer: BaseMonomer, startPosition: Vec2, endPosition: Vec2, bondType: MACROMOLECULES_BOND_TYPES): {
        command: Command;
        polymerBond: any;
    };
    deletePolymerBondChangeModel(polymerBond: PolymerBond | HydrogenBond): void;
    deletePolymerBond(polymerBond: PolymerBond | HydrogenBond): Command;
    cancelPolymerBondCreation(polymerBond: PolymerBond, secondMonomer?: BaseMonomer): Command;
    movePolymerBond(polymerBond: PolymerBond, position?: Vec2): Command;
    finishPolymerBondCreationModelChange(firstMonomer: BaseMonomer, secondMonomer: BaseMonomer, firstMonomerAttachmentPoint: AttachmentPointName, secondMonomerAttachmentPoint: AttachmentPointName, bondType?: MACROMOLECULES_BOND_TYPES, _polymerBond?: PolymerBond): HydrogenBond | PolymerBond;
    finishPolymerBondCreation(polymerBond: PolymerBond, secondMonomer: BaseMonomer, firstMonomerAttachmentPoint: AttachmentPointName, secondMonomerAttachmentPoint: AttachmentPointName, bondType?: MACROMOLECULES_BOND_TYPES): Command;
    createPolymerBond(firstMonomer: BaseMonomer, secondMonomer: BaseMonomer, firstMonomerAttachmentPoint: AttachmentPointName, secondMonomerAttachmentPoint: AttachmentPointName, bondType?: MACROMOLECULES_BOND_TYPES): Command;
    intendToStartBondCreation(monomer: BaseMonomer): Command;
    intendToStartAttachmenPointBondCreation(monomer: BaseMonomer, attachmentPointName: AttachmentPointName): Command;
    intendToFinishBondCreation(monomer: BaseMonomer, bond: PolymerBond, shouldCalculateBonds: boolean): Command;
    intendToFinishAttachmenPointBondCreation(monomer: BaseMonomer, bond: PolymerBond, attachmentPointName: AttachmentPointName, shouldCalculateBonds: boolean): Command;
    cancelIntentionToFinishBondCreation(monomer: BaseMonomer, polymerBond?: PolymerBond): Command;
    intendToSelectDrawingEntity(drawingEntity: DrawingEntity): Command;
    intendToSelectAllConnectedDrawingEntities(startEntity: DrawingEntity): Command;
    cancelIntentionToSelectDrawingEntity(drawingEntity: DrawingEntity): Command;
    cancelIntentionToSelectAllConnectedDrawingEntities(startEntity: DrawingEntity): Command;
    showPolymerBondInformation(polymerBond: PolymerBond): Command;
    hidePolymerBondInformation(polymerBond: PolymerBond): Command;
    hideAllMonomersHoverAndAttachmentPoints(): Command;
    addRnaPresetFromNode: (node: Nucleotide | Nucleoside | LinkerSequenceNode, connections?: IKetTemplateConnection[]) => Command;
    private findGroupTemplateConnection;
    addRnaPreset({ sugar, sugarPosition: _sugarPosition, phosphate, phosphatePosition: _phosphatePosition, rnaBase, rnaBasePosition: _rnaBasePosition, connections, }: RnaPresetAdditionParams): {
        command: Command;
        monomers: BaseMonomer[];
    };
    rearrangeChainModelChange(monomer: BaseMonomer, newPosition: Vec2): BaseMonomer;
    private addRnaOperations;
    private recalculateCanvasMatrixModelChange;
    recalculateCanvasMatrix(chainsCollection?: ChainsCollection, previousSnakeLayoutMatrix?: Matrix<Cell>): Command;
    private calculateSnakeLayoutMatrix;
    private rearrangeSingleMonomerSnakeLayoutNode;
    private rearrangeSugarWithBaseSnakeLayoutNode;
    applySnakeLayout(isSnakeMode: boolean, needRedrawBonds?: boolean, needRepositionMonomers?: boolean, needRecalculateOldAntisense?: boolean, needRepositionMolecules?: boolean): Command;
    private redrawBondsModelChange;
    redrawBonds(): Command;
    isNucleosideAndPhosphateConnectedAsNucleotide(nucleoside: Nucleoside, phosphate: Phosphate): boolean;
    setMicromoleculesHiddenEntities(struct: Struct): void;
    clearMicromoleculesHiddenEntities(): void;
    mergeInto(targetDrawingEntitiesManager: DrawingEntitiesManager): {
        command: Command;
        mergedDrawingEntities: DrawingEntitiesManager;
    };
    filterSelection(): DrawingEntitiesManager;
    centerMacroStructure(): void;
    getCurrentCenterPointOfCanvas(): Vec2;
    getMacroStructureCenter(): Vec2;
    rerenderMolecules(): void;
    applyMonomersSequenceLayout(): ChainsCollection;
    clearCanvas(): void;
    applyFlexLayoutMode(needRedrawBonds?: boolean): Command;
    rerenderBondsOverlappedByMonomers(): void;
    getAllSelectedEntitiesForEntities(drawingEntities: DrawingEntity[]): {
        command: Command;
        drawingEntities: DrawingEntity[];
    };
    private getAllSelectedEntitiesForSGroup;
    getAllSelectedEntitiesForSingleEntity(drawingEntity: DrawingEntity, needToSelectConnectedBonds?: boolean, selectedDrawingEntities?: DrawingEntity[]): {
        command: Command;
        drawingEntities: DrawingEntity[];
    };
    validateIfApplicableForFasta(): boolean;
    moveMonomer(monomer: BaseMonomer, position: Vec2): Command;
    removeHoverForAllMonomers(): Command;
    private reconnectPolymerBondModelChange;
    reconnectPolymerBond(polymerBond: PolymerBond, newFirstMonomerAttachmentPoint: AttachmentPointName, newSecondMonomerAttachmentPoint: AttachmentPointName, initialFirstMonomerAttachmentPoint: AttachmentPointName, initialSecondMonomerAttachmentPoint: AttachmentPointName): Command;
    private addAmbiguousMonomerChangeModel;
    addAmbiguousMonomer(ambiguousMonomerItem: AmbiguousMonomerType, position: Vec2): Command;
    private addAtomChangeModel;
    addAtom(position: Vec2, monomer: BaseMonomer, atomIdInMicroMode: number, label: CoreAtomLabel, properties?: AtomProperties): Command;
    private deleteAtomChangeModel;
    private deleteAtom;
    private addBondChangeModel;
    addBond(firstAtom: Atom, secondAtom: Atom, type: number, stereo: number, bondIdInMicroMode: number, cip?: BondCIP | null): Command;
    private deleteBondChangeModel;
    private deleteBond;
    private addSGroupChangeModel;
    addSGroup(sgroup: SGroup, monomer: BaseMonomer, sgroupIdInMicroMode: number): Command;
    private deleteSGroupChangeModel;
    private deleteSGroup;
    addMonomerToAtomBondChangeModel(monomer: BaseMonomer, atom: Atom, attachmentPoint: AttachmentPointName, _monomerToAtomBond?: MonomerToAtomBond): MonomerToAtomBond;
    private deleteMonomerToAtomBondChangeModel;
    deleteMonomerToAtomBond(monomerAtomBond: MonomerToAtomBond): Command;
    addMonomerToAtomBond(monomer: BaseMonomer, atom: Atom, attachmentPoint: AttachmentPointName): Command;
    private static antisenseChainBasesMap;
    markMonomerAsAntisense(monomer: BaseMonomer): Command;
    markMonomerAsSense(monomer: BaseMonomer): Command;
    recalculateAntisenseChains(needRecalculateOldAntisense?: boolean): Command;
    get hasAntisenseChains(): boolean;
    static getAntisenseBaseLabel(rnaBaseMonomerOrLabel: RNABase | AmbiguousMonomer | string, isDnaAntisense: boolean): any;
    private static getAntisenseBaseLabelForNode;
    static createAntisenseNode(node: Nucleoside | Nucleotide | MonomerSequenceNode, isDnaAntisense: boolean): {
        modelChanges: Command;
        node: Nucleoside;
    } | undefined;
    createAntisenseChain(isDnaAntisense: boolean): Command;
    get monomersArray(): BaseMonomer[];
    get polymerBondsArray(): (HydrogenBond | PolymerBond)[];
    get molecules(): BaseMonomer[];
    private checkBondForOverlapsByMonomers;
    detectBondsOverlappedByMonomers(polymerBonds?: Array<PolymerBond | HydrogenBond>): void;
    private deleteRxnArrowModelChange;
    private addRxnArrowModelChange;
    addRxnArrow(type: RxnArrowMode, position: [Vec2, Vec2], height?: number, initiallySelected?: initiallySelectedType, arrowId?: number): Command;
    deleteRxnArrow(rxnArrow: RxnArrow): Command;
    private deleteMultitailArrowModelChange;
    private addMultitailArrowArrowModelChange;
    addMultitailArrow(multitailArrowKetNode: KetFileNode<KetFileMultitailArrowNode>, arrowId?: number): Command;
    deleteMultitailArrow(multitailArrow: MultitailArrow): Command;
    private deleteRxnPlusModelChange;
    private addRxnPlusModelChange;
    addRxnPlus(position: Vec2, initiallySelected?: initiallySelectedType): Command;
    deleteRxnPlus(rxnPlus: RxnPlus): Command;
    selectAllConnectedEntities(startEntity: DrawingEntity): Command;
    private visitAllConnectedEntities;
    getConnectedMolecule(startEntity: DrawingEntity, entitiesToReturn?: Array<typeof Atom | typeof Bond>): (Atom | Bond)[];
    createRotationHistoryCommand(initialPositions: Map<number, Vec2>): Command;
    private deleteStereoFlagModelChange;
    private addStereoFlagModelChange;
    addStereoFlag(position: Vec2, flagType: StereoFlagEnum, relatedMonomer: BaseMonomer): Command;
    deleteStereoFlag(stereoFlag: CoreStereoFlag): Command;
    /**
     * Gets the stereo flag associated with a monomer.
     * Note: Linear search is acceptable here as stereo flags are rare
     * (typically one per fragment with stereo atoms).
     */
    getStereoFlagForMonomer(monomer: BaseMonomer): CoreStereoFlag | undefined;
    /**
     * Replaces `oldMonomer` with a new monomer created from `newTemplate` at
     * the same canvas position, re-establishing all compatible polymer bonds.
     *
     * The entire operation (delete + add + reconnect) is wrapped in a single
     * `Command` so undo/redo treats it as one atomic step.
     *
     * Returns the command AND the newly added monomer so the caller can
     * continue to work with it (e.g. for layout adjustments).
     */
    replaceMonomer(oldMonomer: BaseMonomer, newTemplate: MonomerOrAmbiguousType): {
        command: Command;
        newMonomer: BaseMonomer;
    };
    /**
     * Replaces all components of the RNA preset that contains `oldSugar` with
     * components from `newPresetTemplate`, placing the sugar at `sugarPosition`.
     *
     * All external inter-preset bonds are re-established where compatible.
     * Internal intra-preset bonds are re-created by `addRnaPreset`.
     *
     * The entire operation is a single `Command` for atomic undo/redo.
     *
     * Returns the command AND the new sugar monomer.
     */
    replacePreset(oldSugar: BaseMonomer, newPresetTemplate: IRnaPreset, initialSugarPosition: Vec2, originalComponentsOverride?: BaseMonomer[]): {
        command: Command;
        newSugar?: BaseMonomer;
    };
    /**
     * Computes the canvas positions for the base and phosphate components of a
     * preset, given the sugar position.
     *
     * When the new preset has a left-side (5′) phosphate, `addRnaPreset` will
     * internally swap the sugar and phosphate Vec2 arguments so that:
     *   - the value passed as `_phosphatePosition` becomes the actual sugar position
     *   - the value passed as `_sugarPosition` becomes the actual phosphate position
     *
     * To keep the sugar anchored at `sugarPosition` after the swap we must pass
     * the phosphate offset in the **negative X** direction (to the left).  After
     * the swap the sugar lands at `sugarPosition` and the phosphate lands at
     * `sugarPosition − SnakeLayoutCellWidth` — matching the left-phosphate layout.
     *
     * For a right-side (3′) phosphate no swap occurs, so the phosphate is placed
     * at `sugarPosition + SnakeLayoutCellWidth` as before.
     */
    private computePresetPositions;
    /**
     * Given a bond record from the original preset and the arrays of original /
     * new components, finds the new preset component that should carry the
     * re-established bond.
     *
     * `bondToOriginalComponent` is a snapshot map built BEFORE any deletions
     * so we don't have to re-collect bonds from already-mutated monomers.
     */
    private findNewPresetComponentForBond;
}
export {};
