/**
 * SVG path primitives used to describe a monomer's replacement-highlight
 * silhouette.
 *
 * Each monomer renderer owns the path that best matches its body:
 *   – hexagon for peptides
 *   – pentagon for unsplit nucleotides
 *   – rectangle for sugars/CHEM
 *   – diamond for RNA bases
 *   – circle for phosphates
 * `ReplacementHighlightView` collects those paths, adds capsule paths for
 * internal bonds, and combines everything with Paper.js boolean union.
 */
export type Point = {
    x: number;
    y: number;
};
export type HighlightPathData = string;
export declare const createRectHighlightPath: (center: Point, width: number, height: number, offset?: number) => HighlightPathData;
export declare const createCircleHighlightPath: (center: Point, radius: number, offset?: number) => HighlightPathData;
/**
 * Flat-top hexagon path matching the Peptide monomer body shape.
 *
 * Six vertices: two horizontal tips (left/right) and four flat-edge corners
 * (top-left, top-right, bottom-right, bottom-left). `HEXAGON_INNER_X_RATIO`
 * encodes how far the flat corners indent from the left/right extremes, taken
 * directly from the peptide SVG symbol (see constant definition above).
 */
export declare const createHexagonHighlightPath: (center: Point, width: number, height: number, offset?: number) => HighlightPathData;
/**
 * Pentagon path matching the UnsplitNucleotide monomer body shape: a flat
 * bottom edge with two upper angled sides converging at a single top tip.
 *
 * All shape ratios are module-level constants derived from the nucleotide SVG
 * symbol (see PENTAGON_* constant definitions above).
 */
export declare const createNucleotideHighlightPath: (center: Point, width: number, height: number, offset?: number) => HighlightPathData;
export declare const createDiamondHighlightPath: (center: Point, width: number, height: number, offset?: number) => HighlightPathData;
/** A capsule path used to bridge two monomers along an internal polymer bond. */
export declare const createSegmentHighlightPath: (start: Point, end: Point, halfWidth: number) => HighlightPathData;
