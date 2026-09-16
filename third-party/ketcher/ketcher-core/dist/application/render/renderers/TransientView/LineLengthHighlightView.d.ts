import type { D3SvgElementSelection } from '../../../render/types';
export type LineLengthHighlightViewParams = {
    currentPosition: number;
};
export declare class LineLengthHighlightView {
    static readonly viewName = "LineLengthHighlightView";
    static show(transientLayer: D3SvgElementSelection<SVGGElement, void>, params: LineLengthHighlightViewParams): void;
}
