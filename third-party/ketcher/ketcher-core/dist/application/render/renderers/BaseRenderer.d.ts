import type { DrawingEntity } from '../../../domain/entities/DrawingEntity';
import type { D3SvgElementSelection } from '../../render/types';
import type { Vec2 } from '../../../domain/entities/vec2';
export interface IBaseRenderer {
    show(theme: any): void;
    remove(): void;
}
export declare abstract class BaseRenderer implements IBaseRenderer {
    drawingEntity: DrawingEntity;
    protected rootElement?: D3SvgElementSelection<SVGGElement, void>;
    bodyElement?: D3SvgElementSelection<SVGUseElement, this> | D3SvgElementSelection<SVGLineElement, this> | D3SvgElementSelection<SVGPathElement, this> | D3SvgElementSelection<SVGCircleElement, this>;
    protected hoverElement?: D3SvgElementSelection<SVGUseElement, void> | D3SvgElementSelection<SVGGElement, void> | D3SvgElementSelection<SVGCircleElement, void> | D3SvgElementSelection<SVGRectElement, void> | D3SvgElementSelection<SVGPathElement, void>;
    protected hoverAreaElement?: D3SvgElementSelection<SVGGElement, void> | D3SvgElementSelection<SVGPathElement, void> | D3SvgElementSelection<SVGRectElement, void> | D3SvgElementSelection<SVGLineElement, void>;
    protected hoverCircleAreaElement?: D3SvgElementSelection<SVGCircleElement, void>;
    protected canvasWrapper: D3SvgElementSelection<SVGSVGElement, void>;
    protected canvas: D3SvgElementSelection<SVGGElement, void>;
    protected constructor(drawingEntity: DrawingEntity);
    protected get editorSettings(): {
        microModeScale: number;
        macroModeScale: number;
    };
    get rootBBox(): DOMRect | undefined;
    get rootBoundingClientRect(): DOMRect | undefined;
    get width(): number;
    get height(): number;
    get x(): number;
    get y(): number;
    get selectionPoints(): Vec2[] | undefined;
    abstract show(theme: any, force?: boolean): void;
    abstract drawSelection(): void;
    abstract moveSelection(): void;
    protected abstract appendHover(hoverArea: any): D3SvgElementSelection<SVGGElement, void> | D3SvgElementSelection<SVGUseElement, void> | D3SvgElementSelection<SVGCircleElement, void> | D3SvgElementSelection<SVGRectElement, void> | D3SvgElementSelection<SVGPathElement, void> | void;
    protected abstract removeHover(): void;
    protected abstract appendHoverAreaElement(): void;
    remove(): void;
    redrawHover(): void;
    setVisibility(isVisible: boolean): void;
    move(): void;
}
