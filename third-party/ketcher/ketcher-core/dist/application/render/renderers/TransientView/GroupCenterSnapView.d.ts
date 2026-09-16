import type { D3SvgElementSelection } from '../../../render/types';
import type { BaseMonomer } from '../../../../domain/entities/BaseMonomer';
import type { Vec2 } from '../../../../domain/entities/vec2';
export type GroupCenterSnapViewParams = {
    isVertical: boolean;
    absoluteSnapPosition: Vec2;
    monomerPair: [BaseMonomer, BaseMonomer];
};
export declare class GroupCentersnapView {
    static readonly viewName = "GroupCentersnapView";
    static show(transientLayer: D3SvgElementSelection<SVGGElement, void>, params: GroupCenterSnapViewParams): void;
}
