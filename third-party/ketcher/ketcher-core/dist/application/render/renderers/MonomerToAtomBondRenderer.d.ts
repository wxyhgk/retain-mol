import { BaseRenderer } from '../../render/renderers/BaseRenderer';
import type { D3SvgElementSelection } from '../../render/types';
import type { MonomerToAtomBond } from '../../../domain/entities/MonomerToAtomBond';
export declare class MonomerToAtomBondRenderer extends BaseRenderer {
    monomerToAtomBond: MonomerToAtomBond;
    private selectionElement;
    constructor(monomerToAtomBond: MonomerToAtomBond);
    private get scaledPosition();
    show(): void;
    protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void;
    protected appendHoverAreaElement(): void;
    drawSelection(): void;
    appendSelection(): void;
    removeSelection(): void;
    move(): void;
    protected removeHover(): void;
    moveSelection(): void;
}
