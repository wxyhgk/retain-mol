import type { D3SvgElementSelection } from '../../../render/types';
import type { IRnaPreset } from '../../../editor/tools/Tool';
import type { MonomerItemType } from '../../../../domain/types';
import { type BaseMonomer, Vec2 } from '../../../../domain/entities';
export type AutochainPreviewViewParams = {
    monomerOrRnaItem: MonomerItemType | IRnaPreset;
    position: Vec2;
    selectedMonomerToConnect?: BaseMonomer;
};
export declare class AutochainPreviewView {
    static readonly viewName = "AutochainPreviewView";
    private static showSingleMonomerPreview;
    private static showBondPreview;
    static show(transientLayer: D3SvgElementSelection<SVGGElement, void>, params: AutochainPreviewViewParams): void;
}
