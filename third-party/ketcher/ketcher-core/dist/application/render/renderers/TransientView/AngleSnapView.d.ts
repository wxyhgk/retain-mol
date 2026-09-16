import type { D3SvgElementSelection } from '../../../render/types';
import type { BaseMonomer } from '../../../../domain/entities/BaseMonomer';
import { HydrogenBond } from '../../../../domain/entities/HydrogenBond';
import type { PolymerBond } from '../../../../domain/entities/PolymerBond';
import { TransientView } from './TransientView';
export type AngleSnapViewParams = {
    connectedMonomer: BaseMonomer;
    polymerBond: PolymerBond | HydrogenBond;
    isBondLengthSnapped: boolean;
};
export declare class AngleSnapView extends TransientView {
    static readonly viewName = "AngleSnapView";
    static show(transientLayer: D3SvgElementSelection<SVGGElement, void>, params: AngleSnapViewParams): void;
}
