import { BaseRenderer } from '../../../render/renderers/internal';
import type { D3SvgElementSelection } from '../../../render/types';
import { Vec2 } from '../../../../domain/entities/vec2';
export declare class BaseSequenceRenderer extends BaseRenderer {
    protected appendHover(_hoverArea: any): D3SvgElementSelection<SVGUseElement, void> | void;
    protected appendHoverAreaElement(): void;
    drawSelection(): void;
    moveSelection(): void;
    protected removeHover(): void;
    show(_theme?: any): void;
    get center(): Vec2;
    get selectionPoints(): Vec2[];
}
