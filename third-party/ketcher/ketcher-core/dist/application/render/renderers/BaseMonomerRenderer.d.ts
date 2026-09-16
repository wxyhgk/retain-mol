import type { D3SvgElementSelection } from '../../render/types';
import { AttachmentPoint } from '../../../domain/AttachmentPoint';
import type { BaseMonomer } from '../../../domain/entities/BaseMonomer';
import { Vec2 } from '../../../domain/entities/vec2';
import type { AttachmentPointConstructorParams, AttachmentPointName } from '../../../domain/types';
import { BaseRenderer } from './BaseRenderer';
import { type HighlightPathData } from '../../render/renderers/monomerHighlightShapes';
export declare const MONOMER_CSS_CLASS = "monomer";
export declare abstract class BaseMonomerRenderer extends BaseRenderer {
    monomer: BaseMonomer;
    private readonly monomerHoveredElementId;
    monomerSymbolElementId: string;
    monomerAutochainPreviewElementId: string;
    private readonly scale?;
    private readonly editor;
    private get editorEvents();
    private selectionCircle?;
    private selectionBorder?;
    bodyElement?: D3SvgElementSelection<SVGUseElement, this>;
    private freeSectorsList;
    private attachmentPoints;
    private hoveredAttachmentPoint;
    private _dragTargetAttachmentPoint;
    private _dragCircleHoverAttachmentPoint;
    private readonly monomerSymbolElement?;
    readonly monomerSize: {
        width: number;
        height: number;
    };
    private enumerationElement?;
    enumeration: number | null;
    private terminalIndicatorElement?;
    CHAIN_START_TERMINAL_INDICATOR_TEXT: string;
    CHAIN_END_TERMINAL_INDICATOR_TEXT: string;
    static isSelectable(): boolean;
    static get selectionCircleRadius(): number;
    protected constructor(monomer: BaseMonomer, monomerHoveredElementId: string, monomerSymbolElementId: string, monomerAutochainPreviewElementId: string, scale?: number | undefined);
    private isSnakeBondForAttachmentPoint;
    static get monomerSize(): {
        width: number;
        height: number;
    };
    get center(): Vec2;
    /**
     * The path that outlines this monomer's replacement-highlight area.
     *
     * The default is a rectangle matching the monomer body; renderers with a
     * different body shape (e.g. phosphates, RNA bases) override this. The
     * optional offset lets transient views request an inflated path while keeping
     * the body-shape knowledge inside the renderer.
     */
    getHighlightPath(offset?: number): HighlightPathData;
    get textColor(): any;
    protected getMonomerColor(theme: any): any;
    protected getPeptideColor(theme: any): any;
    redrawAttachmentPoints(): void;
    updateAttachmentPoints(): void;
    redrawAttachmentPointsCoordinates(): void;
    drawAttachmentPoints(appendFn?: (apName: AttachmentPointName, customAngle?: number) => Pick<AttachmentPoint, 'getAngle'>): void;
    protected prepareAttachmentPointsParams(attachmentPointName: AttachmentPointName, customAngle?: number): AttachmentPointConstructorParams;
    appendAttachmentPoint(attachmentPointName: AttachmentPointName, customAngle?: number): AttachmentPoint;
    removeAttachmentPoints(): void;
    hoverAttachmentPoint(attachmentPointName: AttachmentPointName): void;
    setDragTargetAttachmentPoint(attachmentPointName: AttachmentPointName | null): void;
    setDragCircleHoverAttachmentPoint(attachmentPointName: AttachmentPointName | null): void;
    protected raiseAttachmentPoints(): void;
    protected appendRootElement(canvas: D3SvgElementSelection<SVGSVGElement, void> | D3SvgElementSelection<SVGGElement, void>): D3SvgElementSelection<SVGGElement, void>;
    protected appendLabel(rootElement: D3SvgElementSelection<SVGGElement, void>): void;
    setLabelVisibility(isVisible: boolean): void;
    appendHover(hoverAreaElement: D3SvgElementSelection<SVGGElement, void>): import("d3-selection").Selection<SVGUseElement, void, HTMLElement, never>;
    removeHover(): void;
    static getScaledMonomerPosition(positionInAngstoms: Vec2, monomerSize?: {
        width: number;
        height: number;
    }): Vec2;
    get scaledMonomerPosition(): Vec2;
    get scaledPosition(): Vec2;
    appendSelection(): void;
    removeSelection(): void;
    protected abstract appendBody(rootElement: D3SvgElementSelection<SVGGElement, void>, theme?: any): any;
    protected appendHoverAreaElement(): void;
    private appendEvents;
    abstract get enumerationElementPosition(): {
        x: number;
        y: number;
    } | void;
    abstract get beginningElementPosition(): {
        x: number;
        y: number;
    } | void;
    setEnumeration(enumeration: number | null): void;
    protected appendEnumeration(): void;
    redrawEnumeration(needToDrawTerminalIndicator: boolean): void;
    redrawChainTerminalIndicator(needToDraw: boolean): void;
    protected abstract get modificationConfig(): any;
    protected drawModification(): void;
    show(theme?: any): void;
    drawSelection(): void;
    private raiseElement;
    moveSelection(): void;
    move(): void;
    remove(): void;
}
