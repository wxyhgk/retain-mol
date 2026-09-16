import { type SVGPathAttributes, type BondVectors } from '../../../render/renderers/BondPathRenderer/constants';
import { BondType } from '../../../../domain/entities/CoreBond';
declare class SingleBondPathRenderer {
    static preparePaths(bondVectors: BondVectors, type?: BondType): SVGPathAttributes[];
}
export default SingleBondPathRenderer;
