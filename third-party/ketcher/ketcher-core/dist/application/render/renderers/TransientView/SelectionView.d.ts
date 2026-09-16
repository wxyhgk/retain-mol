import type { D3SvgElementSelection } from '../../../render/types';
export type SelectionRectangleViewParams = {
    type: 'rectangle';
    start: [x: number, y: number];
    width: number;
    height: number;
};
export type SelectionLassoViewParams = {
    type: 'lasso';
    path: [x: number, y: number][];
};
export type SelectionViewParams = SelectionRectangleViewParams | SelectionLassoViewParams;
export declare class SelectionView {
    static show(transientLayer: D3SvgElementSelection<SVGGElement, void>, params: SelectionViewParams): void;
    static readonly viewName = "SelectionView";
}
