import type { FlexModePolymerBondRenderer } from '../../application/render/renderers/PolymerBondRenderer/FlexModePolymerBondRenderer';
import type { SnakeModePolymerBondRenderer } from '../../application/render/renderers/PolymerBondRenderer/SnakeModePolymerBondRenderer';
import type { BackBoneBondSequenceRenderer } from '../../application/render/renderers/sequence/BackBoneBondSequenceRenderer';
import type { PolymerBondSequenceRenderer } from '../../application/render/renderers/sequence/PolymerBondSequenceRenderer';
import { AttachmentPointName } from '../types';
import type { BaseMonomer } from './BaseMonomer';
import { BaseBond } from '../entities/BaseBond';
export type FlexOrSequenceOrSnakeModePolymerBondRenderer = BackBoneBondSequenceRenderer | FlexModePolymerBondRenderer | PolymerBondSequenceRenderer | SnakeModePolymerBondRenderer;
export declare class PolymerBond extends BaseBond {
    firstMonomer: BaseMonomer;
    secondMonomer?: BaseMonomer;
    renderer?: FlexOrSequenceOrSnakeModePolymerBondRenderer;
    hasAntisenseInRow?: boolean;
    nextRowPositionX?: number;
    constructor(firstMonomer: BaseMonomer, secondMonomer?: BaseMonomer);
    setFirstMonomer(monomer: BaseMonomer): void;
    setSecondMonomer(monomer: BaseMonomer): void;
    setRenderer(renderer: FlexOrSequenceOrSnakeModePolymerBondRenderer): void;
    static get backBoneChainAttachmentPoints(): AttachmentPointName[];
    get isBackBoneChainConnection(): boolean;
    get firstMonomerAttachmentPoint(): AttachmentPointName | undefined;
    get secondMonomerAttachmentPoint(): AttachmentPointName | undefined;
    get isSideChainConnection(): boolean;
    get firstEndEntity(): BaseMonomer;
    get secondEndEntity(): BaseMonomer | undefined;
    getAnotherMonomer(monomer: BaseMonomer): BaseMonomer | undefined;
    get isHorizontal(): boolean;
    get isVertical(): boolean;
}
