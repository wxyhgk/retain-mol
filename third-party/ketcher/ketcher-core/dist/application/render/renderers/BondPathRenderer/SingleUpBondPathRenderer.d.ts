import { type SVGPathAttributes, type BondVectors } from '../../../render/renderers/BondPathRenderer/constants';
import type { ViewModel } from '../../../render/view-model/ViewModel';
declare class SingleUpBondPathRenderer {
    static preparePaths(bondVectors: BondVectors, viewModel: ViewModel): SVGPathAttributes[];
}
export default SingleUpBondPathRenderer;
