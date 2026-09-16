import type { D3SvgElementSelection } from '../../../render/types';
import type { BaseMonomer } from '../../../../domain/entities';
export type ModifyAminoAcidsViewParams = {
    monomersToModify: BaseMonomer[];
};
export declare class ModifyAminoAcidsView {
    static readonly viewName = "ModifyAminoAcidsView";
    static show(transientLayer: D3SvgElementSelection<SVGGElement, void>, params: ModifyAminoAcidsViewParams): void;
}
