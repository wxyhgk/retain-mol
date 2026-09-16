import { TransientView } from '../../../render/renderers/TransientView/TransientView';
import type { D3SvgElementSelection } from '../../../render/types';
import type { BaseMonomer } from '../../../../domain/entities/BaseMonomer';
export type ReplacementHighlightViewParams = {
    /** The canvas monomers that will be replaced on drop. */
    monomers: BaseMonomer[];
};
/**
 * Draws a single smooth path that outlines the whole group of monomers that
 * will be replaced by a drag-drop (a full preset, a subset of it, or one
 * monomer).
 *
 * Each monomer renderer owns the path that outlines its body (via
 * `getHighlightPath`). This view collects those paths, adds a capsule path
 * along every bond internal to the highlighted set, and uses Paper.js boolean
 * union to produce one continuous path that hugs each shape and flows smoothly
 * across the necks — without SVG filters or sampled SDF contouring.
 */
export declare class ReplacementHighlightView extends TransientView {
    static readonly viewName = "ReplacementHighlightView";
    /**
     * Collects each monomer's own highlight path plus a neck path along every
     * bond internal to the highlighted set (bonds to unaffected neighbours are
     * left open, so the outline reflects exactly what will be replaced).
     */
    private static collectPathData;
    private static getUnitedPathData;
    static show(transientLayer: D3SvgElementSelection<SVGGElement, void>, params: ReplacementHighlightViewParams): void;
}
