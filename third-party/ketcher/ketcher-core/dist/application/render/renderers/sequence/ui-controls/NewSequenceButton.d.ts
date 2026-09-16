import type { D3SvgElementSelection } from '../../../../render/types';
export declare class NewSequenceButton {
    private readonly indexOfRowBefore;
    private buttonElement?;
    private readonly canvas;
    private rootElement?;
    private bodyElement?;
    constructor(indexOfRowBefore: number);
    show(): void;
    static appendPlusIcon(element: D3SvgElementSelection<SVGElement, void>): void;
    protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void;
    protected appendHoverAreaElement(): void;
    drawSelection(): void;
    moveSelection(): void;
    protected removeHover(): void;
    remove(): void;
    setWidth(width: number): void;
}
