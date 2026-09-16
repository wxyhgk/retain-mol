import type { D3SvgElementSelection } from '../../../render/types';
import type { BaseMonomer } from '../../../../domain/entities/BaseMonomer';
import type { MonomersAlignment } from '../../../editor/tools/types';
export type DistanceSnapViewParams = {
    alignment: MonomersAlignment | undefined;
    alignedMonomers: BaseMonomer[] | undefined;
};
export declare class DistanceSnapView {
    static readonly viewName = "DistanceSnapView";
    static show(transientLayer: D3SvgElementSelection<SVGGElement, void>, params: DistanceSnapViewParams): void;
}
