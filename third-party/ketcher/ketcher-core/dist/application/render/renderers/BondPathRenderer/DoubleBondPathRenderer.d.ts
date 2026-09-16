import { type SVGPathAttributes, type BondVectors } from '../../../render/renderers/BondPathRenderer/constants';
import { BondType } from '../../../../domain/entities/CoreBond';
declare class DoubleBondPathRenderer {
    static preparePaths(bondVectors: BondVectors, shift: number, type?: BondType): SVGPathAttributes[];
}
export default DoubleBondPathRenderer;
