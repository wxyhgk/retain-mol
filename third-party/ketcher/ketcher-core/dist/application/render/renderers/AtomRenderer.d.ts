import { BaseRenderer } from '../../render/renderers/BaseRenderer';
import { type Atom } from '../../../domain/entities/CoreAtom';
import { Vec2 } from '../../../domain/entities/vec2';
export type AtomHoverContour = {
    type: 'circle';
    center: Vec2;
    radius: number;
} | {
    type: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
};
export declare class AtomRenderer extends BaseRenderer {
    atom: Atom;
    private selectionElement?;
    private textElement?;
    private radicalElement?;
    private cipLabelElement?;
    private stereoLabelElement?;
    private badValenceElement?;
    private cipLabelElementBBox?;
    private cipTextElementBBox?;
    private stereoLabelElementBBox?;
    private stereoTextElementBBox?;
    constructor(atom: Atom);
    get scaledPosition(): Vec2;
    get center(): Vec2;
    private appendRootElement;
    private appendBody;
    private appendSelectionContour;
    getHoverContour(): AtomHoverContour;
    /**
     * Updates the width and height of the SelectionContour
     */
    private updateSelectionContour;
    protected appendHover(): any;
    /**
     * Override redrawHover to handle AtomRenderer's opacity-based hover visibility.
     * AtomRenderer creates hover elements hidden (opacity 0) and toggles visibility
     * via showHover/hideHover, unlike other renderers that add/remove elements.
     * When the model layer turns on hover (e.g., Fragment selection tool), we need
     * to explicitly show the hover element after it's created/returned by appendHover.
     */
    redrawHover(): void;
    showHover(): void;
    hideHover(): void;
    private get shouldHydrogenBeOnLeft();
    get labelText(): string;
    /** True when the atom's label is a generic / pseudo query atom (e.g. A, Q, M, X, *). */
    get isGenericLabel(): boolean;
    private get isHydrogenLabel();
    /** The label text shown on canvas — truncated to MAX_LABEL_LENGTH if necessary. */
    get displayLabelText(): string;
    /** When the label is truncated, this holds the full text for use as a tooltip. */
    get labelTooltipText(): string | null;
    private get isAtomTerminal();
    get isLabelVisible(): boolean;
    get labelLength(): number;
    private get labelColor();
    get labelBBoxes(): DOMRect[];
    get labelBoundingBox(): DOMRect | undefined;
    get shouldDisplayHydrogen(): boolean;
    private appendLabel;
    private removeLabel;
    redrawLabel(): void;
    appendSelection(): void;
    removeSelection(): void;
    drawSelection(): void;
    moveSelection(): void;
    private appendCharge;
    private appendRadical;
    private appendExplicitValence;
    private appendExplicitIsotope;
    private appendAtomProperties;
    private appendBadValenceWarning;
    show(): void;
    private appendCIPLabel;
    private positionCIPLabel;
    private bisectLargestSector;
    private getStereoLabelColor;
    private shouldDisplayStereoLabel;
    private getEnhancedStereoFlag;
    private appendStereoLabel;
    private positionStereoLabel;
    private getProjectedLabelDistance;
    private getLabelProjectionRadius;
    move(): void;
    remove(): void;
    setVisibility(isVisible: boolean): void;
    protected appendHoverAreaElement(): void;
    protected removeHover(): void;
}
