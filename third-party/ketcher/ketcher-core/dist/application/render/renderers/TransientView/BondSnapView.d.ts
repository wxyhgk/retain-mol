import type { D3SvgElementSelection } from '../../../render/types';
import type { PolymerBond } from '../../../../domain/entities/PolymerBond';
export declare class BondSnapView {
    static readonly viewName = "BondSnapView";
    static show<P extends PolymerBond>(transientLayer: D3SvgElementSelection<SVGGElement, void>, bond: P): void;
}
