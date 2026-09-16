import type { D3SvgElementSelection } from '../../../render/types';
/**
 * This class handles all mouse events for sequence
 * so we don't have to add handlers to each sequence item individually.
 */
export declare class SequenceEventDelegationManager {
    private static _instance;
    private canvas;
    private readonly boundHandlers;
    static get instance(): SequenceEventDelegationManager;
    attachDelegatedEvents(canvas: D3SvgElementSelection<SVGGElement, void>): void;
    removeDelegatedEvents(): void;
    private attachHandler;
    private findSequenceItemRenderer;
    private getElementType;
    private handleMouseOver;
    private handleMouseMove;
    private handleMouseOut;
    private handleMouseDown;
    private handleClick;
    private handleDblClick;
}
